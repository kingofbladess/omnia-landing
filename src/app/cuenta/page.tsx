import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountForms } from "./parts";
import { AppShell, NotConfigured } from "@/components/AppShell";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Mi cuenta", robots: { index: false } };

const statusLabel: Record<string, string> = { nuevo: "Recibida", contactado: "En conversación", cerrado: "Cerrada" };

export default async function Cuenta() {
  if (!isSupabaseConfigured) return <NotConfigured />;
  const { supabase, user, profile } = await getCurrentUser();
  if (!user) redirect("/acceso?next=/cuenta");

  const { data: leads } = await supabase
    .from("leads")
    .select("id, message, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell isAdmin={profile?.role === "admin"} email={user.email}>
      <h1 className="font-display text-3xl font-semibold text-fg sm:text-4xl">Hola{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
      <p className="mt-2 text-muted">
        Rol: <span className="text-fg">{profile?.role === "admin" ? "Administrador" : "Usuario"}</span>
      </p>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <AccountForms fullName={profile?.full_name ?? ""} />
        <section className="rounded-2xl border border-line bg-panel/60 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-fg">Mis solicitudes</h2>
            <Link href="/#contacto" className="text-sm text-accent-2 hover:underline">
              Nueva solicitud
            </Link>
          </div>
          {leads && leads.length > 0 ? (
            <ul className="mt-4 divide-y divide-line">
              {leads.map((l) => (
                <li key={l.id} className="py-4">
                  <div className="flex items-center justify-between gap-4 text-xs text-muted">
                    <time dateTime={l.created_at}>{new Date(l.created_at).toLocaleDateString("es-VE")}</time>
                    <span className="rounded-full border border-line-strong px-2 py-0.5">{statusLabel[l.status] ?? l.status}</span>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-fg/90">{l.message}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-muted">Aún no has enviado solicitudes.</p>
          )}
        </section>
      </div>
    </AppShell>
  );
}
