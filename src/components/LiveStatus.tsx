"use client";

import { useEffect, useState } from "react";

const services = [
  { name: "Data center", detail: "Rack A01–A04" },
  { name: "Cloud híbrida", detail: "3 regiones" },
  { name: "Agentes IA", detail: "12 activos" },
];

/** Panel tipo consola de operaciones que da vida al hero. Datos decorativos. */
export function LiveStatus() {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setT((v) => v + 1), 1400);
    return () => clearInterval(id);
  }, []);

  const latency = (11 + Math.sin(t * 1.7) * 2.4 + Math.cos(t * 0.6)).toFixed(1);
  const load = Math.round(62 + Math.sin(t * 0.9) * 9);
  const bars = Array.from({ length: 24 }, (_, i) => 28 + Math.abs(Math.sin((t + i) * 0.7)) * 72);

  return (
    <div
      aria-hidden
      className="glass relative w-[400px] overflow-hidden rounded-2xl font-mono text-xs"
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

      <div className="px-5 pt-4">
        <div className="flex h-14 items-end gap-[3px]">
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 rounded-[2px] bg-gradient-to-t from-accent/30 to-accent-2/90 transition-[height] duration-700"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted/70">
          <span>-24h</span>
          <span>ahora</span>
        </div>
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
