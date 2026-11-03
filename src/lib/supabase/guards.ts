import { redirect } from "next/navigation";
import { getCurrentUser } from "./server";

/** Para páginas privadas: si no hay sesión, manda a iniciar sesión y vuelve a `path`. */
export async function pageUser(path: string) {
  const ctx = await getCurrentUser();
  if (!ctx.user) redirect(`/acceso?next=${encodeURIComponent(path)}`);
  return ctx as typeof ctx & { user: NonNullable<typeof ctx.user> };
}

/** Para páginas del panel de administración. */
export async function pageAdmin(path: string) {
  const ctx = await pageUser(path);
  if (ctx.profile?.role !== "admin") redirect("/cuenta");
  return ctx;
}

/**
 * Comprobaciones de acceso para las acciones del servidor.
 * Viven fuera de los archivos "use server" para que no se puedan invocar desde el navegador.
 * La base de datos (RLS) vuelve a comprobar todo: esto es la primera barrera.
 */
export async function requireUser() {
  const ctx = await getCurrentUser();
  if (!ctx.user) throw new Error("No autenticado");
  return ctx as typeof ctx & { user: NonNullable<typeof ctx.user> };
}

export async function requireAdmin() {
  const ctx = await requireUser();
  if (ctx.profile?.role !== "admin") throw new Error("No autorizado");
  return ctx;
}
