import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { HeroCanvas } from "@/components/HeroCanvas";
import { Counter, MagneticButton, Reveal, SpotCard } from "@/components/interactive";
import { LiveStatus } from "@/components/LiveStatus";
import { MethodTimeline } from "@/components/MethodTimeline";
import { RackConfigurator } from "@/components/RackConfigurator";
import { capabilities, hero, site, solutions, stats } from "@/content/site";

function SectionHead({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <Reveal className="max-w-2xl">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-2">{kicker}</p>
      <h2 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-fg sm:text-4xl md:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">{text}</p>}
    </Reveal>
  );
}

const icons: Record<string, React.ReactNode> = {
  dc: <path d="M4 5h16v4H4zM4 10h16v4H4zM4 15h16v4H4zM7 7h.01M7 12h.01M7 17h.01" />,
  sw: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12" />,
  ai: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M7 7h10v10H7zM10 10h4v4h-4z" />,
  sec: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4" />,
};

export default function Home() {
  return (
    <>
      <Header />
      <main id="inicio">
        {/* ---------- HERO ---------- */}
        <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16">
          <div aria-hidden className="grid-bg absolute inset-0 -z-20 opacity-60" />
          <div
            aria-hidden
            className="absolute left-1/2 top-[-20%] -z-10 h-[680px] w-[980px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(61,123,255,0.45), rgba(0,209,255,0.12), transparent)" }}
          />
          <div className="absolute inset-0 -z-10">
            <HeroCanvas />
          </div>

          <div className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.03] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-muted backdrop-blur sm:text-[11px] sm:tracking-[0.16em]">
                <span className="led h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" />
                {hero.eyebrow}
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.03em] text-balance sm:text-6xl lg:text-[clamp(3.5rem,5.6vw,4.9rem)]">
                <span className="block text-fg lg:whitespace-nowrap">{hero.title[0]}</span>
                <span className="text-gradient block pb-[0.08em] lg:whitespace-nowrap">{hero.title[1]}</span>
              </h1>
            </Reveal>

            <div className="mt-8 grid items-start gap-12 lg:grid-cols-[1fr_auto]">
              <div>
                <Reveal delay={200}>
                  <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">{hero.subtitle}</p>
                </Reveal>
                <Reveal delay={300}>
                  <div className="mt-9 flex flex-wrap gap-3">
                    <MagneticButton href={hero.primary.href}>{hero.primary.label}</MagneticButton>
                    <MagneticButton href={hero.secondary.href} variant="ghost">
                      {hero.secondary.label}
                    </MagneticButton>
                  </div>
                </Reveal>
                <Reveal delay={350}>
                  <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                    {hero.proof.map((p) => (
                      <li key={p} className="flex items-center gap-2">
                        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-accent-2" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M3 8.5l3 3 7-7" />
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
              <Reveal delay={400} className="hidden lg:-mt-14 lg:block xl:-mt-20">
                <LiveStatus />
              </Reveal>
            </div>
          </div>

          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-bg" />

          <a
            href="#soluciones"
            aria-label="Bajar a soluciones"
            className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg sm:flex"
          >
            Scroll
            <span className="relative h-9 w-5 rounded-full border border-line-strong">
              <span className="absolute left-1/2 top-1.5 h-2 w-0.5 -translate-x-1/2 animate-bounce rounded-full bg-accent-2" />
            </span>
          </a>
        </section>

        {/* ---------- CAPACIDADES ---------- */}
        <div className="relative overflow-hidden border-y border-line bg-bg-2 py-5" aria-label="Capacidades">
          <div className="marquee flex w-max gap-12 pr-12">
            {[...capabilities, ...capabilities].map((c, i) => (
              <span key={i} aria-hidden={i >= capabilities.length} className="flex items-center gap-12 whitespace-nowrap font-display text-lg text-muted">
                {c}
                <span className="h-1 w-1 rounded-full bg-accent" />
              </span>
            ))}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-bg-2 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-bg-2 to-transparent" />
        </div>

        {/* ---------- SOLUCIONES ---------- */}
        <section id="soluciones" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHead
              kicker="// Soluciones"
              title="Un solo equipo para toda tu tecnología."
              text="Del hardware al software y la inteligencia artificial, integrado y operado por especialistas."
            />
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {solutions.map((s, i) => (
                <Reveal key={s.id} delay={i * 80}>
                  <SpotCard className="group relative h-full overflow-hidden p-7 sm:p-8">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-3 -top-6 select-none font-display text-[8rem] font-semibold leading-none text-white/[0.025] transition-colors duration-500 group-hover:text-accent/[0.07]"
                    >
                      {s.code}
                    </span>
                    <div aria-hidden className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-line-strong to-transparent" />
                    <div className="relative flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-line-strong bg-accent/10 text-accent-2 transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          {icons[s.id]}
                        </svg>
                      </span>
                    </div>
                    <h3 className="relative mt-6 font-display text-2xl font-semibold text-fg">{s.title}</h3>
                    <p className="relative mt-3 leading-relaxed text-muted">{s.text}</p>
                    <ul className="relative mt-6 space-y-2 border-t border-line pt-5">
                      {s.points.map((p) => (
                        <li key={p} className="flex items-center gap-3 text-sm text-fg/90">
                          <span className="h-px w-4 bg-accent-2 transition-all duration-300 group-hover:w-6" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </SpotCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- INFRAESTRUCTURA ---------- */}
        <section id="infraestructura" className="relative scroll-mt-20 border-y border-line bg-bg-2 py-24 sm:py-32">
          <div aria-hidden className="grid-bg absolute inset-0 opacity-30" />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHead
              kicker="// Configurador"
              title="Diseña tu infraestructura en segundos."
              text="Mueve el control y activa opciones: el rack se arma en vivo y te sugerimos un plan."
            />
            <Reveal delay={100} className="mt-14">
              <RackConfigurator />
            </Reveal>
          </div>
        </section>

        {/* ---------- CIFRAS ---------- */}
        <section aria-label="Cifras" className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="group relative bg-bg p-6 transition-colors duration-300 hover:bg-panel sm:p-8">
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-accent-2 transition-transform duration-500 group-hover:scale-x-100"
                  />
                  <div className="font-display text-4xl font-semibold tracking-tight text-fg tabular-nums sm:text-5xl">
                    <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
                  </div>
                  <div className="mt-2 text-sm text-muted">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- MÉTODO ---------- */}
        <section id="metodo" className="scroll-mt-20 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHead kicker="// Método" title="De la idea a la operación, sin sorpresas." />
            <div className="mt-14">
              <MethodTimeline />
            </div>
          </div>
        </section>

        {/* ---------- CONTACTO ---------- */}
        <section id="contacto" className="relative scroll-mt-20 overflow-hidden border-t border-line py-24 sm:py-32">
          <div
            aria-hidden
            className="absolute -right-40 top-10 -z-10 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(61,123,255,0.5), transparent)" }}
          />
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
            <div>
              <SectionHead
                kicker="// Contacto"
                title="Hablemos de tu próximo proyecto."
                text="Cuéntanos qué necesitas y un especialista te responde con un diagnóstico inicial sin costo."
              />
              <Reveal delay={100}>
                <dl className="mt-10 space-y-5 text-sm">
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Correo</dt>
                    <dd className="mt-1">
                      <a href={`mailto:${site.email}`} className="text-lg text-fg hover:text-accent-2">
                        {site.email}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">Ubicación</dt>
                    <dd className="mt-1 text-lg text-fg">{site.city}</dd>
                  </div>
                </dl>
              </Reveal>
            </div>
            <Reveal delay={150}>
              <div className="rounded-2xl border border-line bg-panel/60 p-6 backdrop-blur sm:p-8">
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
