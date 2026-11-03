import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Derecho de acceso: descarga en JSON todo lo que guardamos sobre el usuario. */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/acceso?next=/cuenta/ajustes", request.url));

  const [profile, leads, configs, meetings, documents, services, notifications] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("leads").select("id, name, email, company, phone, message, status, created_at").eq("user_id", user.id),
    supabase.from("saved_configs").select("name, data, created_at").eq("user_id", user.id),
    supabase.from("meetings").select("topic, starts_at, status, created_at").eq("user_id", user.id),
    supabase.from("documents").select("name, size, created_at").eq("user_id", user.id),
    supabase.from("services").select("name, kind, status, uptime, notes, created_at").eq("user_id", user.id),
    supabase.from("notifications").select("title, body, read_at, created_at").eq("user_id", user.id),
  ]);
  const leadIds = (leads.data ?? []).map((l) => l.id);
  const messages = leadIds.length
    ? await supabase.from("lead_messages").select("lead_id, body, is_staff, created_at").in("lead_id", leadIds).order("created_at")
    : { data: [] };

  const payload = {
    exportado: new Date().toISOString(),
    cuenta: { id: user.id, correo: user.email, creada: user.created_at, ultimo_acceso: user.last_sign_in_at },
    perfil: profile.data,
    solicitudes: (leads.data ?? []).map((l) => ({ ...l, mensajes: (messages.data ?? []).filter((m) => m.lead_id === l.id) })),
    configuraciones: configs.data ?? [],
    reuniones: meetings.data ?? [],
    documentos: documents.data ?? [],
    servicios: services.data ?? [],
    notificaciones: notifications.data ?? [],
  };

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="omnia-mis-datos-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
