"use client";

import { useRef } from "react";
import { MagneticButton } from "./interactive";

/** Nombre gigante del pie que se ilumina siguiendo el cursor. */
export function FooterMark({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--fx", `${e.clientX - r.left}px`);
    el.style.setProperty("--fy", `${e.clientY - r.top}px`);
  }
  function leave() {
    ref.current?.style.removeProperty("--fx");
    ref.current?.style.removeProperty("--fy");
  }

  return (
    <div
      ref={ref}
      aria-hidden
      onPointerMove={move}
      onPointerLeave={leave}
      className="footer-mark select-none pl-[0.32em] text-center font-display font-light leading-none tracking-[0.32em] text-[clamp(3rem,13vw,12.5rem)]"
    >
      {text}
    </div>
  );
}

/** Botón para volver al inicio de la página. */
export function BackToTop() {
  return (
    <MagneticButton
      variant="ghost"
      arrow={false}
      ariaLabel="Volver arriba"
      className="!px-4 !py-2.5 text-xs"
      onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M8 13V3M4 7l4-4 4 4" />
      </svg>
      Arriba
    </MagneticButton>
  );
}
