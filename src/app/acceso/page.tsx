import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotConfigured } from "@/components/AppShell";
import { AuthForm } from "@/components/AuthForm";
import { Logo } from "@/components/Header";
import { MathCollider } from "@/components/MathCollider";
import { safeRedirect } from "@/lib/safe-redirect";
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
  // Con sesión: entrar directo, salvo que falte el código de verificación en dos pasos.
  let needsMfa = false;
  if (user) {
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    needsMfa = aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2";
    if (!needsMfa) redirect(safeRedirect(next));
  }

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-line bg-bg lg:block">
        {/* Espacio profundo: nebulosas suaves detrás de las estrellas */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: [
              "radial-gradient(60% 45% at 78% 18%, rgba(139,124,255,0.20), transparent 70%)",
              "radial-gradient(55% 50% at 15% 70%, rgba(61,123,255,0.18), transparent 70%)",
              "radial-gradient(40% 30% at 55% 45%, rgba(0,209,255,0.08), transparent 70%)",
              "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgba(0,0,0,0.6))",
            ].join(","),
          }}
        />
        <MathCollider />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-bg via-bg/80 to-transparent" />
        <div className="pointer-events-none relative flex h-full flex-col justify-between p-12">
          <div className="pointer-events-auto">
            <Logo />
          </div>
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
          <AuthForm next={next} mfa={needsMfa} />
        </div>
      </div>
    </main>
  );
}
