import Link from "next/link";
import { nav, site, solutions } from "@/content/site";
import { CookieSettingsButton } from "./CookieBanner";
import { BackToTop, FooterMark } from "./FooterInteractive";
import { Logo } from "./Header";
import { MagneticButton } from "./interactive";

const linkClass = "group flex items-center text-left leading-5 text-muted transition-colors hover:text-fg";

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className={linkClass}>
      <span className="h-px w-0 bg-accent-2 transition-all duration-300 group-hover:mr-2 group-hover:w-3" />
      {children}
    </Link>
  );
}

function Column({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-2">{title}</h2>
      <ul className="mt-5 space-y-3 text-sm">{children}</ul>
    </div>
  );
}

export function Footer() {
  const year = new Date().getFullYear();
  const legalName = site.legalName.replace(/\.$/, "");

  return (
    <footer id="cierre" data-area="Cierre" data-area-color="--accent-2" className="relative isolate overflow-hidden">
      {/* Resplandor de fondo */}
      <div
        aria-hidden
        className="absolute left-1/2 top-0 -z-10 h-[520px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, rgba(61,123,255,0.35), rgba(0,209,255,0.08), transparent)" }}
      />
      <div aria-hidden className="grid-bg absolute inset-0 -z-20 opacity-25" />

      {/* ---------- Llamado final ---------- */}
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 sm:pt-32 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-2">{"// Siguiente paso"}</p>
          <h2 className="mt-4 font-display text-5xl font-semibold leading-[1] tracking-[-0.025em] text-balance sm:text-6xl lg:text-7xl">
            <span className="block text-fg">Construyamos</span>
            <span className="text-gradient block pb-[0.08em]">lo que sigue.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted sm:text-lg">
            Cuéntanos tu reto y un especialista te responde con un diagnóstico inicial, sin costo.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <MagneticButton href="/#contacto">Agenda una consultoría</MagneticButton>
            {site.whatsapp ? (
              <MagneticButton href={`https://wa.me/${site.whatsapp}`} variant="ghost">
                WhatsApp
              </MagneticButton>
            ) : (
              <MagneticButton href={`mailto:${site.email}`} variant="ghost">
                Escríbenos
              </MagneticButton>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Enlaces y datos ---------- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass grid grid-cols-2 gap-x-6 gap-y-10 rounded-[2rem] p-7 sm:gap-12 sm:p-10 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {site.tagline}. Data center, software, inteligencia artificial y cloud segura.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="sr-only">Correo</dt>
                <dd>
                  <a href={`mailto:${site.email}`} className="text-fg transition-colors hover:text-accent-2">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="sr-only">Ubicación</dt>
                <dd className="flex items-center gap-2 text-muted">
                  <span className="led h-1.5 w-1.5 rounded-full bg-ok" />
                  {site.city}
                </dd>
              </div>
            </dl>
          </div>

          <Column title="Soluciones">
            {solutions.map((s) => (
              <li key={s.id}>
                <FooterLink href="/#soluciones">{s.title}</FooterLink>
              </li>
            ))}
          </Column>

          <Column title="Empresa">
            {nav.map((n) => (
              <li key={n.href}>
                <FooterLink href={`/${n.href}`}>{n.label}</FooterLink>
              </li>
            ))}
            <li>
              <FooterLink href="/acceso">Acceso clientes</FooterLink>
            </li>
          </Column>

          <Column title="Legal" className="col-span-2 lg:col-span-1">
            <li>
              <FooterLink href="/terminos">Términos y Condiciones</FooterLink>
            </li>
            <li>
              <FooterLink href="/privacidad">Política de Privacidad</FooterLink>
            </li>
            <li>
              <FooterLink href="/cookies">Política de Cookies</FooterLink>
            </li>
            <li>
              <CookieSettingsButton className={`${linkClass} text-left`} />
            </li>
          </Column>
        </div>
      </div>

      {/* ---------- Marca gigante ---------- */}
      <div className="relative overflow-hidden px-2 pb-10 pt-16 sm:pb-14 sm:pt-20">
        <FooterMark text={site.name} />
        <p className="mt-4 pl-[0.5em] text-center font-mono text-[10px] uppercase tracking-[0.5em] text-muted/70">Tecnología e Infraestructura</p>
      </div>

      {/* ---------- Barra inferior ---------- */}
      <div className="relative border-t border-[var(--glass-border)] bg-bg/60 pb-20 backdrop-blur lg:pb-0">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-4 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {legalName}. <span className="whitespace-nowrap">RIF {site.rif}.</span>
            <span className="hidden sm:inline"> Hecho en Maracaibo, Venezuela.</span>
          </p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
