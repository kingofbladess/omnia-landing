"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

const SPRING = "cubic-bezier(0.34, 1.8, 0.5, 1)";
const DRAG_CANCEL_PX = 70;

/**
 * Botón interactivo:
 * - Con el ratón encima, se desplaza hacia el cursor (magnético) y un brillo lo sigue.
 * - Al mantenerlo pulsado (ratón o dedo) se puede estirar y arrastrar; al soltarlo vuelve con efecto muelle.
 * - Cada pulsación lanza una onda desde el punto de contacto.
 * - Si se arrastra lejos y se suelta, no se activa (evita clics accidentales).
 */
export function MagneticButton({
  href,
  children,
  variant = "primary",
  className = "",
  onClick,
  type,
  disabled,
  arrow = true,
  ariaLabel,
}: {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  arrow?: boolean;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const box = useRef<DOMRect | null>(null);
  const pressed = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const dragged = useRef(0);

  function apply(tx: number, ty: number, sx: number, sy: number, ms: number, ease = "ease-out") {
    const el = ref.current;
    if (!el) return;
    el.style.transition = `transform ${ms}ms ${ease}, background-color .3s, border-color .3s, box-shadow .3s`;
    el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${sx}, ${sy})`;
  }

  /** Medida del botón sin transformar, para que el efecto no "tiemble". */
  function measure() {
    const el = ref.current;
    if (!el) return null;
    if (!box.current) {
      const r = el.getBoundingClientRect();
      const m = new DOMMatrixReadOnly(getComputedStyle(el).transform === "none" ? undefined : getComputedStyle(el).transform);
      box.current = new DOMRect(r.left - m.m41, r.top - m.m42, el.offsetWidth, el.offsetHeight);
    }
    return box.current;
  }

  function move(e: React.PointerEvent) {
    const el = ref.current;
    const r = measure();
    if (!el || !r || prefersReducedMotion()) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty("--bx", `${x}px`);
    el.style.setProperty("--by", `${y}px`);
    const dx = x - r.width / 2;
    const dy = y - r.height / 2;

    if (pressed.current) {
      dragged.current = Math.max(dragged.current, Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y));
      // Estiramiento elástico: se alarga en la dirección del arrastre y se adelgaza en la otra.
      const pull = Math.min(1, Math.hypot(dx, dy) / Math.max(r.width, 120));
      const horizontal = Math.abs(dx) / (Math.abs(dx) + Math.abs(dy) + 0.001);
      const sx = 0.97 + pull * 0.16 * horizontal - pull * 0.06 * (1 - horizontal);
      const sy = 0.97 + pull * 0.16 * (1 - horizontal) - pull * 0.06 * horizontal;
      const k = 0.55 / (1 + Math.hypot(dx, dy) / 260); // cuanto más lejos, más resistencia
      apply(dx * k, dy * k, sx, sy, 90);
    } else if (e.pointerType === "mouse") {
      apply(dx * 0.18, dy * 0.28, 1, 1, 250);
    }
  }

  function ripple(e: React.PointerEvent) {
    const el = ref.current;
    const r = measure();
    if (!el || !r || prefersReducedMotion()) return;
    const size = Math.max(r.width, r.height) * 2.2;
    const dot = document.createElement("span");
    dot.className = "btn-ripple";
    dot.setAttribute("aria-hidden", "true");
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${e.clientX - r.left - size / 2}px`;
    dot.style.top = `${e.clientY - r.top - size / 2}px`;
    el.appendChild(dot);
    dot.addEventListener("animationend", () => dot.remove(), { once: true });
  }

  function down(e: React.PointerEvent) {
    if (disabled || e.button !== 0) return;
    pressed.current = true;
    dragged.current = 0;
    start.current = { x: e.clientX, y: e.clientY };
    box.current = null;
    ref.current?.setPointerCapture?.(e.pointerId);
    ripple(e);
    if (!prefersReducedMotion()) apply(0, 0, 0.95, 0.95, 120);
  }

  function release(e: React.PointerEvent) {
    if (!pressed.current) return;
    pressed.current = false;
    ref.current?.releasePointerCapture?.(e.pointerId);
    if (prefersReducedMotion()) return;
    const r = measure();
    const inside = r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (inside && e.pointerType === "mouse") {
      apply((e.clientX - r.left - r.width / 2) * 0.18, (e.clientY - r.top - r.height / 2) * 0.28, 1, 1, 650, SPRING);
    } else {
      apply(0, 0, 1, 1, 700, SPRING);
    }
  }

  function leave() {
    if (pressed.current) return;
    box.current = null;
    if (!prefersReducedMotion()) apply(0, 0, 1, 1, 600, SPRING);
  }

  /** Arrastrar lejos y soltar no cuenta como clic. */
  function clickCapture(e: React.MouseEvent) {
    if (dragged.current > DRAG_CANCEL_PX) {
      e.preventDefault();
      e.stopPropagation();
    }
    dragged.current = 0;
  }

  const base =
    "group relative inline-flex touch-manipulation select-none items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-[transform,background-color,border-color,box-shadow] duration-300 ease-out will-change-transform disabled:opacity-50 disabled:pointer-events-none";
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
      {arrow && (
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      )}
    </>
  );

  const props = {
    onPointerMove: move,
    onPointerLeave: leave,
    onPointerDown: down,
    onPointerUp: release,
    onPointerCancel: release,
    onClickCapture: clickCapture,
    onDragStart: (e: React.DragEvent) => e.preventDefault(),
    "aria-label": ariaLabel,
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
      className={`spot glass-card rounded-2xl transition-transform duration-300 ease-out ${className}`}
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
