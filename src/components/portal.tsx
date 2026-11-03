import Link from "next/link";
import { LEAD_STAGES } from "@/lib/portal";

/** Piezas visuales compartidas del área de clientes y del panel de administración. */

export function PageHeader({ kicker, title, text, action }: { kicker?: string; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 pt-6">
      <div>
        {kicker && <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-2">{kicker}</p>}
        <h1 className="mt-1 font-display text-3xl font-semibold text-fg sm:text-4xl">{title}</h1>
        {text && <p className="mt-2 max-w-2xl text-sm text-muted">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, text, action, children, className = "" }: { title?: string; text?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`glass rounded-[1.75rem] p-6 sm:p-7 ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-lg font-semibold text-fg">{title}</h2>}
            {text && <p className="mt-1 text-xs text-muted">{text}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ children, className = "bg-white/[0.06] text-fg" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] ${className}`}>{children}</span>;
}

export function Empty({ title, text, href, cta }: { title: string; text?: string; href?: string; cta?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--glass-border)] p-8 text-center">
      <p className="font-display text-base text-fg">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{text}</p>}
      {href && cta && (
        <Link href={href} className="mt-5 inline-block rounded-full border border-[var(--glass-border)] px-4 py-2 text-sm text-fg hover:bg-white/[0.06]">
          {cta}
        </Link>
      )}
    </div>
  );
}

export function leadStep(status: string) {
  return Math.max(0, LEAD_STAGES.findIndex((s) => s.id === status));
}

export function LeadBadge({ status }: { status: string }) {
  const step = leadStep(status);
  const cls = step === 2 ? "bg-ok/15 text-ok" : step === 1 ? "bg-accent-2/15 text-accent-2" : "bg-white/[0.06] text-fg";
  return <Badge className={cls}>{LEAD_STAGES[step].label}</Badge>;
}

/** Barra de avance: Recibida → En conversación → Cerrada. */
export function LeadProgress({ status }: { status: string }) {
  const step = leadStep(status);
  return (
    <ol className="grid grid-cols-3 gap-2" aria-label={`Avance: ${LEAD_STAGES[step].label}`}>
      {LEAD_STAGES.map((s, i) => (
        <li key={s.id}>
          <span className={`block h-1 rounded-full ${i <= step ? "bg-gradient-to-r from-accent to-accent-2" : "bg-white/10"}`} />
          <span className={`mt-1.5 block text-[10px] uppercase tracking-[0.14em] ${i <= step ? "text-fg" : "text-muted/70"}`}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export const inputCls =
  "w-full rounded-xl border border-[var(--glass-border)] bg-white/[0.04] px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-accent focus:bg-white/[0.06]";
export const btnCls = "rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50";
export const btnGhostCls = "rounded-full border border-[var(--glass-border)] px-4 py-2 text-sm text-fg transition-colors hover:bg-white/[0.06] disabled:opacity-50";
