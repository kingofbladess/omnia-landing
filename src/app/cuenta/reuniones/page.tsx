import type { Metadata } from "next";
import { cancelMeeting } from "@/app/cuenta/actions";
import { AppShell } from "@/components/AppShell";
import { ConfirmButton } from "@/components/AutoSubmitSelect";
import { Badge, Empty, PageHeader, Panel, btnGhostCls } from "@/components/portal";
import { MeetingForm } from "@/components/PortalForms";
import { MEETING_STATUS, fmtDate, fmtDateTime } from "@/lib/portal";
import { pageUser } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Reuniones", robots: { index: false } };

export default async function Reuniones() {
  const { supabase, user, profile } = await pageUser("/cuenta/reuniones");
  const [{ data: meetings }, { data: leads }] = await Promise.all([
    supabase.from("meetings").select("id, topic, starts_at, status").eq("user_id", user.id).order("starts_at", { ascending: false }),
    supabase.from("leads").select("id, message, created_at").eq("user_id", user.id).neq("status", "cerrado").order("created_at", { ascending: false }).limit(20),
  ]);
  const now = Date.now();

  return (
    <AppShell isAdmin={profile?.role === "admin"} active="cuenta" tab="/cuenta/reuniones">
      <PageHeader kicker="Agenda" title="Reuniones" text="Pide una reunión con un especialista. Te avisaremos cuando la confirmemos." />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Agendar una reunión" text="Lunes a viernes, de 8:00 a 17:00 (hora de Venezuela).">
          <MeetingForm leads={(leads ?? []).map((l) => ({ id: l.id, label: `${fmtDate(l.created_at)} · ${l.message.slice(0, 50)}${l.message.length > 50 ? "…" : ""}` }))} />
        </Panel>
        <Panel title="Mis reuniones">
          {meetings && meetings.length > 0 ? (
            <ul className="space-y-3">
              {meetings.map((m) => {
                const past = new Date(m.starts_at).getTime() < now;
                const st = MEETING_STATUS[m.status];
                return (
                  <li key={m.id} className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--glass-border)] bg-white/[0.03] p-4 ${past ? "opacity-60" : ""}`}>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-fg">{m.topic}</p>
                      <p className="text-xs text-muted">
                        {fmtDateTime(m.starts_at)}
                        {past ? " · pasada" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={st?.cls}>{st?.label ?? m.status}</Badge>
                      {!past && m.status !== "cancelada" && (
                        <form action={cancelMeeting}>
                          <input type="hidden" name="id" value={m.id} />
                          <ConfirmButton message="¿Cancelar esta reunión?" className={`${btnGhostCls} !px-3 !py-1 text-xs`}>
                            Cancelar
                          </ConfirmButton>
                        </form>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty title="No tienes reuniones" text="Usa el formulario para pedir la primera." />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
