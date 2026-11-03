"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SISTEMA DE ÁREAS
 * ----------------
 * Cada sección de la página que tenga `data-area="Nombre"` y `data-area-color="--token"`
 * es un "área". Este componente:
 *  - dibuja la red de nodos de fondo en TODA la página (fija detrás del contenido);
 *  - detecta en qué área está el visitante;
 *  - al cambiar de área, la red cambia de color y lanza una onda de luz;
 *  - muestra un indicador lateral con las áreas (escritorio).
 */

type Area = { id: string; label: string; color: string };
type RGB = [number, number, number];
type Node = { x: number; y: number; vx: number; vy: number; r: number };

function readToken(token: string): RGB {
  const hex = getComputedStyle(document.documentElement).getPropertyValue(token).trim().replace("#", "");
  if (hex.length !== 6) return [61, 123, 255];
  return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
}

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a: number) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/** Icono de cada área en la barra lateral (por id de sección). */
const areaIcons: Record<string, React.ReactNode> = {
  hero: <path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />,
  soluciones: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  infraestructura: <path d="M5 3h14v18H5zM8 7h8M8 11h8M8 15h3M15.5 17.5h.01" />,
  metodo: <path d="M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM7 17h6a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h6" />,
  contacto: <path d="M4 5h16v11H8l-4 4zM8 9h8M8 12.5h5" />,
  cierre: <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" />,
};

