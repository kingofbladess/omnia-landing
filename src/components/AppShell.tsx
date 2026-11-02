import Link from "next/link";
import { signOut } from "@/app/actions";
import { Logo } from "./Header";

export function AppShell({ children, isAdmin, email }: { children: React.ReactNode; isAdmin?: boolean; email?: string }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo />
          <nav className="flex items-center gap-1 text-sm">
            <Link href="/cuenta" className="rounded-full px-3 py-1.5 text-muted hover:bg-white/5 hover:text-fg">
              Mi cuenta
            </Link>
            {isAdmin && (
              <Link href="/admin" className="rounded-full px-3 py-1.5 text-muted hover:bg-white/5 hover:text-fg">
                Admin
              </Link>
            )}
            <form action={signOut}>
              <button className="rounded-full border border-line-strong px-3 py-1.5 text-fg hover:bg-white/5">Salir</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {email && <p className="mb-2 font-mono text-xs text-muted">{email}</p>}
        {children}
      </main>
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
