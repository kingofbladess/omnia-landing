import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { LeadBadge, LeadProgress, PageHeader, Panel } from "@/components/portal";
import { MessageForm } from "@/components/PortalForms";
import { UUID_RE, fmtDate, fmtDateTime } from "@/lib/portal";
import { pageUser } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Solicitud", robots: { index: false } };

export default async function Solicitud({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, user, profile } = await pageUser(`/cuenta/solicitudes/${id}`);

  const [{ data: lead }, { data: messages }] = await Promise.all([
    supabase.from("leads").select("id, message, status, created_at, company").eq("id", id).eq("user_id", user.id).maybeSingle(),
    supabase.from("lead_messages").select("id, body, is_staff, created_at").eq("lead_id", id).order("created_at"),
  ]);
  if (!lead) notFound();

  return (
    <AppShell isAdmin={profile?.role === "admin"} active="cuenta" tab="/cuenta">
      <Link href="/cuenta" className="mt-4 inline-block text-sm text-muted hover:text-fg">
        ← Volver al resumen
      </Link>
      <PageHeader kicker={`Solicitud del ${fmtDate(lead.created_at)}`} title="Detalle de la solicitud" action={<LeadBadge status={lead.status} />} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Panel title="Lo que nos pediste">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg/90">{lead.message}</p>
          <div className="mt-6">
            <LeadProgress status={lead.status} />
          </div>
          <Link href="/cuenta/reuniones" className="mt-6 inline-block text-sm text-accent-2 hover:underline">
            Agendar una reunión sobre esta solicitud →
          </Link>
        </Panel>

        <Panel title="Conversación" text="Te avisaremos en la campana cuando el especialista responda.">
          {messages && messages.length > 0 ? (
            <ol className="mb-6 space-y-3">
              {messages.map((m) => (
                <li key={m.id} className={`flex ${m.is_staff ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.is_staff ? "rounded-tl-md border border-[var(--glass-border)] bg-white/[0.05] text-fg" : "rounded-tr-md bg-accent/80 text-white"
                    }`}
                  >
                    <p className="mb-1 text-[10px] uppercase tracking-[0.14em] opacity-70">
                      {m.is_staff ? "OMNIA" : "Tú"} · {fmtDateTime(m.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mb-6 text-sm text-muted">Todavía no hay mensajes. Un especialista te escribirá aquí; también puedes adelantarte.</p>
          )}
          {lead.status === "cerrado" ? (
            <p className="rounded-xl border border-[var(--glass-border)] px-4 py-3 text-sm text-muted">
              Esta solicitud está cerrada. Si necesitas algo más,{" "}
              <Link href="/#contacto" className="text-accent-2 hover:underline">
                envía una nueva
              </Link>
              .
            </p>
          ) : (
            <MessageForm leadId={lead.id} />
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
