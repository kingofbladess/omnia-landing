import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteLead, setUserRole, updateLeadStatus } from "@/app/actions";
import { updateMeetingStatus } from "@/app/admin/actions";
import { Badge } from "@/components/portal";
import { MEETING_STATUS, fmtDateTime } from "@/lib/portal";
import { AppShell, NotConfigured } from "@/components/AppShell";
import { AutoSubmitSelect, ConfirmButton } from "@/components/AutoSubmitSelect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Panel de administración", robots: { index: false } };

const STATUSES = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "cerrado", label: "Cerrado" },
];

type Lead = { id: string; name: string; email: string; company: string | null; phone: string | null; message: string; status: string; created_at: string };
type Profile = { id: string; email: string; full_name: string | null; role: string; created_at: string };

export default async function Admin({ searchParams }: { searchParams: Promise<{ estado?: string; tab?: string }> }) {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/acceso?next=/admin");
  if (profile?.role !== "admin") redirect("/cuenta");

  const { estado, tab = "leads" } = await searchParams;
  const filter = STATUSES.some((s) => s.value === estado) ? estado : undefined;

  let leadsQuery = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(200);
  if (filter) leadsQuery = leadsQuery.eq("status", filter);

  const [{ data: leads }, { data: users }, { count: total }, { count: nuevos }, { data: meetings }] = await Promise.all([
    leadsQuery,
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "nuevo"),
    supabase.from("meetings").select("id, topic, starts_at, status, user_id").order("starts_at", { ascending: false }).limit(200),
  ]);
  const pendingMeetings = (meetings ?? []).filter((m) => m.status === "solicitada").length;
  const userName = (id: string) => {
    const u = (users ?? []).find((x: Profile) => x.id === id) as Profile | undefined;
    return u?.full_name || u?.email || "Cliente";
  };

  const kpis = [
    { k: "Solicitudes", v: total ?? 0 },
    { k: "Sin atender", v: nuevos ?? 0 },
    { k: "Reuniones por confirmar", v: pendingMeetings },
    { k: "Usuarios", v: users?.length ?? 0 },
  ];

  const tabCls = (on: boolean) => `rounded-full px-4 py-1.5 text-sm transition-colors ${on ? "bg-accent text-white" : "text-muted hover:text-fg"}`;

  return (
    <AppShell isAdmin active="admin">
      <h1 className="pt-6 font-display text-3xl font-semibold text-fg sm:text-4xl">Panel de administración</h1>

      <dl className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.k} className="glass rounded-2xl p-5">
            <dt className="text-xs uppercase tracking-[0.14em] text-muted">{k.k}</dt>
            <dd className="mt-2 font-display text-3xl font-semibold text-fg tabular-nums">{k.v}</dd>
          </div>
        ))}
      </dl>

      <div className="glass-pill mt-10 inline-flex rounded-full p-1">
        <Link href="/admin?tab=leads" className={tabCls(tab !== "usuarios" && tab !== "reuniones")}>
          Solicitudes
        </Link>
        <Link href="/admin?tab=reuniones" className={tabCls(tab === "reuniones")}>
          Reuniones{pendingMeetings ? ` (${pendingMeetings})` : ""}
        </Link>
        <Link href="/admin?tab=usuarios" className={tabCls(tab === "usuarios")}>
          Usuarios
        </Link>
      </div>

      {tab === "reuniones" ? (
        <section className="glass mt-6 rounded-[1.75rem] p-6">
          {meetings && meetings.length > 0 ? (
            <ul className="space-y-2">
              {meetings.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-4 py-3">
                  <span className="min-w-0">
                    <span className="block text-sm text-fg">{m.topic}</span>
                    <span className="block text-xs text-muted">
                      {fmtDateTime(m.starts_at)} ·{" "}
                      <Link href={`/admin/usuarios/${m.user_id}`} className="text-accent-2 hover:underline">
                        {userName(m.user_id)}
                      </Link>
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Badge className={MEETING_STATUS[m.status]?.cls}>{MEETING_STATUS[m.status]?.label}</Badge>
                    <form action={updateMeetingStatus}>
                      <input type="hidden" name="id" value={m.id} />
                      <AutoSubmitSelect
                        name="status"
                        defaultValue={m.status}
                        label={`Estado de ${m.topic}`}
                        options={Object.entries(MEETING_STATUS).map(([value, s]) => ({ value, label: s.label }))}
                      />
                    </form>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No hay reuniones solicitadas.</p>
          )}
        </section>
      ) : tab !== "usuarios" ? (
        <section className="mt-6">
          <div className="mb-4 flex flex-wrap gap-2 text-xs">
            <Link href="/admin" className={`rounded-full border px-3 py-1 ${!filter ? "border-accent text-fg" : "border-line text-muted"}`}>
              Todas
            </Link>
            {STATUSES.map((s) => (
              <Link
                key={s.value}
                href={`/admin?estado=${s.value}`}
                className={`rounded-full border px-3 py-1 ${filter === s.value ? "border-accent text-fg" : "border-line text-muted"}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
          {leads && leads.length > 0 ? (
            <ul className="space-y-3">
              {(leads as Lead[]).map((l) => (
                <li key={l.id} className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-fg">
                        {l.name}
                        {l.company && <span className="text-muted"> · {l.company}</span>}
                      </p>
                      <p className="mt-1 text-sm text-muted">
                        <a href={`mailto:${l.email}`} className="text-accent-2 hover:underline">
                          {l.email}
                        </a>
                        {l.phone && <> · {l.phone}</>} · {new Date(l.created_at).toLocaleString("es-VE")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <form action={updateLeadStatus}>
                        <input type="hidden" name="id" value={l.id} />
                        <AutoSubmitSelect name="status" defaultValue={l.status} options={STATUSES} label={`Estado de ${l.name}`} />
                      </form>
                      <form action={deleteLead}>
                        <input type="hidden" name="id" value={l.id} />
                        <ConfirmButton message="¿Eliminar esta solicitud?" className="rounded-lg border border-line px-2 py-1.5 text-xs text-muted hover:border-[#ff8a8a] hover:text-[#ff8a8a]">
                          Eliminar
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-relaxed text-fg/90">{l.message}</p>
                  <Link href={`/admin/solicitudes/${l.id}`} className="mt-3 inline-block text-sm text-accent-2 hover:underline">
                    Abrir conversación →
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="glass rounded-2xl p-6 text-sm text-muted">No hay solicitudes{filter ? " con ese estado" : ""}.</p>
          )}
        </section>
      ) : (
        <section className="glass mt-6 overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-line bg-white/[0.02] text-xs uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Usuario</th>
                <th className="px-4 py-3 font-medium">Registro</th>
                <th className="px-4 py-3 font-medium">Rol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {((users ?? []) as Profile[]).map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/usuarios/${u.id}`} className="block text-fg hover:text-accent-2">
                      {u.full_name || "—"} <span className="text-xs text-accent-2">→ ficha</span>
                    </Link>
                    <span className="block text-xs text-muted">{u.email}</span>
                  </td>
                  <td className="px-4 py-3 text-muted">{new Date(u.created_at).toLocaleDateString("es-VE")}</td>
                  <td className="px-4 py-3">
                    {u.id === user.id ? (
                      <span className="text-xs text-muted">Administrador (tú)</span>
                    ) : (
                      <form action={setUserRole}>
                        <input type="hidden" name="id" value={u.id} />
                        <AutoSubmitSelect
                          name="role"
                          defaultValue={u.role}
                          label={`Rol de ${u.email}`}
                          options={[
                            { value: "user", label: "Usuario" },
                            { value: "admin", label: "Administrador" },
                          ]}
                        />
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </AppShell>
  );
}