export function AreaSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [areas, setAreas] = useState<Area[]>([]);
  const [active, setActive] = useState<string>("");
  const target = useRef<RGB>([61, 123, 255]);
  const wave = useRef<{ start: number } | null>(null);
  const redraw = useRef<() => void>(() => {});

  /* ---------- Detectar áreas y la activa ---------- */
  useEffect(() => {
    const els = [...document.querySelectorAll<HTMLElement>("[data-area]")];
    setAreas(els.map((el) => ({ id: el.id, label: el.dataset.area ?? "", color: el.dataset.areaColor ?? "--accent" })));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive((e.target as HTMLElement).id)),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* ---------- Al cambiar de área: nuevo color + onda ---------- */
  useEffect(() => {
    const area = areas.find((a) => a.id === active);
    if (!area) return;
    target.current = readToken(area.color);
    wave.current = { start: performance.now() };
    redraw.current();
  }, [active, areas]);

  /* ---------- Red de nodos de fondo ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let nodes: Node[] = [];
    let color: RGB = [...target.current];
    let lastScroll = window.scrollY;
    let raf = 0;
    const pointer = { x: -9999, y: -9999, active: false };
    const BUCKETS = 6;
    const buckets: number[][] = Array.from({ length: BUCKETS }, () => []);
    const glowLines: number[] = [];
    let lastW = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      // En móvil la barra del navegador cambia solo el alto al hacer scroll: no rehacer la red.
      if (nodes.length && Math.abs(w - lastW) < 40) {
        for (const n of nodes) n.y = Math.min(n.y, h);
      } else {
        lastW = w;
        const count = Math.round(Math.min(120, (w * h) / 11000));
        nodes = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.4 + 0.6,
        }));
      }
      // Cambiar el tamaño del lienzo lo borra: con movimiento reducido no hay bucle que lo repinte.
      if (reduced) draw(performance.now());
    }

    function draw(now: number) {
      // El color se acerca suavemente al del área activa.
      color = reduced ? [...target.current] : mix(color, target.current, 0.045);
      const light = mix(color, [255, 255, 255], 0.55);
      const base = mix(color, [150, 170, 230], 0.55);

      // Onda de luz que se expande desde el centro al cambiar de área.
      let waveR = -1;
      let waveFade = 0;
      if (wave.current && !reduced) {
        const maxR = Math.hypot(w, h) * 0.6;
        waveR = (now - wave.current.start) * 1.1;
        waveFade = Math.max(0, 1 - waveR / maxR);
        if (waveFade <= 0) wave.current = null;
      }
      const cx = w / 2;
      const cy = h / 2;
      const boost = (x: number, y: number) =>
        waveR < 0 ? 0 : Math.max(0, 1 - Math.abs(Math.hypot(x - cx, y - cy) - waveR) / 90) * waveFade;

      ctx!.clearRect(0, 0, w, h);

      if (waveR >= 0) {
        ctx!.strokeStyle = rgba(color, 0.18 * waveFade);
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.arc(cx, cy, waveR, 0, Math.PI * 2);
        ctx!.stroke();
      }

      if (!reduced) {
        for (const n of nodes) {
          n.x += n.vx;
          n.y += n.vy;
          if (n.x < 0 || n.x > w) n.vx *= -1;
          if (n.y < 0) n.y += h;
          if (n.y > h) n.y -= h;
          if (pointer.active) {
            const dx = n.x - pointer.x;
            const dy = n.y - pointer.y;
            const d = Math.hypot(dx, dy);
            if (d < 90 && d > 0.1) {
              n.x += (dx / d) * 0.9;
              n.y += (dy / d) * 0.9;
            }
          }
        }
      }

      // Las líneas se agrupan por intensidad y se dibujan juntas: un solo trazo por grupo
      // en lugar de uno por línea (mucho menos trabajo para el navegador).
      const linkDist = 120;
      const linkDist2 = linkDist * linkDist;
      const mouseDist = 190;
      for (const b of buckets) b.length = 0;
      glowLines.length = 0;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= linkDist2) continue;
          const fade = 1 - Math.sqrt(d2) / linkDist;
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          const near = pointer.active ? Math.max(0, 1 - Math.hypot(mx - pointer.x, my - pointer.y) / mouseDist) : 0;
          const glow = Math.max(near, boost(mx, my));
          if (glow > 0.05) glowLines.push(a.x, a.y, b.x, b.y, fade, glow);
          else buckets[Math.min(BUCKETS - 1, (fade * BUCKETS) | 0)].push(a.x, a.y, b.x, b.y);
        }
      }
      ctx!.lineWidth = 0.6;
      for (let k = 0; k < BUCKETS; k++) {
        const list = buckets[k];
        if (!list.length) continue;
        ctx!.strokeStyle = rgba(base, ((k + 0.5) / BUCKETS) * 0.12);
        ctx!.beginPath();
        for (let q = 0; q < list.length; q += 4) {
          ctx!.moveTo(list[q], list[q + 1]);
          ctx!.lineTo(list[q + 2], list[q + 3]);
        }
        ctx!.stroke();
      }
      for (let q = 0; q < glowLines.length; q += 6) {
        const glow = glowLines[q + 5];
        ctx!.strokeStyle = rgba(light, glowLines[q + 4] * (0.12 + glow * 0.75));
        ctx!.lineWidth = 0.6 + glow;
        ctx!.beginPath();
        ctx!.moveTo(glowLines[q], glowLines[q + 1]);
        ctx!.lineTo(glowLines[q + 2], glowLines[q + 3]);
        ctx!.stroke();
      }

      // Nodos normales en un solo trazo; los iluminados, uno a uno.
      ctx!.fillStyle = rgba(base, 0.55);
      ctx!.beginPath();
      for (const n of nodes) {
        const near = pointer.active ? Math.max(0, 1 - Math.hypot(n.x - pointer.x, n.y - pointer.y) / mouseDist) : 0;
        const glow = Math.max(near, boost(n.x, n.y));
        if (glow > 0.05) continue;
        ctx!.moveTo(n.x + n.r, n.y);
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      }
      ctx!.fill();
      for (const n of nodes) {
        const near = pointer.active ? Math.max(0, 1 - Math.hypot(n.x - pointer.x, n.y - pointer.y) / mouseDist) : 0;
        const glow = Math.max(near, boost(n.x, n.y));
        if (glow <= 0.05) continue;
        ctx!.fillStyle = rgba(light, 0.5 + glow * 0.5);
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r + glow * 1.8, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop(now: number) {
      draw(now);
      raf = requestAnimationFrame(loop);
    }
    // Pestaña oculta: se detiene la animación (ahorra CPU y batería).
    function onVisibility() {
      if (reduced) return;
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(loop);
    }
    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 150);
    }

    function onScroll() {
      // Los nodos se desplazan un poco con el scroll: sensación de profundidad.
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (reduced) return;
      for (const n of nodes) n.y -= dy * 0.12;
    }
    function onMove(e: PointerEvent) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      if (reduced) draw(performance.now());
    }
    function onLeave() {
      pointer.active = false;
    }

    resize();
    redraw.current = () => reduced && draw(performance.now());
    if (reduced) draw(performance.now());
    else raf = requestAnimationFrame(loop);

    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const activeIndex = areas.findIndex((a) => a.id === active);

  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen" />

      {/* Barra de áreas: vertical a la izquierda (escritorio), horizontal abajo (móvil) */}
      {areas.length > 0 && (
        <nav
          aria-label="Áreas de la página"
          className="glass-pill fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full p-1.5 lg:bottom-auto lg:left-5 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0"
        >
          <ol className="relative flex gap-1.5 lg:flex-col">
            {/* Círculo blanco que se desliza hasta el área activa */}
            <span
              aria-hidden
              className={`absolute left-0 top-0 h-11 w-11 rounded-full bg-fg shadow-[0_0_24px_rgba(255,255,255,0.35)] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.5,1)] ${
                activeIndex < 0 ? "opacity-0" : "opacity-100"
              } translate-x-[calc(var(--i)*3.125rem)] lg:translate-x-0 lg:translate-y-[calc(var(--i)*3.125rem)]`}
              style={{ ["--i" as string]: Math.max(0, activeIndex) }}
            />
            {areas.map((a) => {
              const on = a.id === active;
              return (
                <li key={a.id} className="relative">
                  <button
                    type="button"
                    onClick={() => document.getElementById(a.id)?.scrollIntoView({ behavior: "smooth" })}
                    aria-current={on ? "true" : undefined}
                    aria-label={a.label}
                    className={`group relative z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 ${
                      on ? "text-bg" : "text-muted hover:bg-white/10 hover:text-fg"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      {areaIcons[a.id] ?? <circle cx="12" cy="12" r="3" />}
                    </svg>
                    {/* Nombre al pasar el ratón */}
                    <span className="pointer-events-none absolute left-full top-1/2 ml-3 border border-[var(--glass-border)] bg-bg/90 shadow-lg hidden -translate-x-1 -translate-y-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs text-fg opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 lg:block">
                      {a.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      )}
    </>
  );
}

/** Divisor entre áreas: la línea se dibuja desde el centro hacia los lados al entrar en pantalla. */
export function AreaDivider({ label }: { label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} aria-hidden data-in={inView} className="area-divider group mx-auto flex max-w-7xl items-center gap-4 overflow-x-clip px-4 sm:px-6 lg:px-8">
      <span className="relative h-px flex-1 origin-right scale-x-0 bg-gradient-to-l from-accent-2/70 via-line-strong to-transparent transition-transform duration-1000 ease-out group-data-[in=true]:scale-x-100" />
      <span className="flex translate-y-2 items-center gap-2 rounded-full border border-line-strong bg-bg/80 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted opacity-0 backdrop-blur transition-all delay-300 duration-700 group-data-[in=true]:translate-y-0 group-data-[in=true]:text-fg group-data-[in=true]:opacity-100">
        <span className="led h-1.5 w-1.5 rounded-full bg-accent-2" />
        {label}
      </span>
      <span className="relative h-px flex-1 origin-left scale-x-0 bg-gradient-to-r from-accent-2/70 via-line-strong to-transparent transition-transform duration-1000 ease-out group-data-[in=true]:scale-x-100">
        <span className="divider-beam absolute -top-[3px] h-[7px] w-16 -translate-x-1/2 rounded-full bg-accent-2/80 opacity-0 blur-[3px]" />
      </span>
    </div>
  );
}
