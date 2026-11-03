"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { FormState } from "@/app/actions";
import { UUID_RE, configMessage, type RackConfig } from "@/lib/portal";
import { requireUser } from "@/lib/supabase/guards";

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

/** El cliente responde en el hilo de una de sus solicitudes. */
export async function sendLeadMessage(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const leadId = field(form, "lead_id");
  const body = field(form, "body");
  if (!UUID_RE.test(leadId)) return { ok: false, message: "Solicitud no válida." };
  if (body.length < 1) return { ok: false, message: "Escribe un mensaje." };
  if (body.length > 4000) return { ok: false, message: "El mensaje es demasiado largo." };
  const { error } = await supabase.from("lead_messages").insert({ lead_id: leadId, author_id: user.id, is_staff: false, body });
  if (error) return { ok: false, message: "No se pudo enviar el mensaje." };
  revalidatePath(`/cuenta/solicitudes/${leadId}`);
  return { ok: true, message: "Mensaje enviado." };
}

/** Convierte una configuración guardada del estimador en una solicitud. */
export async function sendConfigAsLead(form: FormData) {
  const { supabase, user, profile } = await requireUser();
  const id = field(form, "id");
  if (!UUID_RE.test(id)) return;
  const { data: cfg } = await supabase.from("saved_configs").select("data").eq("id", id).single();
  if (!cfg) return;
  const name = (profile?.full_name || user.email?.split("@")[0] || "Cliente").slice(0, 120).padEnd(2, ".");
  const { data: lead, error } = await supabase
    .from("leads")
    .insert({
      name,
      email: (user.email ?? "").slice(0, 200),
      company: profile?.company ?? null,
      phone: profile?.phone ?? null,
      message: configMessage(cfg.data as RackConfig),
      user_id: user.id,
    })
    .select("id")
    .single();
  if (error || !lead) redirect("/cuenta/configuraciones?error=envio");
  redirect(`/cuenta/solicitudes/${lead.id}`);
}

export async function deleteConfig(form: FormData) {
  const { supabase } = await requireUser();
  const id = field(form, "id");
  if (!UUID_RE.test(id)) return;
  await supabase.from("saved_configs").delete().eq("id", id);
  revalidatePath("/cuenta/configuraciones");
}

/** Pide una reunión en horario laboral de Venezuela (lunes a viernes, 8:00–17:00). */
export async function requestMeeting(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser();
  const date = field(form, "date");
  const time = field(form, "time");
  const topic = field(form, "topic");
  const leadId = field(form, "lead_id");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return { ok: false, message: "Elige fecha y hora." };
  if (topic.length < 3) return { ok: false, message: "Cuéntanos el tema de la reunión." };
  if (topic.length > 300) return { ok: false, message: "El tema es demasiado largo." };

  const startsAt = new Date(`${date}T${time}:00-04:00`); // hora de Caracas
  if (Number.isNaN(startsAt.getTime())) return { ok: false, message: "Fecha no válida." };
  if (startsAt.getTime() < Date.now() + 60 * 60 * 1000) return { ok: false, message: "Elige una hora con al menos 1 hora de anticipación." };
  if (startsAt.getTime() > Date.now() + 90 * 24 * 60 * 60 * 1000) return { ok: false, message: "Elige una fecha dentro de los próximos 90 días." };
  const local = new Date(startsAt.getTime() - 4 * 60 * 60 * 1000); // fecha/hora vistas en Caracas
  const day = local.getUTCDay();
  const hour = local.getUTCHours();
  if (day === 0 || day === 6) return { ok: false, message: "Atendemos de lunes a viernes." };
  if (hour < 8 || hour >= 17) return { ok: false, message: "Elige una hora entre 8:00 y 17:00." };

  const { error } = await supabase.from("meetings").insert({
    user_id: user.id,
    starts_at: startsAt.toISOString(),
    topic,
    lead_id: UUID_RE.test(leadId) ? leadId : null,
  });
  if (error) return { ok: false, message: "No se pudo agendar. Puedes tener hasta 5 reuniones pendientes." };
  revalidatePath("/cuenta/reuniones");
  return { ok: true, message: "Reunión solicitada. Te avisaremos cuando la confirmemos." };
}

export async function cancelMeeting(form: FormData) {
  const { supabase } = await requireUser();
  const id = field(form, "id");
  if (!UUID_RE.test(id)) return;
  await supabase.from("meetings").update({ status: "cancelada" }).eq("id", id);
  revalidatePath("/cuenta/reuniones");
}

export async function markAllRead() {
  const { supabase, user } = await requireUser();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/cuenta", "layout");
}

/** Elimina la cuenta y todos sus datos (derecho de supresión). */
export async function deleteAccount(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await requireUser();
  if (field(form, "confirm") !== "ELIMINAR") return { ok: false, message: "Escribe ELIMINAR para confirmar." };

  // 1) Archivos del cliente en Storage
  const { data: files } = await supabase.storage.from("documents").list(user.id, { limit: 1000 });
  if (files?.length) await supabase.storage.from("documents").remove(files.map((f) => `${user.id}/${f.name}`));

  // 2) Datos y usuario (la base de datos borra en cascada perfil, mensajes, reuniones, etc.)
  const { error } = await supabase.rpc("delete_my_account");
  if (error) {
    console.error("deleteAccount", error);
    return { ok: false, message: "No se pudo eliminar la cuenta. Escríbenos y lo hacemos por ti." };
  }
  await supabase.auth.signOut();
  redirect("/?cuenta=eliminada");
}
