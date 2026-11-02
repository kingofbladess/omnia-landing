import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div aria-hidden className="grid-bg absolute inset-0 opacity-40" />
      <p className="relative font-mono text-sm text-accent-2">ERROR 404</p>
      <h1 className="relative mt-3 font-display text-5xl font-semibold text-fg">Ruta no encontrada</h1>
      <p className="relative mt-4 max-w-md text-muted">La página que buscas no existe o fue movida.</p>
      <Link href="/" className="relative mt-8 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:brightness-110">
        Volver al inicio
      </Link>
    </main>
  );
}
