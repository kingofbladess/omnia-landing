import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Empty, PageHeader, Panel } from "@/components/portal";
import { fmtDate, fmtSize } from "@/lib/portal";
import { pageUser } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Documentos", robots: { index: false } };

export default async function Documentos() {
  const { supabase, user, profile } = await pageUser("/cuenta/documentos");
  const { data: docs } = await supabase.from("documents").select("id, name, size, created_at").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <AppShell isAdmin={profile?.role === "admin"} active="cuenta" tab="/cuenta/documentos">
      <PageHeader kicker="Archivo" title="Documentos" text="Propuestas, contratos y facturas que OMNIA comparte contigo. Solo tú puedes verlos." />
      <Panel className="mt-8">
        {docs && docs.length > 0 ? (
          <ul className="divide-y divide-[var(--glass-border)]">
            {docs.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] bg-accent/10 text-accent-2">
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" />
                    </svg>
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm text-fg">{d.name}</span>
                    <span className="block text-xs text-muted">
                      {fmtDate(d.created_at)}
                      {d.size ? ` · ${fmtSize(d.size)}` : ""}
                    </span>
                  </span>
                </div>
                {/* La descarga pasa por el servidor, que genera un enlace temporal de 60 segundos */}
                <a href={`/cuenta/documentos/${d.id}`} className="rounded-full border border-[var(--glass-border)] px-4 py-2 text-sm text-fg transition-colors hover:bg-white/[0.06]">
                  Descargar
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="Aún no hay documentos" text="Cuando el equipo de OMNIA comparta una propuesta o factura contigo, aparecerá aquí y recibirás un aviso." />
        )}
      </Panel>
    </AppShell>
  );
}
