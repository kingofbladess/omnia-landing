"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { configMessage } from "@/lib/portal";
import { getAccount } from "@/lib/supabase/account";
import { createClient } from "@/lib/supabase/client";
import { MagneticButton } from "./interactive";

const RACK_UNITS = 42;
const HOURS_PER_YEAR = 8760;

/** 6570 → "6.570" (formato fijo: igual en servidor y navegador). */
const thousands = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");

function Toggle({ label, desc, on, onChange }: { label: string; desc: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`group flex w-full items-start justify-between gap-4 rounded-xl border px-4 py-3 text-left transition-colors duration-200 ${
        on ? "border-accent/60 bg-accent/10" : "border-line bg-white/[0.02] hover:border-line-strong"
      }`}
    >
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted">{desc}</span>
      </span>
      <span className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-accent" : "bg-white/10"}`}>
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${on ? "translate-x-6" : "translate-x-1"}`}
        />
      </span>
    </button>
  );
}

const steps = [
  { t: "Indica tus servidores", d: "Los que tienes hoy o los que planeas tener.", icon: <path d="M5 3h14v18H5zM8 7h8M8 10.5h8M8 14h3" /> },
  { t: "Activa lo que necesitas", d: "Redundancia, GPU para IA o respaldo externo.", icon: <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" /> },
  { t: "Recibe una propuesta", d: "Te enviamos la estimación y lo afinamos contigo.", icon: <path d="M4 5h16v11H8l-4 4zM8 9h8M8 12.5h5" /> },
];

/**
 * Estimador de infraestructura: el visitante indica cuántos servidores necesita y ve
 * cuántos racks ocupan, cuánta energía consumen y qué disponibilidad puede esperar.
 * Los valores son orientativos y sirven para iniciar la conversación comercial.
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
    const totalU = serverU + networkU + powerU + storageU;
    const used = Math.min(RACK_UNITS, totalU);
    const racks = Math.max(1, Math.ceil(totalU / RACK_UNITS));
    const kw = servers * (gpu ? 1.6 : 0.45) * (redundancy ? 1.15 : 1);
    const tier = kw > 30 || racks > 1 ? "Enterprise" : kw > 10 ? "Business" : "Essential";
    const uptime = redundancy ? 99.98 : 99.7;
    const downtimeH = ((100 - uptime) / 100) * HOURS_PER_YEAR;
    const units: ("net" | "srv" | "gpu" | "sto" | "pwr" | "free")[] = [];
    for (let i = 0; i < networkU && units.length < RACK_UNITS; i++) units.push("net");
    for (let i = 0; i < serverU && units.length < RACK_UNITS; i++) units.push(gpu ? "gpu" : "srv");
    for (let i = 0; i < storageU && units.length < RACK_UNITS; i++) units.push("sto");
    while (units.length < RACK_UNITS - powerU) units.push("free");
    for (let i = 0; i < powerU && units.length < RACK_UNITS; i++) units.push("pwr");
    return { used, racks, kw, tier, uptime, downtimeH, units };
  }, [servers, redundancy, gpu]);

  const color: Record<string, string> = {
    net: "bg-accent-2/80",
    srv: "bg-accent/80",
    gpu: "bg-accent-3/85",
    sto: "bg-ok/70",
    pwr: "bg-warn/70",
    free: "bg-white/[0.04]",
  };

  const results = [
    { k: "Plan sugerido", v: calc.tier, d: cloud ? "Incluye respaldo externo de tus datos." : "Sin respaldo externo de datos." },
    { k: "Racks", v: String(calc.racks), d: `Armarios de ${RACK_UNITS}U necesarios para alojar tus equipos.` },
    { k: "Consumo eléctrico", v: `${calc.kw.toFixed(1)} kW`, d: `≈ ${thousands(Math.round(calc.kw * 730))} kWh al mes.` },
    {
      k: "Disponibilidad",
      v: `${calc.uptime}%`,
      d: `≈ ${calc.downtimeH < 10 ? calc.downtimeH.toFixed(1) : Math.round(calc.downtimeH)} h sin servicio al año.`,
    },
  ];

  const config = { servers, redundancy, gpu, cloud, tier: calc.tier, racks: calc.racks, kw: Number(calc.kw.toFixed(1)) };
  const [saved, setSaved] = useState<{ ok: boolean; text: string; login?: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  function request() {
    window.dispatchEvent(new CustomEvent("omnia:prefill", { detail: configMessage(config) }));
    document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
  }

  /** Guarda la configuración en la cuenta del cliente (si tiene sesión). */
  async function save() {
    setSaving(true);
    setSaved(null);
    try {
      const account = await getAccount();
      const user = account?.user;
      if (!user) return setSaved({ ok: false, text: "Inicia sesión para guardar configuraciones.", login: true });
      const { error } = await createClient().from("saved_configs").insert({
        user_id: user.id,
        name: `${calc.tier} · ${servers} servidores${gpu ? " GPU" : ""}`,
        data: config,
      });
      setSaved(error ? { ok: false, text: "No se pudo guardar (máximo 30 configuraciones)." } : { ok: true, text: "Guardada en tu cuenta." });
    } catch {
      setSaved({ ok: false, text: "No se pudo guardar." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Cómo funciona */}
      <ol className="grid gap-3 sm:grid-cols-3">
        {steps.map((s) => (
          <li key={s.t} className="glass-card flex items-start gap-3 rounded-xl p-4">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line-strong bg-accent/10 text-accent-2">
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {s.icon}
              </svg>
            </span>
            <span>
              <span className="block text-sm font-medium text-fg">{s.t}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">{s.d}</span>
            </span>
          </li>
        ))}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-12">
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-baseline justify-between gap-4">
              <label htmlFor="servers" className="text-sm font-medium text-fg">
                ¿Cuántos servidores necesitas?
              </label>
              <span className="font-display text-3xl font-semibold text-fg tabular-nums">{servers}</span>
            </div>
            <input
              id="servers"
              type="range"
              min={2}
              max={36}
              value={servers}
              onChange={(e) => setServers(Number(e.target.value))}
              aria-valuetext={`${servers} servidores`}
              className="mt-4 w-full accent-[var(--accent)]"
            />
            <div className="mt-1 flex justify-between text-[11px] text-muted">
              <span>2</span>
              <span>36</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Toggle label="Redundancia N+1" desc="Energía y red duplicadas: si un equipo falla, otro sigue funcionando." on={redundancy} onChange={setRedundancy} />
            <Toggle label="Cómputo IA" desc="Servidores con GPU para entrenar o ejecutar modelos de IA." on={gpu} onChange={setGpu} />
            <Toggle label="Respaldo cloud" desc="Copia de tus datos fuera del sitio, por si ocurre un desastre." on={cloud} onChange={setCloud} />
          </div>

          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {results.map((m) => (
              <div key={m.k} className="glass-card rounded-xl p-4">
                <dt className="text-[11px] uppercase tracking-[0.14em] text-muted">{m.k}</dt>
                <dd className="mt-1 font-display text-xl font-semibold text-fg tabular-nums">{m.v}</dd>
                <dd className="mt-1 text-xs leading-relaxed text-muted">{m.d}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-wrap items-center gap-4">
            <MagneticButton onClick={request}>Enviar esta configuración</MagneticButton>
            <MagneticButton onClick={save} variant="ghost" arrow={false} disabled={saving}>
              {saving ? "Guardando…" : "Guardar en mi cuenta"}
            </MagneticButton>
            <p className="w-full max-w-md text-xs leading-relaxed text-muted" role="status">
              {saved ? (
                <span className={saved.ok ? "text-ok" : "text-[#ff8a8a]"}>
                  {saved.text}{" "}
                  {saved.ok && (
                    <Link href="/cuenta/configuraciones" className="text-accent-2 underline-offset-4 hover:underline">
                      Ver mis configuraciones
                    </Link>
                  )}
                  {saved.login && (
                    <Link href="/acceso?next=/%23infraestructura" className="text-accent-2 underline-offset-4 hover:underline">
                      Iniciar sesión
                    </Link>
                  )}
                </span>
              ) : (
                "Estimación orientativa. «Enviar» llena el formulario de contacto; «Guardar» la deja en tu cuenta para compararla después."
              )}
            </p>
          </div>
        </div>

        <figure aria-label={`Vista del rack: ${calc.used} de ${RACK_UNITS} unidades ocupadas`} className="relative mx-auto w-full max-w-[320px]">
          <div className="relative overflow-hidden rounded-xl border border-line-strong bg-[#070b14] p-3 shadow-[0_30px_80px_-30px_rgba(61,123,255,0.5)]">
            <div className="mb-2 flex items-center justify-between font-mono text-[10px] text-muted">
              <span>Vista del rack{calc.racks > 1 ? ` (1 de ${calc.racks})` : ""}</span>
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
            <div aria-hidden className="rack-scan pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-transparent via-accent-2/10 to-transparent" />
          </div>
          <figcaption className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-muted">
            {[
              ["bg-accent-2/80", "Red"],
              [gpu ? "bg-accent-3/85" : "bg-accent/80", gpu ? "Servidor GPU" : "Servidor"],
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
    </div>
  );
}
