import Link from "next/link";
import { signOut } from "@/app/actions";
import { createClient } from "@/lib/supabase/server";
import { AreaSystem } from "./AreaSystem";
import { Logo } from "./Header";

type Section = "cuenta" | "admin";

/** Pestañas del área de clientes. */
const CLIENT_TABS = [
  { href: "/cuenta", label: "Resumen" },
  { href: "/cuenta/reuniones", label: "Reuniones" },
  { href: "/cuenta/documentos", label: "Documentos" },
  { href: "/cuenta/configuraciones", label: "Configuraciones" },
  { href: "/cuenta/ajustes", label: "Ajustes" },
];

/** Marco de las páginas privadas (/cuenta y /admin) con el mismo estilo de vidrio de la landing. */
export async function AppShell({
  children,
  isAdmin,
  active = "cuenta",
  tab,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
  active?: Section;
  /** Ruta de la pestaña activa del área de clientes (p. ej. "/cuenta/reuniones"). */
  tab?: string;
}) {
  // Avisos sin leer para la campana
  let unread = 0;
  try {
    const supabase = await createClient();
    const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).is("read_at", null);
    unread = count ?? 0;
  } catch {
    unread = 0;
  }

  const link = (href: string, label: string, id: Section) => (
    <Link
      href={href}
      aria-current={active === id ? "page" : undefined}
      className={`rounded-full px-4 py-1.5 text-sm transition-colors ${active === id ? "bg-fg text-bg" : "text-muted hover:bg-white/[0.06] hover:text-fg"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen">
      {/* Mismo fondo animado de red de nodos que la página principal */}
      <AreaSystem />

      <header className="sticky top-0 z-40">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-bg via-bg/70 to-transparent" />
        <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="glass-pill rounded-full py-1.5 pl-2 pr-4">
            <Logo />
          </div>
          <nav aria-label="Cuenta" className="glass-pill hidden items-center gap-1 rounded-full p-1 sm:flex">
            {link("/cuenta", "Mi cuenta", "cuenta")}
            {isAdmin && link("/admin", "Admin", "admin")}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/cuenta/notificaciones"
              aria-label={unread ? `Notificaciones: ${unread} sin leer` : "Notificaciones"}
              className="glass-pill relative flex h-10 w-10 items-center justify-center rounded-full text-fg transition-colors hover:bg-white/10"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0" />
              </svg>
              {unread > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#ff5d6c] px-1 text-[10px] font-semibold text-white">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <form action={signOut}>
              <button className="glass-pill rounded-full px-4 py-2 text-sm text-fg transition-colors hover:bg-white/10">Salir</button>
            </form>
          </div>
        </div>

        {active === "cuenta" && (
          <div className="relative mx-auto max-w-7xl overflow-x-auto px-4 pb-2 sm:px-6 lg:px-8">
            <nav aria-label="Secciones de mi cuenta" className="glass-pill inline-flex gap-1 rounded-full p-1">
              {CLIENT_TABS.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  aria-current={tab === t.href ? "page" : undefined}
                  className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs transition-colors sm:text-sm ${
                    tab === t.href ? "bg-white/[0.14] text-fg" : "text-muted hover:bg-white/[0.06] hover:text-fg"
                  }`}
                >
                  {t.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs text-muted hover:bg-white/[0.06] hover:text-fg sm:hidden">
                  Admin
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

export function NotConfigured() {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-warn/40 bg-warn/5 p-6 text-sm text-fg">
      <h1 className="font-display text-xl font-semibold">Falta conectar Supabase</h1>
      <p className="mt-2 text-muted">
        Agrega <code className="font-mono text-fg">NEXT_PUBLIC_SUPABASE_URL</code> y{" "}
        <code className="font-mono text-fg">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> en <code className="font-mono text-fg">.env.local</code>{" "}
        (o en Vercel) y reinicia el servidor. Las instrucciones están en el README.
      </p>
      <Link href="/" className="mt-4 inline-block text-accent-2 hover:underline">
        ← Volver al inicio
      </Link>
    </div>
  );
}
