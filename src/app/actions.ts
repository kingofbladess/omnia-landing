"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient, getCurrentUser } from "@/lib/supabase/server";

export type FormState = { ok: boolean; message: string } | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  if (error) {
    console.error("submitLead", error);
    return { ok: false, message: "No pudimos enviar tu mensaje. Inténtalo de nuevo en unos minutos." };
  }
  return { ok: true, message: "¡Gracias! Recibimos tu solicitud y te contactaremos pronto." };
}

async function requireAdmin() {
  const { supabase, user, profile } = await getCurrentUser();
  if (!user || profile?.role !== "admin") throw new Error("No autorizado");
  return { supabase, user };
}

export async function updateLeadStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id");
  const status = field(form, "status");
  if (!["nuevo", "contactado", "cerrado"].includes(status)) return;
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteLead(form: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from("leads").delete().eq("id", field(form, "id"));
  revalidatePath("/admin");
}

export async function setUserRole(form: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = field(form, "id");
  const role = field(form, "role");
  if (!["user", "admin"].includes(role)) return;
  // Evita que un admin se quite el rol a sí mismo por accidente y se quede fuera.
  if (id === user?.id && role !== "admin") return;
  await supabase.from("profiles").update({ role }).eq("id", id);
  revalidatePath("/admin");
}

export async function updateProfile(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await getCurrentUser();
  if (!user) return { ok: false, message: "Tu sesión expiró." };
  const fullName = field(form, "full_name").slice(0, 120);
  const { error } = await supabase.from("profiles").update({ full_name: fullName || null }).eq("id", user.id);
  if (error) return { ok: false, message: "No se pudo guardar." };
  revalidatePath("/cuenta");
  return { ok: true, message: "Perfil actualizado." };
}

export async function signOut() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
