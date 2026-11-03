import type { Metadata } from "next";
import Link from "next/link";
import { AppShell, NotConfigured } from "@/components/AppShell";
import { Badge, Empty, LeadBadge, LeadProgress, Panel } from "@/components/portal";
import { MEETING_STATUS, SERVICE_KINDS, SERVICE_STATUS, TZ, fmtDate, fmtDateTime } from "@/lib/portal";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { pageUser } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

function greeting() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: TZ }));
  return h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches";
}

const quick = [
  { href: "/#contacto", label: "Nueva solicitud", desc: "Cuéntanos tu próximo proyecto.", icon: <path d="M12 5v14M5 12h14" /> },
  { href: "/cuenta/reuniones", label: "Agendar reunión", desc: "Elige día y hora con un especialista.", icon: <path d="M4 6h16v14H4zM4 10h16M9 3v4M15 3v4" /> },
  { href: "/#infraestructura", label: "Estimar infraestructura", desc: "Calcula y guarda una configuración.", icon: <path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h3" /> },
];

export default async function Cuenta() {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { supabase, user, profile } = await pageUser("/cuenta");

  const [{ data: leads }, { data: services }, { data: meetings }, { data: notes }] = await Promise.all([
    supabase.from("leads").select("id, message, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    supabase.from("services").select("id, name, kind, status, uptime, notes").eq("user_id", user.id).order("created_at"),
    supabase.from("meetings").select("id, topic, starts_at, status").eq("user_id", user.id).neq("status", "cancelada").gte("starts_at", new Date().toISOString()).order("starts_at").limit(3),
    supabase.from("notifications").select("id, title, body, link, read_at, created_at").order("created_at", { ascending: false }).limit(4),
  ]);
  const list = leads ?? [];

  const name = profile?.full_name?.trim() || "";
  const first = name.split(/\s+/)[0] || "";
  const initials = (name || user.email || "?").split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const isAdmin = profile?.role === "admin";
  const count = (s: string) => list.filter((l) => l.status === s).length;

  const kpis = [
    { k: "Solicitudes", v: list.length, d: "Enviadas desde tu cuenta" },
    { k: "En conversación", v: count("contactado"), d: "Con un especialista" },
    { k: "Servicios activos", v: (services ?? []).filter((s) => s.status === "activo").length, d: "Operados por OMNIA" },
    { k: "Miembro desde", v: profile?.created_at ? fmtDate(profile.created_at) : "—", d: isAdmin ? "Administrador" : "Cliente OMNIA" },
  ];

  return (
    <AppShell isAdmin={isAdmin} active="cuenta" tab="/cuenta">
      {/* Saludo */}
      <div className="flex flex-wrap items-center justify-between gap-6 pt-6">
        <div className="flex items-center gap-5">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-3 font-display text-xl font-semibold text-white shadow-[0_0_40px_-6px_rgba(61,123,255,0.7)]">
            {initials}
          </span>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-2">{greeting()}</p>
            <h1 className="mt-1 font-display text-3xl font-semibold capitalize text-fg sm:text-4xl">{first ? `Hola, ${first}` : "Hola"}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              {profile?.company ? `${profile.company} · ` : ""}
              {user.email}
              <Badge className="border border-[var(--glass-border)] bg-white/[0.04] text-fg">{isAdmin ? "Administrador" : "Cliente"}</Badge>
            </p>
          </div>
        </div>
        <Link href="/#contacto" className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(61,123,255,0.8)] transition hover:brightness-110">
          Nueva solicitud
        </Link>
      </div>

      {/* Resumen */}
      <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((m) => (
          <div key={m.k} className="glass rounded-2xl p-5">
            <dt className="text-[11px] uppercase tracking-[0.16em] text-muted">{m.k}</dt>
            <dd className="mt-2 font-display text-2xl font-semibold text-fg tabular-nums sm:text-3xl">{m.v}</dd>
            <dd className="mt-1 text-xs text-muted">{m.d}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {/* Solicitudes */}
          <Panel title="Mis solicitudes" text="Ábrelas para ver los mensajes del especialista y responder." action={<Link href="/#contacto" className="text-sm text-accent-2 hover:underline">Nueva</Link>}>
            {list.length > 0 ? (
              <ul className="space-y-3">
                {list.map((l) => (
                  <li key={l.id}>
                    <Link href={`/cuenta/solicitudes/${l.id}`} className="block rounded-2xl border border-[var(--glass-border)] bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]">
                      <div className="flex items-center justify-between gap-4 text-xs text-muted">
                        <time dateTime={l.created_at}>{fmtDate(l.created_at)}</time>
                        <LeadBadge status={l.status} />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-fg/90">{l.message}</p>
                      <div className="mt-4">
                        <LeadProgress status={l.status} />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="Aún no has enviado solicitudes" text="Cuando nos escribas con tu sesión iniciada, aparecerán aquí con su avance y sus mensajes." href="/#contacto" cta="Enviar mi primera solicitud" />
            )}
          </Panel>

          {/* Servicios activos */}
          <Panel title="Mis servicios" text="Estado de lo que OMNIA opera para ti.">
            {services && services.length > 0 ? (
              <ul className="grid gap-3 sm:grid-cols-2">
                {services.map((s) => (
                  <li key={s.id} className="rounded-2xl border border-[var(--glass-border)] bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-fg">{s.name}</p>
                        <p className="text-xs text-muted">{SERVICE_KINDS[s.kind] ?? s.kind}</p>
                      </div>
                      <Badge className={SERVICE_STATUS[s.status]?.cls}>{SERVICE_STATUS[s.status]?.label ?? s.status}</Badge>
                    </div>
                    {s.uptime != null && (
                      <div className="mt-4">
                        <div className="flex items-baseline justify-between text-xs text-muted">
                          <span>Disponibilidad</span>
                          <span className="font-display text-base text-fg tabular-nums">{Number(s.uptime).toFixed(2)}%</span>
                        </div>
                        <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-white/10">
                          <span className="block h-full rounded-full bg-gradient-to-r from-accent to-ok" style={{ width: `${Math.min(100, Number(s.uptime))}%` }} />
                        </span>
                      </div>
                    )}
                    {s.notes && <p className="mt-3 text-xs leading-relaxed text-muted">{s.notes}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="Sin servicios activos" text="Cuando contrates un servicio con OMNIA, verás aquí su estado y disponibilidad." />
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Accesos rápidos">
            <ul className="space-y-1.5">
              {quick.map((q) => (
                <li key={q.href}>
                  <Link href={q.href} className="group flex items-center gap-4 rounded-xl p-2.5 transition-colors hover:bg-white/[0.05]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-accent/10 text-accent-2 transition-colors group-hover:bg-accent group-hover:text-white">
                      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        {q.icon}
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-fg">{q.label}</span>
                      <span className="block truncate text-xs text-muted">{q.desc}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Próximas reuniones" action={<Link href="/cuenta/reuniones" className="text-sm text-accent-2 hover:underline">Ver todas</Link>}>
            {meetings && meetings.length > 0 ? (
              <ul className="space-y-2">
                {meetings.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-4 py-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-fg">{m.topic}</span>
                      <span className="block text-xs text-muted">{fmtDateTime(m.starts_at)}</span>
                    </span>
                    <Badge className={MEETING_STATUS[m.status]?.cls}>{MEETING_STATUS[m.status]?.label}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <Empty title="Sin reuniones próximas" href="/cuenta/reuniones" cta="Agendar una" />
            )}
          </Panel>

          <Panel title="Avisos recientes" action={<Link href="/cuenta/notificaciones" className="text-sm text-accent-2 hover:underline">Ver todos</Link>}>
            {notes && notes.length > 0 ? (
              <ul className="space-y-2">
                {notes.map((n) => (
                  <li key={n.id}>
                    <Link href={n.link || "/cuenta/notificaciones"} className="flex gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.05]">
                      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-white/15" : "bg-accent-2 shadow-[0_0_10px_rgba(0,209,255,0.8)]"}`} />
                      <span className="min-w-0">
                        <span className="block text-sm text-fg">{n.title}</span>
                        {n.body && <span className="block truncate text-xs text-muted">{n.body}</span>}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">No tienes avisos todavía.</p>
            )}
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
