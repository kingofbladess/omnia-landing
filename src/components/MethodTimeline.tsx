"use client";

import { useEffect, useRef, useState } from "react";
import { method } from "@/content/site";

/** Icono de cada paso (en el mismo orden que `method`). */
const icons = [
  // Diagnóstico: lupa con pulso
  <path key="d" d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4M7.5 11h2l1-2 1.5 4 1-2h1.5" />,
  // Arquitectura: capas / planos
  <path key="a" d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17.5l9 5 9-5" />,
  // Implementación: despliegue
  <path key="i" d="M5 15c-1 1-1.5 3.5-1.5 5.5 2 0 4.5-.5 5.5-1.5M9 15l-3-3c1.5-4 5-8 12-8 0 7-4 10.5-8 12l-1-1zM15 9h.01" />,
  // Operación: monitor con señal
  <path key="o" d="M3 5h18v11H3zM8 20h8M12 16v4M6 11h3l1.5-3 2 6 1.5-3H18" />,
];

/** Línea de tiempo: la barra se llena con el scroll y cada paso se activa al pasar o tocar. */
export function MethodTimeline() {
  const ref = useRef<HTMLOListElement>(null);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      setProgress(p);
      setActive(Math.min(method.length - 1, Math.floor(p * method.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <ol ref={ref} className="relative grid gap-6 md:grid-cols-4 md:gap-5">
      {/* Línea de progreso: horizontal en escritorio, vertical en móvil */}
      <div aria-hidden className="absolute left-7 right-7 top-7 hidden h-px bg-line md:block">
        <div className="h-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
      </div>
      <div aria-hidden className="absolute bottom-7 left-7 top-7 w-px bg-line md:hidden">
        <div className="w-full bg-gradient-to-b from-accent to-accent-2 transition-[height] duration-200" style={{ height: `${progress * 100}%` }} />
      </div>

      {method.map((m, i) => {
        const reached = i <= active;
        const current = i === active;
        return (
          <li key={m.step} className="relative">
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-pressed={current}
              className="group flex h-full w-full gap-5 text-left md:flex-col md:gap-6"
            >
              {/* Nodo con icono */}
              <span className="relative z-10 h-14 w-14 shrink-0 self-start">
                {current && <span aria-hidden className="absolute inset-0 animate-ping rounded-2xl bg-accent/30 [animation-duration:2.2s]" />}
                <span
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl border transition-all duration-500 ${
                    reached
                      ? "border-accent/70 bg-gradient-to-br from-accent to-[#2456d6] text-white shadow-[0_0_40px_-4px_rgba(61,123,255,0.75)]"
                      : "border-line-strong bg-bg text-muted group-hover:border-accent/40 group-hover:text-fg"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    {icons[i]}
                  </svg>
                </span>
              </span>

              {/* Tarjeta */}
              <span
                className={`relative flex flex-1 flex-col overflow-hidden rounded-2xl border p-6 transition-all duration-500 ${
                  current
                    ? "border-accent/50 bg-gradient-to-b from-accent/[0.12] to-panel/40 shadow-[0_30px_60px_-30px_rgba(61,123,255,0.55)]"
                    : "glass-card group-hover:border-line-strong"
                }`}
              >
                <span
                  aria-hidden
                  className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-2 to-transparent transition-opacity duration-500 ${current ? "opacity-100" : "opacity-0"}`}
                />
                <span className="block font-display text-xl font-semibold text-fg">{m.step}</span>
                <span className="mt-3 block text-sm leading-relaxed text-muted">{m.text}</span>
                <span
                  aria-hidden
                  className={`mt-auto flex items-center gap-2 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-500 ${
                    reached ? "text-accent-2" : "text-muted/60"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${reached ? "bg-accent-2" : "bg-line-strong"}`} />
                  {i < active ? "Completado" : current ? "En curso" : "Siguiente"}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
