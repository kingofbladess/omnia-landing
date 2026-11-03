import type { Metadata } from "next";
import Link from "next/link";
import { deleteConfig, sendConfigAsLead } from "@/app/cuenta/actions";
import { AppShell } from "@/components/AppShell";
import { ConfirmButton } from "@/components/AutoSubmitSelect";
import { Badge, Empty, PageHeader, Panel, btnCls, btnGhostCls } from "@/components/portal";
import { fmtDate, type RackConfig } from "@/lib/portal";
import { pageUser } from "@/lib/supabase/guards";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Configuraciones", robots: { index: false } };

export default async function Configuraciones({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const { supabase, user, profile } = await pageUser("/cuenta/configuraciones");
  const { data: configs } = await supabase.from("saved_configs").select("id, name, data, created_at").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <AppShell isAdmin={profile?.role === "admin"} active="cuenta" tab="/cuenta/configuraciones">
      <PageHeader
        kicker="Estimador"
        title="Configuraciones guardadas"
        text="Las infraestructuras que calculaste en el estimador. Compáralas y envía la que prefieras como solicitud."
        action={
          <Link href="/#infraestructura" className={btnGhostCls}>
            Abrir el estimador
          </Link>
        }
      />
      {error && <p className="mt-4 text-sm text-[#ff8a8a]">No se pudo enviar la solicitud. Inténtalo de nuevo en unos minutos.</p>}

      {configs && configs.length > 0 ? (
        <ul className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {configs.map((c) => {
            const d = c.data as RackConfig;
            return (
              <li key={c.id} className="glass flex flex-col rounded-[1.75rem] p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-fg">{c.name}</p>
                    <p className="text-xs text-muted">Guardada el {fmtDate(c.created_at)}</p>
                  </div>
                  <Badge className="bg-accent/15 text-accent-2">{d.tier}</Badge>
                </div>
                <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Servidores", d.servers],
                    ["Racks", d.racks],
                    ["Consumo", `${Number(d.kw).toFixed(1)} kW`],
                  ].map(([k, v]) => (
                    <div key={String(k)} className="rounded-xl border border-[var(--glass-border)] bg-white/[0.03] px-2 py-3">
                      <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">{k}</dt>
                      <dd className="mt-1 font-display text-base text-fg tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <ul className="mt-4 flex flex-wrap gap-1.5 text-[11px]">
                  {d.redundancy && <Badge>Redundancia N+1</Badge>}
                  {d.gpu && <Badge>GPU para IA</Badge>}
                  {d.cloud && <Badge>Respaldo cloud</Badge>}
                </ul>
                <div className="mt-auto flex flex-wrap gap-2 pt-6">
                  <form action={sendConfigAsLead}>
                    <input type="hidden" name="id" value={c.id} />
                    <button className={btnCls}>Enviar como solicitud</button>
                  </form>
                  <form action={deleteConfig}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmButton message="¿Eliminar esta configuración?" className={btnGhostCls}>
                      Eliminar
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <Panel className="mt-8">
          <Empty
            title="No tienes configuraciones guardadas"
            text="En el estimador de la página principal, ajusta tus servidores y pulsa «Guardar en mi cuenta»."
            href="/#infraestructura"
            cta="Ir al estimador"
          />
        </Panel>
      )}
    </AppShell>
  );
}
