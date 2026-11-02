"use client";

import { useEffect, useRef, useState } from "react";
import { method } from "@/content/site";

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
    <ol ref={ref} className="relative grid gap-4 md:grid-cols-4">
      <div aria-hidden className="absolute left-0 right-0 top-[22px] hidden h-px bg-line md:block">
        <div className="h-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />
      </div>
      {method.map((m, i) => {
        const on = i <= active;
        return (
          <li key={m.step}>
            <button
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              aria-pressed={i === active}
              className="group w-full text-left"
            >
              <span
                className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border font-mono text-sm transition-all duration-300 ${
                  on ? "border-accent bg-accent text-white shadow-[0_0_30px_rgba(61,123,255,0.6)]" : "border-line-strong bg-bg text-muted"
                }`}
              >
                0{i + 1}
              </span>
              <span
                className={`mt-5 block rounded-2xl border p-5 transition-colors duration-300 ${
                  i === active ? "border-accent/50 bg-accent/[0.06]" : "border-line bg-white/[0.02] group-hover:border-line-strong"
                }`}
              >
                <span className="block font-display text-lg font-semibold text-fg">{m.step}</span>
                <span className="mt-2 block text-sm leading-relaxed text-muted">{m.text}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
