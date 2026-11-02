import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotConfigured } from "@/components/AppShell";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Header";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Acceder", robots: { index: false } };

export default async function Acceso({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center px-4">
        <NotConfigured />
      </main>
    );
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/cuenta");

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-line bg-bg-2 lg:block">
        <div aria-hidden className="grid-bg absolute inset-0 opacity-50" />
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
          style={{ background: "radial-gradient(closest-side, rgba(61,123,255,0.55), transparent)" }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo />
          <div>
            <p className="font-display text-4xl font-semibold leading-tight text-fg">
              Tu infraestructura,
              <br />
              <span className="text-gradient">en un solo lugar.</span>
            </p>
            <p className="mt-4 max-w-sm text-muted">Sigue tus solicitudes y gestiona tu cuenta con OMNIA.</p>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-10 lg:hidden">
            <Logo />
          </div>
          <h1 className="mb-8 font-display text-3xl font-semibold text-fg">Bienvenido</h1>
          {error && <p className="mb-4 text-sm text-[#ff8a8a]">El enlace expiró o no es válido. Inténtalo de nuevo.</p>}
          <AuthForm next={next} />
        </div>
      </div>
    </main>
  );
}
