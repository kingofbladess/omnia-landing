import { ContactForm } from "@/components/ContactForm";
import { Footer } from "@/components/Footer";
import { FooterMark } from "@/components/FooterInteractive";
import { Header } from "@/components/Header";
import { AreaDivider, AreaSystem } from "@/components/AreaSystem";
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

/** Panel de vidrio que envuelve cada sección (estilo dashboard). */
function Module({ children, className = "", glass = false }: { children: React.ReactNode; className?: string; glass?: boolean }) {
  // Por defecto es un marco sin desenfoque y las tarjetas de dentro hacen el vidrio.
  // glass: el propio panel es de vidrio (solo si no lleva tarjetas de vidrio dentro).
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className={`${glass ? "glass" : "glass-frame"} relative overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-12 ${className}`}>{children}</div>
    </div>
  );
}

const icons: Record<string, React.ReactNode> = {
  dc: <path d="M4 5h16v4H4zM4 10h16v4H4zM4 15h16v4H4zM7 7h.01M7 12h.01M7 17h.01" />,
  srv: <path d="M5 3h14v18H5zM8 7h8M8 10.5h8M8 14h3M15.5 17.5h.01M12.5 17.5h.01" />,
  sw: <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 6l-2 12" />,
  ai: <path d="M12 3v3M12 18v3M3 12h3M18 12h3M7 7h10v10H7zM10 10h4v4h-4z" />,
  sec: <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6zM9 12l2 2 4-4" />,
};

