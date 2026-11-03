"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { safeRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/client";
import { MagneticButton } from "./interactive";

type Mode = "login" | "signup" | "reset" | "mfa";

const input =
  "w-full rounded-xl border border-line bg-white/[0.03] px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-muted/70 focus:border-accent focus:bg-white/[0.05]";

function translate(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Confirma tu correo antes de iniciar sesión (revisa tu bandeja de entrada).";
  if (m.includes("already registered")) return "Ese correo ya tiene una cuenta. Inicia sesión.";
  if (m.includes("password should be")) return "La contraseña debe tener al menos 8 caracteres.";
  if (m.includes("rate limit")) return "Demasiados intentos. Espera unos minutos.";
  if (m.includes("mfa code format")) return "El código tiene 6 dígitos.";
  if (m.includes("mfa")) return "Código incorrecto o vencido. Prueba con el que muestra ahora tu app.";
  return "Algo salió mal. Inténtalo de nuevo.";
}

const browserClient = () => createClient();

/** `mfa`: la sesión ya existe pero falta el código de verificación en dos pasos. */
export function AuthForm({ next, mfa = false }: { next?: string; mfa?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(mfa ? "mfa" : "login");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    const fullName = String(fd.get("full_name") ?? "").trim();
    setLoading(true);
    setMsg(null);
    const supabase = createClient();
    try {
      if (mode === "mfa") {
        const code = String(fd.get("code") ?? "").replace(/\s/g, "");
        if (!/^\d{6}$/.test(code)) throw new Error("mfa code format");
        const { data } = await supabase.auth.mfa.listFactors();
        const factor = data?.totp?.[0];
        if (!factor) throw new Error("mfa no factor");
        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
        if (error) throw new Error("mfa invalid");
        router.replace(safeRedirect(next));
        router.refresh();
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // ¿La cuenta tiene verificación en dos pasos? Entonces falta el código.
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
          setMode("mfa");
          return;
        }
        router.replace(safeRedirect(next));
        router.refresh();
      } else if (mode === "signup") {
        if (password.length < 8) throw new Error("password should be at least 8");
        if (!fd.get("terms")) {
          setMsg({ ok: false, text: "Debes aceptar los Términos y la Política de Privacidad." });
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName }, emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          router.replace("/cuenta");
          router.refresh();
        } else {
          setMsg({ ok: true, text: "Cuenta creada. Revisa tu correo para confirmarla." });
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/callback?next=/cuenta`,
        });
        if (error) throw error;
        setMsg({ ok: true, text: "Si el correo existe, te enviamos un enlace para entrar." });
      }
    } catch (err) {
      setMsg({ ok: false, text: translate((err as Error).message ?? "") });
    } finally {
      setLoading(false);
    }
  }

  const tabs: { id: Mode; label: string }[] = [
    { id: "login", label: "Iniciar sesión" },
    { id: "signup", label: "Crear cuenta" },
  ];

  return (
    <div>
      {mode !== "reset" && mode !== "mfa" && (
        <div role="tablist" className="relative mb-8 grid grid-cols-2 rounded-full border border-line bg-white/[0.02] p-1">
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-accent transition-transform duration-300"
            style={{ transform: mode === "signup" ? "translateX(100%)" : "none" }}
          />
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={mode === t.id}
              onClick={() => {
                setMode(t.id);
                setMsg(null);
              }}
              className={`relative z-10 rounded-full py-2 text-sm font-medium transition-colors ${mode === t.id ? "text-white" : "text-muted hover:text-fg"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {mode === "mfa" && (
          <div>
            <p className="mb-4 text-sm text-muted">Tu cuenta tiene verificación en dos pasos. Escribe el código de 6 dígitos que muestra tu app de autenticación.</p>
            <label htmlFor="code" className="mb-1.5 block text-xs text-muted">
              Código de verificación
            </label>
            <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required autoFocus className={`${input} text-center text-lg tracking-[0.4em]`} />
          </div>
        )}
        {mode === "signup" && (
          <div>
            <label htmlFor="full_name" className="mb-1.5 block text-xs text-muted">
              Nombre completo
            </label>
            <input id="full_name" name="full_name" autoComplete="name" required className={input} />
          </div>
        )}
        {mode !== "mfa" && (
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs text-muted">
              Correo
            </label>
            <input id="email" name="email" type="email" autoComplete="email" required className={input} />
          </div>
        )}
        {mode !== "reset" && mode !== "mfa" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-xs text-muted">
                Contraseña
              </label>
              {mode === "login" && (
                <button type="button" onClick={() => setMode("reset")} className="text-xs text-accent-2 hover:underline">
                  ¿La olvidaste?
                </button>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={mode === "signup" ? 8 : undefined}
              required
              className={input}
            />
          </div>
        )}
        {mode === "signup" && (
          <label className="flex items-start gap-3 text-xs text-muted">
            <input name="terms" type="checkbox" required className="mt-0.5 h-4 w-4 accent-[var(--accent)]" />
            <span>
              Acepto los{" "}
              <Link href="/terminos" className="text-accent-2 hover:underline">
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="text-accent-2 hover:underline">
                Política de Privacidad
              </Link>
              .
            </span>
          </label>
        )}

        <MagneticButton type="submit" disabled={loading} className="w-full">
          {loading ? "Un momento…" : mode === "login" ? "Entrar" : mode === "signup" ? "Crear cuenta" : mode === "mfa" ? "Verificar" : "Enviar enlace"}
        </MagneticButton>

        {msg && (
          <p role="status" className={`text-sm ${msg.ok ? "text-ok" : "text-[#ff8a8a]"}`}>
            {msg.text}
          </p>
        )}
        {mode === "reset" && (
          <button type="button" onClick={() => setMode("login")} className="text-sm text-muted hover:text-fg">
            ← Volver a iniciar sesión
          </button>
        )}
        {mode === "mfa" && (
          <button
            type="button"
            onClick={async () => {
              await browserClient().auth.signOut();
              setMode("login");
              setMsg(null);
            }}
            className="text-sm text-muted hover:text-fg"
          >
            ← Entrar con otra cuenta
          </button>
        )}
      </form>
    </div>
  );
}
