"use server";

import { revalidatePath } from "next/cache";
import type { FormState } from "@/app/actions";
import { SERVICE_KINDS, SERVICE_STATUS, UUID_RE } from "@/lib/portal";
import { requireAdmin } from "@/lib/supabase/guards";

const field = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

/** El equipo de OMNIA responde en el hilo de una solicitud (el cliente recibe un aviso). */
export async function replyLead(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase, user } = await requireAdmin();
  const leadId = field(form, "lead_id");
  const body = field(form, "body");
  if (!UUID_RE.test(leadId)) return { ok: false, message: "Solicitud no válida." };
  if (body.length < 1 || body.length > 4000) return { ok: false, message: "Escribe un mensaje (máx. 4000 caracteres)." };
  const { error } = await supabase.from("lead_messages").insert({ lead_id: leadId, author_id: user.id, is_staff: true, body });
  if (error) return { ok: false, message: "No se pudo enviar." };
  revalidatePath(`/admin/solicitudes/${leadId}`);
  return { ok: true, message: "Respuesta enviada al cliente." };
}

export async function updateMeetingStatus(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id");
  const status = field(form, "status");
  if (!UUID_RE.test(id) || !["solicitada", "confirmada", "cancelada"].includes(status)) return;
  await supabase.from("meetings").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function addService(_prev: FormState, form: FormData): Promise<FormState> {
  const { supabase } = await requireAdmin();
  const userId = field(form, "user_id");
  const name = field(form, "name");
  const kind = field(form, "kind");
  const uptimeRaw = field(form, "uptime");
  const uptime = uptimeRaw ? Number(uptimeRaw.replace(",", ".")) : null;
  if (!UUID_RE.test(userId)) return { ok: false, message: "Cliente no válido." };
  if (name.length < 1 || name.length > 120) return { ok: false, message: "Escribe el nombre del servicio." };
  if (!(kind in SERVICE_KINDS)) return { ok: false, message: "Tipo no válido." };
  if (uptime !== null && (Number.isNaN(uptime) || uptime < 0 || uptime > 100)) return { ok: false, message: "El uptime va de 0 a 100." };
  const { error } = await supabase.from("services").insert({ user_id: userId, name, kind, uptime, notes: field(form, "notes").slice(0, 500) || null });
  if (error) return { ok: false, message: "No se pudo guardar." };
  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: true, message: "Servicio agregado." };
}

export async function updateService(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id");
  const status = field(form, "status");
  if (!UUID_RE.test(id) || !(status in SERVICE_STATUS)) return;
  await supabase.from("services").update({ status }).eq("id", id);
  revalidatePath("/admin", "layout");
}

export async function deleteService(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id");
  if (!UUID_RE.test(id)) return;
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin", "layout");
}

/** Registra un archivo que el admin ya subió a Storage (documents/<cliente>/...). */
export async function registerDocument(userId: string, path: string, name: string, size: number): Promise<FormState> {
  const { supabase } = await requireAdmin();
  if (!UUID_RE.test(userId) || !path.startsWith(`${userId}/`) || path.includes("..")) return { ok: false, message: "Ruta no válida." };
  const { error } = await supabase.from("documents").insert({ user_id: userId, path, name: name.slice(0, 200), size });
  if (error) {
    await supabase.storage.from("documents").remove([path]);
    return { ok: false, message: "No se pudo registrar el documento." };
  }
  revalidatePath(`/admin/usuarios/${userId}`);
  return { ok: true, message: "Documento subido. El cliente recibió un aviso." };
}

export async function deleteDocument(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = field(form, "id");
  if (!UUID_RE.test(id)) return;
  const { data: doc } = await supabase.from("documents").select("path, user_id").eq("id", id).single();
  if (!doc) return;
  await supabase.storage.from("documents").remove([doc.path]);
  await supabase.from("documents").delete().eq("id", id);
  revalidatePath(`/admin/usuarios/${doc.user_id}`);
}