export default function Home() {
  return (
    <>
      <Header areaBar />
      <AreaSystem />
      <div className="lg:pl-20 2xl:pl-0">
      <main id="inicio">
        {/* ---------- HERO ---------- */}
        <section id="hero" data-area="Inicio" data-area-color="--accent" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-16">
          <div aria-hidden className="grid-bg absolute inset-0 -z-20 opacity-60" />
          <div
            aria-hidden
            className="absolute left-1/2 top-[-20%] -z-10 h-[680px] w-[980px] -translate-x-1/2 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(61,123,255,0.45), rgba(0,209,255,0.12), transparent)" }}
          />

          <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6 lg:px-8">
            {/* El nombre en 3D como pieza principal de la portada */}
            <FooterMark text={site.name} intro="build" className="text-[clamp(2.4rem,11vw,7.5rem)]" />

            {/* Todo centrado bajo el nombre */}
            <div className="mx-auto mt-2 flex max-w-4xl flex-col items-center text-center">
              <Reveal>
                <span className="inline-flex items-center justify-center gap-2 rounded-full border border-line-strong bg-white/[0.03] py-1.5 pl-3 pr-[calc(0.75rem-0.04em)] text-center font-mono text-[9px] uppercase tracking-[0.04em] text-muted backdrop-blur sm:pr-[calc(0.75rem-0.16em)] sm:text-[11px] sm:tracking-[0.16em]">
                  <span className="led h-1.5 w-1.5 shrink-0 rounded-full bg-accent-2" />
                  {hero.eyebrow}
                </span>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="mt-6 font-display text-[clamp(1.85rem,8.6vw,2.4rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-5xl lg:text-[clamp(2.8rem,4vw,3.9rem)]">
                  <span className="block text-fg">{hero.title[0]}</span>
                  <span className="text-gradient block pb-[0.08em]">{hero.title[1]}</span>
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{hero.subtitle}</p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <MagneticButton href={hero.primary.href}>{hero.primary.label}</MagneticButton>
                  <MagneticButton href={hero.secondary.href} variant="ghost">
                    {hero.secondary.label}
                  </MagneticButton>
                </div>
              </Reveal>
              <Reveal delay={350}>
                <ul className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
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
              {/* Indicador de scroll: va con el contenido para no montarse encima en pantallas bajas */}
              <a
                href="#soluciones"
                aria-label="Bajar a soluciones"
                className="mt-14 hidden flex-col items-center gap-2 pl-[0.2em] text-[10px] uppercase tracking-[0.2em] text-muted transition-colors hover:text-fg sm:flex"
              >
                Scroll
                <span className="relative h-9 w-5 rounded-full border border-line-strong">
                  <span className="absolute left-1/2 top-1.5 h-2 w-0.5 -translate-x-1/2 animate-bounce rounded-full bg-accent-2" />
                </span>
              </a>
            </div>
          </div>


        </section>

        {/* ---------- CAPACIDADES ---------- */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Capacidades">
          <div
            className="glass-pill relative overflow-hidden rounded-full py-4"
            style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}
          >
          <div className="marquee flex w-max gap-12 pr-12">
            {[...capabilities, ...capabilities].map((c, i) => (
              <span key={i} aria-hidden={i >= capabilities.length} className="flex items-center gap-12 whitespace-nowrap font-display text-lg text-muted">
                {c}
                <span className="h-1 w-1 rounded-full bg-accent" />
              </span>
            ))}
          </div>
          </div>
        </div>

        {/* ---------- SOLUCIONES ---------- */}
        <div className="pt-24 sm:pt-28">
          <AreaDivider label="Soluciones" />
        </div>
        <section id="soluciones" data-area="Soluciones" data-area-color="--accent-2" className="scroll-mt-20 pb-20 pt-12 sm:pb-24 sm:pt-16">
          <Module>
            <SectionHead
              kicker="// Qué hacemos"
              title="Un solo equipo para toda tu tecnología."
              text="Del hardware al software y la inteligencia artificial, integrado y operado por especialistas."
            />
            <div className="mt-14 grid gap-4 md:grid-cols-2">
              {solutions.map((s, i) => (
                <Reveal key={s.id} delay={i * 80} className={solutions.length % 2 === 1 && i === solutions.length - 1 ? "md:col-span-2" : ""}>
                  <SpotCard className="glass-see group relative h-full overflow-hidden p-7 sm:p-8">
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
          </Module>
        </section>

        {/* ---------- INFRAESTRUCTURA ---------- */}
        <AreaDivider label="Infraestructura" />
        <section id="infraestructura" data-area="Infraestructura" data-area-color="--ok" className="relative scroll-mt-20 py-12 sm:py-16">
          <Module>
            <SectionHead
              kicker="// Estimador"
              title="¿Cuánta infraestructura necesitas?"
              text="Indica cuántos servidores tienes o planeas tener y te mostramos al instante cuántos racks ocupan, cuánta energía consumen y qué disponibilidad puedes esperar. Si te sirve, nos envías la configuración y preparamos una propuesta real."
            />
            <Reveal delay={100} className="mt-14">
              <RackConfigurator />
            </Reveal>
          </Module>
        </section>

        {/* ---------- CIFRAS + OPERACIÓN EN VIVO ---------- */}
        <section aria-label="Cifras y operación" className="py-12 sm:py-16">
          <Module className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-2">{"// En cifras"}</p>
              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2">
                {stats.map((s) => (
                  <div key={s.label} className="glass-card group relative overflow-hidden rounded-2xl p-5 transition-colors duration-300 hover:bg-white/[0.04] sm:p-6">
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-gradient-to-r from-accent to-accent-2 transition-transform duration-500 group-hover:scale-x-100"
                    />
                    <div className="font-display text-3xl font-semibold tracking-tight text-fg tabular-nums sm:text-4xl">
                      <Counter value={s.value} decimals={s.decimals} suffix={s.suffix} />
                    </div>
                    <div className="mt-2 text-sm leading-snug text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Consola de operaciones (decorativa), solo en pantallas anchas */}
            <Reveal delay={150} className="hidden lg:block">
              <LiveStatus />
            </Reveal>
          </Module>
        </section>

        {/* ---------- MÉTODO ---------- */}
        <AreaDivider label="Método" />
        <section id="metodo" data-area="Método" data-area-color="--accent-3" className="scroll-mt-20 py-12 sm:py-16">
          <Module>
            <SectionHead kicker="// Cómo trabajamos" title="De la idea a la operación, sin sorpresas." />
            <div className="mt-14">
              <MethodTimeline />
            </div>
          </Module>
        </section>

        {/* ---------- CONTACTO ---------- */}
        <AreaDivider label="Contacto" />
        <section id="contacto" data-area="Contacto" data-area-color="--accent" className="relative scroll-mt-20 overflow-hidden py-12 sm:py-16">
          <div
            aria-hidden
            className="absolute -right-40 top-10 -z-10 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(61,123,255,0.5), transparent)" }}
          />
          <Module className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div>
              <SectionHead
                kicker="// Hablemos"
                title="Hablemos de tu próximo proyecto."
                text="Cuéntanos qué necesitas y un especialista te responde con un diagnóstico inicial sin costo."
              />
              <Reveal delay={100}>
                <dl className="mt-10 grid grid-cols-[minmax(0,1fr)] gap-3">
                  {[
                    {
                      k: "Correo",
                      v: (
                        <a href={`mailto:${site.email}`} className="transition-colors hover:text-accent-2">
                          {site.email}
                        </a>
                      ),
                      icon: <path d="M3 6h18v12H3zM3 7l9 6 9-6" />,
                    },
                    { k: "Ubicación", v: site.city, icon: <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /> },
                    { k: "Atención", v: "Soporte 24/7 · Diagnóstico sin costo", icon: <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2" /> },
                  ].map((item) => (
                    <SpotCard key={item.k} tilt={false} className="flex items-center gap-4 px-5 py-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-accent/10 text-accent-2">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          {item.icon}
                        </svg>
                      </span>
                      <div className="min-w-0">
                        <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">{item.k}</dt>
                        <dd className="mt-1 truncate text-base text-fg">{item.v}</dd>
                      </div>
                    </SpotCard>
                  ))}
                </dl>
              </Reveal>
            </div>
            <Reveal delay={150}>
              <div className="glass-card relative overflow-hidden rounded-2xl">
                <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-2/70 to-transparent" />
                <div className="flex items-center justify-between gap-4 border-b border-line px-6 py-4 sm:px-8">
                  <div>
                    <p className="font-display text-lg font-semibold text-fg">Solicitud de diagnóstico</p>
                    <p className="mt-0.5 text-xs text-muted">Los campos con * son obligatorios.</p>
                  </div>
                  <span className="hidden items-center gap-2 rounded-full border border-ok/30 bg-ok/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ok sm:flex">
                    <span className="led h-1.5 w-1.5 rounded-full bg-ok" />
                    Sin costo
                  </span>
                </div>
                <div className="p-6 sm:p-8">
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </Module>
        </section>
      </main>
      <Footer />
      </div>
    </>
  );
}
