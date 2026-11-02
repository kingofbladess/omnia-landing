import Link from "next/link";
import { nav, site } from "@/content/site";
import { CookieSettingsButton } from "./CookieBanner";
import { Logo } from "./Header";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-line bg-bg-2">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">{site.tagline}. Data center, software, inteligencia artificial y cloud segura.</p>
          <p className="mt-4 text-sm text-muted">
            <a href={`mailto:${site.email}`} className="hover:text-fg">
              {site.email}
            </a>
            <br />
            {site.city}
          </p>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-fg">Navegación</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={`/${n.href}`} className="hover:text-fg">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-fg">Legal</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              <Link href="/terminos" className="hover:text-fg">
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link href="/privacidad" className="hover:text-fg">
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="hover:text-fg">
                Política de Cookies
              </Link>
            </li>
            <li>
              <CookieSettingsButton className="text-left hover:text-fg" />
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            © {year} {site.legalName}. RIF {site.rif}. Todos los derechos reservados.
          </span>
          <span className="font-mono">{site.domain}</span>
        </div>
      </div>
    </footer>
  );
}
