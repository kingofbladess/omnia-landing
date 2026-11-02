"use client";

import { useEffect, useState } from "react";

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
  const bars = Array.from({ length: 18 }, (_, i) => 30 + Math.abs(Math.sin((t + i) * 0.7)) * 70);

  return (
    <div aria-hidden className="w-full max-w-sm rounded-2xl border border-line-strong bg-[#08101e]/80 p-5 font-mono text-xs shadow-[0_30px_80px_-30px_rgba(61,123,255,0.45)] backdrop-blur-md">
      <div className="flex items-center justify-between text-muted">
        <span>omnia://noc/region-ve</span>
        <span className="flex items-center gap-1.5 text-ok">
          <span className="led h-1.5 w-1.5 rounded-full bg-ok" /> en línea
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">Latencia</div>
          <div className="mt-1 text-lg text-fg tabular-nums">{latency}ms</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">Carga</div>
          <div className="mt-1 text-lg text-fg tabular-nums">{load}%</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted">Nodos</div>
          <div className="mt-1 text-lg text-fg tabular-nums">128</div>
        </div>
      </div>
      <div className="mt-4 flex h-12 items-end gap-1">
        {bars.map((h, i) => (
          <span key={i} className="flex-1 rounded-sm bg-gradient-to-t from-accent/40 to-accent-2/90 transition-[height] duration-700" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
