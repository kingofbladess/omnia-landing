"use client";

import { useMemo, useState } from "react";
import { MagneticButton } from "./interactive";

const RACK_UNITS = 42;

function Toggle({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`group flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${
        on ? "border-accent/60 bg-accent/10" : "border-line bg-white/[0.02] hover:border-line-strong"
      }`}
    >
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="block text-xs text-muted">{desc}</span>
      </span>
      <span className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-accent" : "bg-white/10"}`}>
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
    </button>
  );
}

/**
 * Configurador interactivo: el visitante arma su rack y ve el resultado en vivo.
 * Los valores son ilustrativos y sirven para iniciar la conversación comercial.
 */
export function RackConfigurator() {
  const [servers, setServers] = useState(12);
  const [redundancy, setRedundancy] = useState(true);
  const [gpu, setGpu] = useState(false);
  const [cloud, setCloud] = useState(true);

  const calc = useMemo(() => {
    const serverU = servers * (gpu ? 2 : 1);
    const networkU = 2 + (redundancy ? 2 : 0);
    const powerU = redundancy ? 4 : 2;
    const storageU = Math.ceil(servers / 6) * 2;
    const used = Math.min(RACK_UNITS, serverU + networkU + powerU + storageU);
    const racks = Math.max(1, Math.ceil((serverU + networkU + powerU + storageU) / RACK_UNITS));
    const kw = servers * (gpu ? 1.6 : 0.45) * (redundancy ? 1.15 : 1);
    const tier = kw > 30 || racks > 1 ? "Enterprise" : kw > 10 ? "Business" : "Essential";
    const uptime = redundancy ? "99.98%" : "99.7%";
    const units: ("net" | "srv" | "gpu" | "sto" | "pwr" | "free")[] = [];
    for (let i = 0; i < networkU && units.length < RACK_UNITS; i++) units.push("net");
    for (let i = 0; i < serverU && units.length < RACK_UNITS; i++) units.push(gpu ? "gpu" : "srv");
    for (let i = 0; i < storageU && units.length < RACK_UNITS; i++) units.push("sto");
    while (units.length < RACK_UNITS - powerU) units.push("free");
    for (let i = 0; i < powerU && units.length < RACK_UNITS; i++) units.push("pwr");
    return { used, racks, kw, tier, uptime, units };
  }, [servers, redundancy, gpu]);

  const color: Record<string, string> = {
    net: "bg-accent-2/80",
    srv: "bg-accent/80",
    gpu: "bg-[#8b5cf6]/85",
    sto: "bg-ok/70",
    pwr: "bg-warn/70",
    free: "bg-white/[0.04]",
  };

  function request() {
    const msg = `Me interesa una configuración ${calc.tier}: ${servers} servidores${gpu ? " con GPU para IA" : ""}, ${
      redundancy ? "redundancia N+1" : "sin redundancia"
    }${cloud ? ", respaldo en la nube" : ""}.`;
    window.dispatchEvent(new CustomEvent("omnia:prefill", { detail: msg }));
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
      <div className="space-y-6">
        <div className="rounded-2xl border border-line bg-panel/60 p-6">
          <div className="flex items-baseline justify-between">
            <label htmlFor="servers" className="text-sm font-medium text-fg">
              Servidores
            </label>
            <span className="font-mono text-3xl font-semibold text-fg tabular-nums">{servers}</span>
          </div>
          <input
            id="servers"
            type="range"
            min={2}
            max={36}
            value={servers}
            onChange={(e) => setServers(Number(e.target.value))}
            className="mt-4 w-full accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between font-mono text-[11px] text-muted">
            <span>2</span>
            <span>36</span>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Toggle label="Redundancia N+1" desc="Energía y red duplicadas" on={redundancy} onChange={setRedundancy} />
          <Toggle label="Cómputo IA" desc="Servidores con GPU" on={gpu} onChange={setGpu} />
          <Toggle label="Respaldo cloud" desc="Copias fuera de sitio" on={cloud} onChange={setCloud} />
        </div>

        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Plan sugerido", v: calc.tier },
            { k: "Racks", v: String(calc.racks) },
            { k: "Consumo aprox.", v: `${calc.kw.toFixed(1)} kW` },
            { k: "Disponibilidad", v: calc.uptime },
          ].map((m) => (
            <div key={m.k} className="rounded-xl border border-line bg-white/[0.02] p-4">
              <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{m.k}</dt>
              <dd className="mt-1 font-display text-xl font-semibold text-fg">{m.v}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center gap-4">
          <MagneticButton onClick={request}>Solicitar esta configuración</MagneticButton>
          <p className="text-xs text-muted">Valores ilustrativos. Te enviamos una propuesta real tras el diagnóstico.</p>
        </div>
      </div>

      <figure aria-label={`Vista del rack: ${calc.used} de ${RACK_UNITS} unidades ocupadas`} className="relative mx-auto w-full max-w-[320px]">
        <div className="relative overflow-hidden rounded-xl border border-line-strong bg-[#070b14] p-3 shadow-[0_30px_80px_-30px_rgba(61,123,255,0.5)]">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-muted">
            <span>RACK-A01</span>
            <span>
              {calc.used}/{RACK_UNITS}U
            </span>
          </div>
          <div className="flex flex-col gap-[3px]">
            {calc.units.map((u, i) => (
              <div
                key={i}
                className={`relative h-[7px] rounded-[2px] transition-colors duration-500 ${color[u]}`}
                style={{ transitionDelay: `${i * 8}ms` }}
              >
                {u !== "free" && (
                  <span
                    className="led absolute right-1 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white"
                    style={{ animationDelay: `${(i * 137) % 1600}ms` }}
                  />
                )}
              </div>
            ))}
          </div>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-accent-2/10 to-transparent"
            style={{ animation: "scan 4s linear infinite" }}
          />
        </div>
        <figcaption className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-muted">
          {[
            ["bg-accent-2/80", "Red"],
            [gpu ? "bg-[#8b5cf6]/85" : "bg-accent/80", gpu ? "GPU" : "Servidor"],
            ["bg-ok/70", "Almacenamiento"],
            ["bg-warn/70", "Energía"],
          ].map(([c, l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-sm ${c}`} />
              {l}
            </span>
          ))}
        </figcaption>
      </figure>
    </div>
  );
}
