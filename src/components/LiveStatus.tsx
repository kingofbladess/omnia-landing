"use client";

import { useEffect, useRef, useState } from "react";

const services = [
  { name: "Data center", detail: "Rack A01–A04" },
  { name: "Cloud híbrida", detail: "3 regiones" },
  { name: "Agentes IA", detail: "12 activos" },
];

/** Topología: núcleo OMNIA en el centro y los servicios alrededor. */
const CORE = { x: 180, y: 78 };
const NODES = [
  { id: "dc", label: "DATA CENTER", x: 46, y: 34 },
  { id: "cloud", label: "CLOUD", x: 314, y: 34 },
  { id: "ia", label: "IA", x: 314, y: 122 },
  { id: "edge", label: "CLIENTES", x: 46, y: 122 },
];
/** Enlace curvo del núcleo a cada nodo. */
const link = (n: { x: number; y: number }) => `M${CORE.x},${CORE.y} C${(CORE.x + n.x) / 2},${CORE.y} ${(CORE.x + n.x) / 2},${n.y} ${n.x},${n.y}`;

/** Panel tipo consola de operaciones. Datos decorativos. */
export function LiveStatus() {
  const [t, setT] = useState(0);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setReduced(true);
      return;
    }
    // Solo se anima mientras está en pantalla y la pestaña está visible
    // (en móvil el panel está oculto: nunca se anima).
    let id = 0;
    let visible = false;
    const sync = () => {
      window.clearInterval(id);
      const on = visible && !document.hidden;
      if (on) id = window.setInterval(() => setT((v) => v + 1), 1400);
      // Los paquetes del mapa (animación SVG) también se detienen fuera de pantalla.
      const svg = el.querySelector("svg");
      if (svg && on) svg.unpauseAnimations();
      else if (svg) svg.pauseAnimations();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      sync();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(id);
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  const latency = (11 + Math.sin(t * 1.7) * 2.4 + Math.cos(t * 0.6)).toFixed(1);
  const load = Math.round(62 + Math.sin(t * 0.9) * 9);
  const traffic = (4.6 + Math.sin(t * 0.8) * 0.9 + Math.cos(t * 1.9) * 0.3).toFixed(1);

  return (
    <div
      ref={ref}
      aria-hidden
      className="glass relative w-[25rem] overflow-hidden rounded-2xl font-mono text-xs"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-2/70 to-transparent" />

      <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3 text-muted">
        <span className="flex items-center gap-2">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-white/10" />
            <span className="h-2 w-2 rounded-full bg-white/10" />
            <span className="h-2 w-2 rounded-full bg-white/10" />
          </span>
          <span className="ml-1 truncate">noc://omnia/region-ve</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5 text-ok">
          <span className="led h-1.5 w-1.5 rounded-full bg-ok" />
          en línea
        </span>
      </div>

      <div className="grid grid-cols-3 divide-x divide-line border-b border-line">
        {[
          ["Latencia", `${latency}ms`],
          ["Carga", `${load}%`],
          ["Uptime", "99.98%"],
        ].map(([k, v]) => (
          <div key={k} className="px-5 py-4">
            <div className="text-[10px] uppercase tracking-widest text-muted">{k}</div>
            <div className="mt-1.5 text-lg text-fg tabular-nums">{v}</div>
          </div>
        ))}
      </div>

      {/* Mapa de red en vivo: paquetes viajando entre el núcleo y los servicios */}
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted">
          <span>Topología · tráfico</span>
          <span className="text-accent-2 tabular-nums normal-case tracking-normal">{traffic} Gb/s</span>
        </div>
        <svg viewBox="0 0 360 156" className="mt-2 h-auto w-full overflow-visible">
          <defs>
            <radialGradient id="noc-core" cx="50%" cy="50%" r="50%">
              <stop offset="0" stopColor="#00d1ff" stopOpacity="0.9" />
              <stop offset="1" stopColor="#3d7bff" stopOpacity="0.15" />
            </radialGradient>
            <pattern id="noc-dots" width="12" height="12" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="rgba(148,178,255,0.14)" />
            </pattern>
          </defs>
          <rect width="360" height="156" fill="url(#noc-dots)" />

          {/* Enlaces */}
          {NODES.map((n) => (
            <g key={n.id}>
              <path d={link(n)} fill="none" stroke="rgba(148,178,255,0.18)" strokeWidth="1" />
              <path d={link(n)} fill="none" stroke="url(#noc-core)" strokeWidth="1" strokeDasharray="2 6" opacity="0.7">
                {!reduced && <animate attributeName="stroke-dashoffset" from="0" to="-32" dur="1.6s" repeatCount="indefinite" />}
              </path>
            </g>
          ))}

          {/* Paquetes: salen del núcleo y vuelven (dos por enlace, desfasados) */}
          {!reduced &&
            NODES.map((n, i) => (
              <g key={`p-${n.id}`}>
                <circle r="2.2" fill="#00d1ff">
                  <animateMotion dur={`${2.4 + i * 0.35}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" path={link(n)} />
                </circle>
                <circle r="1.6" fill="#ffffff" opacity="0.85">
                  <animateMotion dur={`${3 + i * 0.3}s`} begin={`${1.1 + i * 0.3}s`} repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear" path={link(n)} />
                </circle>
              </g>
            ))}

          {/* Nodos */}
          {NODES.map((n) => {
            const right = n.x > CORE.x;
            return (
              <g key={`n-${n.id}`}>
                <rect x={n.x - 7} y={n.y - 7} width="14" height="14" rx="3.5" fill="#0a0f1a" stroke="rgba(0,209,255,0.7)" strokeWidth="1" />
                <circle cx={n.x} cy={n.y} r="2" fill="#2fd68f" />
                <text
                  x={right ? n.x - 12 : n.x + 12}
                  y={n.y + (n.y < CORE.y ? -10 : 18)}
                  textAnchor={right ? "end" : "start"}
                  fontSize="8"
                  letterSpacing="1.2"
                  fill="#8d99b3"
                >
                  {n.label}
                </text>
              </g>
            );
          })}

          {/* Núcleo con pulso */}
          <circle cx={CORE.x} cy={CORE.y} r="14" fill="none" stroke="#00d1ff" strokeWidth="1" opacity="0.6">
            {!reduced && (
              <>
                <animate attributeName="r" from="14" to="34" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2.4s" repeatCount="indefinite" />
              </>
            )}
          </circle>
          <polygon
            points={Array.from({ length: 6 }, (_, k) => {
              const a = (Math.PI / 3) * k - Math.PI / 2;
              return `${(CORE.x + Math.cos(a) * 15).toFixed(1)},${(CORE.y + Math.sin(a) * 15).toFixed(1)}`;
            }).join(" ")}
            fill="url(#noc-core)"
            stroke="#00d1ff"
            strokeWidth="1"
          />
          <text x={CORE.x} y={CORE.y + 2.8} textAnchor="middle" fontSize="7" letterSpacing="0.8" fill="#ffffff" fontWeight="600">
            CORE
          </text>
        </svg>
      </div>

      <ul className="mt-3 border-t border-line">
        {services.map((s) => (
          <li key={s.name} className="flex items-center justify-between border-b border-line px-5 py-2.5 last:border-b-0">
            <span className="flex items-center gap-2.5 text-fg/90">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" />
              {s.name}
            </span>
            <span className="text-muted">{s.detail}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
