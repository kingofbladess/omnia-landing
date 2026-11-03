import type { Metadata } from "next";
import Link from "next/link";
import { markAllRead } from "@/app/cuenta/actions";
import { AppShell } from "@/components/AppShell";
import { Empty, PageHeader, Panel, btnGhostCls } from "@/components/portal";
import { fmtDateTime } from "@/lib/portal";
import { pageUser } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Notificaciones", robots: { index: false } };

export default async function Notificaciones() {
  const { supabase, profile } = await pageUser("/cuenta/notificaciones");
  const { data: notes } = await supabase.from("notifications").select("id, title, body, link, read_at, created_at").order("created_at", { ascending: false }).limit(100);
  const unread = (notes ?? []).filter((n) => !n.read_at).length;

  return (
    <AppShell isAdmin={profile?.role === "admin"} active="cuenta">
      <PageHeader
        kicker="Avisos"
        title="Notificaciones"
        text="Te avisamos cuando una solicitud cambia de estado, recibes un mensaje, se confirma una reunión o hay un documento nuevo."
        action={
          unread > 0 ? (
            <form action={markAllRead}>
              <button className={btnGhostCls}>Marcar todo como leído ({unread})</button>
            </form>
          ) : undefined
        }
      />
      <Panel className="mt-8">
        {notes && notes.length > 0 ? (
          <ul className="divide-y divide-[var(--glass-border)]">
            {notes.map((n) => (
              <li key={n.id}>
                <Link href={n.link || "/cuenta"} className="flex gap-4 py-4 transition-colors first:pt-0 hover:opacity-90">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-white/15" : "bg-accent-2 shadow-[0_0_10px_rgba(0,209,255,0.8)]"}`} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm ${n.read_at ? "text-muted" : "text-fg"}`}>{n.title}</span>
                    {n.body && <span className="mt-0.5 block text-sm text-muted">{n.body}</span>}
                  </span>
                  <time className="shrink-0 text-xs text-muted" dateTime={n.created_at}>
                    {fmtDateTime(n.created_at)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="Sin notificaciones" text="Aquí aparecerán los avisos sobre tus solicitudes, reuniones y documentos." />
        )}
      </Panel>
    </AppShell>
  );
}
