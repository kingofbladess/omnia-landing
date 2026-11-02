export const LEGAL_UPDATED = "2 de noviembre de 2026";

export function LegalHeader({ title, intro }: { title: string; intro: string }) {
  return (
    <header className="mb-10 border-b border-line pb-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-2">Legal</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-fg sm:text-5xl">{title}</h1>
      <p className="mt-4 text-sm text-muted">Última actualización: {LEGAL_UPDATED}</p>
      <p className="mt-6 text-base leading-relaxed text-[#b9c3d8]">{intro}</p>
    </header>
  );
}
