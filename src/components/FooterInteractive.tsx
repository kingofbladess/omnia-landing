"use client";

import { useEffect, useRef, useState } from "react";
import { MagneticButton } from "./interactive";

/** Capas de profundidad de cada letra (más capas = letras más gruesas, más trabajo). */
const DEPTH = 12;

/**
 * Nombre del pie en 3D.
 * - Cada letra tiene volumen: capas apiladas en profundidad (CSS 3D, sin librerías).
 * - Al entrar en pantalla las letras se levantan una a una desde el fondo.
 * - Un brillo recorre las letras cada pocos segundos.
 * - El bloque oscila despacio y, con el ratón, se inclina hacia donde lo mueves.
 * La animación solo corre mientras el pie está en pantalla.
 */
export function FooterMark({
  text,
  className = "text-[clamp(2.2rem,9.5vw,8.5rem)]",
  intro = "rise",
}: {
  text: string;
  className?: string;
  /** rise: las letras se levantan desde el fondo (pie). build: contorno → escaneo y relleno → volumen (portada). */
  intro?: "rise" | "build";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const st = stage.current;
    if (!el || !st) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = false;
    const cur = { rx: 14, ry: 0 };

    const tick = (now: number) => {
      const p = pointer.current;
      // Sin ratón: vaivén lento. Con ratón: se inclina hacia él.
      const ry = p ? p.x * 16 : Math.sin(now / 2600) * 9;
      const rx = p ? 12 - p.y * 10 : 14 + Math.sin(now / 3900) * 3;
      cur.rx += (rx - cur.rx) * 0.06;
      cur.ry += (ry - cur.ry) * 0.06;
      st.style.transform = `rotateX(${cur.rx.toFixed(2)}deg) rotateY(${cur.ry.toFixed(2)}deg)`;
      raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };
    const start = () => {
      if (!reduced && visible && !document.hidden && !raf) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (visible) setInView(true);
        start();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    document.addEventListener("visibilitychange", start);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", start);
    };
  }, []);

  function move(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    const r = ref.current!.getBoundingClientRect();
    pointer.current = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: ((e.clientY - r.top) / r.height) * 2 - 1 };
  }

  return (
    <div
      ref={ref}
      aria-hidden
      data-in={inView}
      data-intro={intro}
      onPointerMove={move}
      onPointerLeave={() => (pointer.current = null)}
      className={`mark3d relative select-none font-normal leading-none ${className}`}
    >
      {/* Suelo: rejilla en perspectiva y halo de luz bajo las letras */}
      <div className="mark3d-floor" />
      <div className="mark3d-glow" />

      {intro === "build" && <div className="mark3d-scan" />}
      <div ref={stage} className="mark3d-stage" style={{ ["--mid" as string]: ([...text].length - 1) / 2 }}>
        {[...text].map((c, i) => (
          <span key={i} className="mark3d-letter" style={{ ["--i" as string]: i }}>
            {Array.from({ length: DEPTH }, (_, k) => (
              <span key={k} className="mark3d-layer" style={{ ["--k" as string]: k + 1 }}>
                {c}
              </span>
            ))}
            <span className="mark3d-face" data-c={c}>
              {c}
            </span>
          </span>
        ))}
      </div>
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
