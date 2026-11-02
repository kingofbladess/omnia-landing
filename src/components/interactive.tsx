"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Botón magnético: se desplaza hacia el cursor y tiene un brillo que lo sigue. */
export function MagneticButton({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
  type,
  disabled,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);

  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || prefersReducedMotion() || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--bx", `${x}px`);
    el.style.setProperty("--by", `${y}px`);
    el.style.transform = `translate(${(x - r.width / 2) * 0.18}px, ${(y - r.height / 2) * 0.28}px)`;
  }
  function leave() {
    if (ref.current) ref.current.style.transform = "";
  }

  const base =
    "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out will-change-transform disabled:opacity-50 disabled:pointer-events-none";
  const styles =
    variant === "primary"
      ? "bg-accent text-white shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset,0_10px_40px_-10px_rgba(61,123,255,0.8)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2)_inset,0_14px_50px_-8px_rgba(61,123,255,1)]"
      : "border border-line-strong bg-white/[0.02] text-fg hover:border-accent-2/60 hover:bg-white/[0.05]";

  const inner = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120px circle at var(--bx, 50%) var(--by, 50%), rgba(255,255,255,0.35), transparent 60%)",
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </>
  );

  const props = {
    onPointerMove: move,
    onPointerLeave: leave,
    className: `${base} ${styles} ${className}`,
  };

  if (href) {
    return (
      <Link href={href} ref={ref as React.Ref<HTMLAnchorElement>} {...props}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref as React.Ref<HTMLButtonElement>} type={type ?? "button"} onClick={onClick} disabled={disabled} {...props}>
      {inner}
    </button>
  );
}

/** Tarjeta con foco de luz e inclinación 3D según el cursor. */
export function SpotCard({ children, className = "", tilt = true }: { children: ReactNode; className?: string; tilt?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--mx", `${x}px`);
    el.style.setProperty("--my", `${y}px`);
    if (tilt && !prefersReducedMotion() && e.pointerType === "mouse") {
      const rx = ((y / r.height) - 0.5) * -6;
      const ry = ((x / r.width) - 0.5) * 6;
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    }
  }
  function leave() {
    if (ref.current) ref.current.style.transform = "";
  }
  return (
    <div
      ref={ref}
      onPointerMove={move}
      onPointerLeave={leave}
      className={`spot rounded-2xl border border-line bg-panel/60 transition-transform duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  );
}

/** Revela su contenido al entrar en pantalla. */
export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        // También revela si ya quedó por encima (p. ej. al saltar con un enlace del menú).
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ ["--d" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Contador animado. */
export function Counter({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value.toFixed(decimals));
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    setDisplay((0).toFixed(decimals));
    let raf = 0;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const dur = 1600;
      const tick = (t: number) => {
        const p = Math.min(1, (t - start) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        setDisplay((value * eased).toFixed(decimals));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, decimals]);
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
