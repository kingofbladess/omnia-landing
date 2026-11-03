"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireAdmin } from "@/lib/supabase/guards";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export type FormState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function field(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

/** Guarda una solicitud de contacto en la tabla "leads". */
export async function submitLead(_prev: FormState, form: FormData): Promise<FormState> {
  // Campo trampa para bots: si viene lleno, fingimos éxito y no guardamos nada.
  if (field(form, "website")) return { ok: true, message: "¡Gracias! Te contactaremos pronto." };

  const name = field(form, "name");
  const email = field(form, "email").toLowerCase();
  const company = field(form, "company");
  const phone = field(form, "phone");
  const message = field(form, "message");
  const consent = form.get("consent") === "on";

  if (name.length < 2) return { ok: false, message: "Escribe tu nombre." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "El correo no parece válido." };
  if (message.length < 10) return { ok: false, message: "Cuéntanos un poco más (mínimo 10 caracteres)." };
  if (message.length > 4000) return { ok: false, message: "El mensaje es demasiado largo." };
  if (!consent) return { ok: false, message: "Debes aceptar la Política de Privacidad." };

  if (!isSupabaseConfigured) {
    return { ok: false, message: "El formulario aún no está conectado a la base de datos. Escríbenos por correo." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("leads").insert({
    name: name.slice(0, 120),
    email: email.slice(0, 200),
    company: company.slice(0, 160) || null,
    phone: phone.slice(0, 40) || null,
    message,
    user_id: user?.id ?? null,
  });

  if (error?.message?.startsWith("rate_limit")) {
    return { ok: false, message: "Ya recibimos varias solicitudes tuyas hace poco. Te responderemos pronto; si es urgente, escríbenos por correo." };
  }
  if (error) {
    console.error("submitLead", error);
    return { ok: false, message: "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos." };
  }
  return { ok: true, message: "¡Gracias! Recibimos tu solicitud y te contactaremos pronto." };
}

export async function updateLeadStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id");
  const status = field(form, "status");
  if (!UUID_RE.test(id) || !["nuevo", "contactado", "cerrado"].includes(status)) return;
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteLead(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id");
  if (!UUID_RE.test(id)) return;
  await supabase.from("leads").delete().eq("id", id);
  revalidatePath("/admin");
}

export async function setUserRole(form: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = field(form, "id");
  const role = field(form, "role");
  if (!UUID_RE.test(id) || !["user", "admin"].includes(role)) return;
  // Evita que un admin se quite el rol a sí mismo por accidente y se quede fuera.
  if (id === user?.id && role !== "admin") return;
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin");
}

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { ok: false, message: "Tu sesión expiró." };
  const opt = (name: string, max: number) => field(form, name).slice(0, max) || null;
  const rif = opt("rif", 20)?.toUpperCase() ?? null;
  if (rif && !/^[VEJPG]-?\d{6,9}-?\d?$/.test(rif)) return { ok: false, message: "El RIF no parece válido (ej. J-50886695-9)." };
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: opt("full_name", 120),
      company: opt("company", 160),
      rif,
      phone: opt("phone", 40),
      job_title: opt("job_title", 120),
    })
    .eq("id", user.id);
  if (error) return { ok: false, message: "No se pudo guardar." };
  revalidatePath("/cuenta");
  return { ok: true, message: "Perfil actualizado." };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    // Si Supabase no puede cerrar la sesión en el servidor (token caducado, sin red…),
    // igual la cerramos en este navegador.
    const { error } = await supabase.auth.signOut();
    if (error) await supabase.auth.signOut({ scope: "local" });
    // Por si quedara alguna cookie de sesión, se borra a mano.
    const store = await cookies();
    for (const c of store.getAll()) if (c.name.startsWith("sb-")) store.delete(c.name);
  }
  // Que ninguna página guardada siga mostrando "Mi cuenta".
  revalidatePath("/", "layout");
  redirect("/?sesion=cerrada");
}
