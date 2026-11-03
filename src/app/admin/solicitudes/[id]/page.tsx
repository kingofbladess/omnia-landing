import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { updateLeadStatus } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { AutoSubmitSelect } from "@/components/AutoSubmitSelect";
import { LeadProgress, PageHeader, Panel } from "@/components/portal";
import { MessageForm } from "@/components/PortalForms";
import { UUID_RE, fmtDateTime } from "@/lib/portal";
import { pageAdmin } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Solicitud · Admin", robots: { index: false } };

const STATUSES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "cerrado", label: "Cerrado" },
];

export default async function AdminSolicitud({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase } = await pageAdmin(`/admin/solicitudes/${id}`);

  const [{ data: lead }, { data: messages }] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    supabase.from("lead_messages").select("id, body, is_staff, created_at").eq("lead_id", id).order("created_at"),
  ]);
  if (!lead) notFound();

  return (
    <AppShell isAdmin active="admin">
      <Link href="/admin" className="mt-4 inline-block text-sm text-muted hover:text-fg">
        ← Volver al panel
      </Link>
      <PageHeader
        kicker={fmtDateTime(lead.created_at)}
        title={lead.name}
        text={[lead.company, lead.email, lead.phone].filter(Boolean).join(" · ")}
        action={
          <form action={updateLeadStatus}>
            <input type="hidden" name="id" value={lead.id} />
            <AutoSubmitSelect name="status" defaultValue={lead.status} options={STATUSES} label="Estado de la solicitud" />
          </form>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Panel title="Mensaje original">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg/90">{lead.message}</p>
          <div className="mt-6">
            <LeadProgress status={lead.status} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <a href={`mailto:${lead.email}`} className="text-accent-2 hover:underline">
              Escribir por correo
            </a>
            {lead.user_id && (
              <Link href={`/admin/usuarios/${lead.user_id}`} className="text-accent-2 hover:underline">
                Ver ficha del cliente →
              </Link>
            )}
          </div>
        </Panel>

        <Panel
          title="Conversación"
          text={lead.user_id ? "El cliente recibe un aviso en su cuenta cuando respondes." : "Este cliente envió la solicitud sin cuenta: no verá los mensajes. Respóndele por correo."}
        >
          {messages && messages.length > 0 ? (
            <ol className="mb-6 space-y-3">
              {messages.map((m) => (
                <li key={m.id} className={`flex ${m.is_staff ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.is_staff ? "rounded-tr-md bg-accent/80 text-white" : "rounded-tl-md border border-[var(--glass-border)] bg-white/[0.05] text-fg"
                    }`}
                  >
                    <p className="mb-1 text-[10px] uppercase tracking-[0.14em] opacity-70">
                      {m.is_staff ? "OMNIA" : "Cliente"} · {fmtDateTime(m.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mb-6 text-sm text-muted">Sin mensajes todavía.</p>
          )}
          {lead.user_id && <MessageForm leadId={lead.id} staff />}
        </Panel>
      </div>
    </AppShell>
  );
}
