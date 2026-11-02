"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const COOKIE = "omnia_consent";
const MAX_AGE = 60 * 60 * 24 * 180; // 180 días

export type Consent = { necessary: true; analytics: boolean; marketing: boolean; date: string };

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw.slice(COOKIE.length + 1))) as Consent;
  } catch {
    return null;
  }
}

function saveConsent(analytics: boolean, marketing: boolean) {
  const value: Consent = { necessary: true, analytics, marketing, date: new Date().toISOString() };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent("omnia:consent", { detail: value }));
}

/** Botón para reabrir las preferencias (se usa en el pie de página). */
export function CookieSettingsButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("omnia:cookies"))} className={className}>
      Preferencias de cookies
    </button>
  );
}

function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange?: (v: boolean) => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-accent" : "bg-white/15"} disabled:opacity-60`}
    >
      <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

export function CookieBanner() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const c = readConsent();
    if (!c) setOpen(true);
    else {
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
    }
    const reopen = () => {
      const cur = readConsent();
      setAnalytics(cur?.analytics ?? false);
      setMarketing(cur?.marketing ?? false);
      setDetails(true);
      setOpen(true);
    };
    window.addEventListener("omnia:cookies", reopen);
    return () => window.removeEventListener("omnia:cookies", reopen);
  }, []);

  if (!open) return null;

  function done(a: boolean, m: boolean) {
    saveConsent(a, m);
    setOpen(false);
    setDetails(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-title"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-line-strong bg-[#0b1220]/95 p-5 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <h2 id="cookie-title" className="font-display text-base font-semibold text-fg">
        Tu privacidad, tus reglas
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Usamos cookies necesarias para que el sitio funcione y, solo si lo aceptas, cookies de análisis y marketing. Más
        información en la{" "}
        <Link href="/cookies" className="text-accent-2 underline underline-offset-4">
          Política de Cookies
        </Link>
        .
      </p>

      {details && (
        <ul className="mt-4 space-y-3">
          {[
            { k: "Necesarias", d: "Sesión, seguridad y tus preferencias. Siempre activas.", v: true, set: undefined, dis: true },
            { k: "Análisis", d: "Estadísticas anónimas para mejorar el sitio.", v: analytics, set: setAnalytics, dis: false },
            { k: "Marketing", d: "Medir campañas y mostrar contenido relevante.", v: marketing, set: setMarketing, dis: false },
          ].map((row) => (
            <li key={row.k} className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white/[0.02] px-4 py-3">
              <span>
                <span className="block text-sm font-medium text-fg">{row.k}</span>
                <span className="block text-xs text-muted">{row.d}</span>
              </span>
              <Switch checked={row.v} onChange={row.set} disabled={row.dis} label={`Cookies de ${row.k.toLowerCase()}`} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => done(true, true)}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          Aceptar todas
        </button>
        <button
          type="button"
          onClick={() => done(false, false)}
          className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-fg transition hover:bg-white/5"
        >
          Solo necesarias
        </button>
        {details ? (
          <button
            type="button"
            onClick={() => done(analytics, marketing)}
            className="rounded-full border border-accent/60 px-5 py-2.5 text-sm font-semibold text-accent-2 transition hover:bg-accent/10"
          >
            Guardar selección
          </button>
        ) : (
          <button type="button" onClick={() => setDetails(true)} className="px-3 py-2.5 text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
            Configurar
          </button>
        )}
      </div>
    </div>
  );
}
