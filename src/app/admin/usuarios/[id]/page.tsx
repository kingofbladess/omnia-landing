import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteDocument, deleteService, updateMeetingStatus, updateService } from "@/app/admin/actions";
import { AppShell } from "@/components/AppShell";
import { AutoSubmitSelect, ConfirmButton } from "@/components/AutoSubmitSelect";
import { Badge, Empty, LeadBadge, PageHeader, Panel, btnGhostCls } from "@/components/portal";
import { DocumentUpload, ServiceForm } from "@/components/PortalForms";
import { MEETING_STATUS, SERVICE_KINDS, SERVICE_STATUS, UUID_RE, fmtDate, fmtDateTime, fmtSize } from "@/lib/portal";
import { pageAdmin } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Cliente · Admin", robots: { index: false } };

const serviceOptions = Object.entries(SERVICE_STATUS).map(([value, s]) => ({ value, label: s.label }));
const meetingOptions = Object.entries(MEETING_STATUS).map(([value, s]) => ({ value, label: s.label }));

export default async function AdminUsuario({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase } = await pageAdmin(`/admin/usuarios/${id}`);

  const [{ data: p }, { data: leads }, { data: services }, { data: docs }, { data: meetings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("leads").select("id, message, status, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("services").select("*").eq("user_id", id).order("created_at"),
    supabase.from("documents").select("id, name, size, created_at").eq("user_id", id).order("created_at", { ascending: false }),
    supabase.from("meetings").select("id, topic, starts_at, status").eq("user_id", id).order("starts_at", { ascending: false }),
  ]);
  if (!p) notFound();

  const info = [
    ["Correo", p.email],
    ["Empresa", p.company],
    ["RIF", p.rif],
    ["Cargo", p.job_title],
    ["Teléfono", p.phone],
    ["Registro", fmtDate(p.created_at)],
  ];

  return (
    <AppShell isAdmin active="admin">
      <Link href="/admin?tab=usuarios" className="mt-4 inline-block text-sm text-muted hover:text-fg">
        ← Volver a usuarios
      </Link>
      <PageHeader kicker={p.role === "admin" ? "Administrador" : "Cliente"} title={p.full_name || p.email} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Panel title="Datos">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {info.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{k}</dt>
                  <dd className="mt-0.5 break-words text-fg">{v || "—"}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel title="Solicitudes">
            {leads && leads.length > 0 ? (
              <ul className="space-y-2">
                {leads.map((l) => (
                  <li key={l.id}>
                    <Link href={`/admin/solicitudes/${l.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-4 py-3 hover:bg-white/[0.06]">
                      <span className="min-w-0">
                        <span className="block truncate text-sm text-fg">{l.message}</span>
                        <span className="block text-xs text-muted">{fmtDate(l.created_at)}</span>
                      </span>
                      <LeadBadge status={l.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Sin solicitudes.</p>
            )}
          </Panel>

          <Panel title="Reuniones">
            {meetings && meetings.length > 0 ? (
              <ul className="space-y-2">
                {meetings.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-4 py-3">
                    <span className="min-w-0">
                      <span className="block text-sm text-fg">{m.topic}</span>
                      <span className="block text-xs text-muted">{fmtDateTime(m.starts_at)}</span>
                    </span>
                    <form action={updateMeetingStatus}>
                      <input type="hidden" name="id" value={m.id} />
                      <AutoSubmitSelect name="status" defaultValue={m.status} options={meetingOptions} label={`Estado de la reunión ${m.topic}`} />
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">Sin reuniones.</p>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Servicios activos" text="El cliente los ve en su resumen y recibe un aviso al crearlos o cambiar su estado.">
            {services && services.length > 0 && (
              <ul className="mb-6 space-y-2">
                {services.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-4 py-3">
                    <span className="min-w-0">
                      <span className="block text-sm text-fg">{s.name}</span>
                      <span className="block text-xs text-muted">
                        {SERVICE_KINDS[s.kind] ?? s.kind}
                        {s.uptime != null ? ` · ${Number(s.uptime).toFixed(2)}%` : ""}
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <form action={updateService}>
                        <input type="hidden" name="id" value={s.id} />
                        <AutoSubmitSelect name="status" defaultValue={s.status} options={serviceOptions} label={`Estado de ${s.name}`} />
                      </form>
                      <form action={deleteService}>
                        <input type="hidden" name="id" value={s.id} />
                        <ConfirmButton message="¿Eliminar este servicio?" className={`${btnGhostCls} !px-3 !py-1.5 text-xs`}>
                          Eliminar
                        </ConfirmButton>
                      </form>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <ServiceForm userId={p.id} />
          </Panel>

          <Panel title="Documentos" text="Propuestas, contratos o facturas. Solo este cliente y los administradores pueden verlos.">
            {docs && docs.length > 0 ? (
              <ul className="mb-6 space-y-2">
                {docs.map((d) => (
                  <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-4 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-fg">{d.name}</span>
                      <span className="block text-xs text-muted">
                        {fmtDate(d.created_at)} {d.size ? `· ${fmtSize(d.size)}` : ""}
                      </span>
                    </span>
                    <form action={deleteDocument}>
                      <input type="hidden" name="id" value={d.id} />
                      <ConfirmButton message="¿Eliminar este documento?" className={`${btnGhostCls} !px-3 !py-1.5 text-xs`}>
                        Eliminar
                      </ConfirmButton>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mb-6">
                <Empty title="Sin documentos" />
              </div>
            )}
            <DocumentUpload userId={p.id} />
          </Panel>
          <p className="text-xs text-muted">
            <Badge>Nota</Badge> Para cambiar el rol de este usuario, usa la pestaña Usuarios del panel.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
