/** Utilidades compartidas del área de clientes y del panel de administración. */

export const TZ = "America/Caracas";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const fmtDate = (iso: string) => new Date(iso).toLocaleDateString("es-VE", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-VE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ });

export const fmtSize = (bytes: number | null) =>
  bytes == null ? "" : bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

/** Etapas de una solicitud, en orden. */
export const LEAD_STAGES = [
  { id: "nuevo", label: "Recibida" },
  { id: "contactado", label: "En conversación" },
  { id: "cerrado", label: "Cerrada" },
] as const;

export const MEETING_STATUS: Record<string, { label: string; cls: string }> = {
  solicitada: { label: "Solicitada", cls: "bg-warn/15 text-warn" },
  confirmada: { label: "Confirmada", cls: "bg-ok/15 text-ok" },
  cancelada: { label: "Cancelada", cls: "bg-white/[0.06] text-muted" },
};

export const SERVICE_STATUS: Record<string, { label: string; cls: string }> = {
  activo: { label: "Activo", cls: "bg-ok/15 text-ok" },
  mantenimiento: { label: "Mantenimiento", cls: "bg-warn/15 text-warn" },
  suspendido: { label: "Suspendido", cls: "bg-[#ff8a8a]/15 text-[#ff8a8a]" },
};

export const SERVICE_KINDS: Record<string, string> = {
  datacenter: "Data center",
  servidores: "Servidores",
  software: "Software",
  ia: "IA aplicada",
  cloud: "Cloud y seguridad",
  otro: "Otro",
};

/** Configuración del estimador que se guarda en la cuenta. */
export type RackConfig = { servers: number; redundancy: boolean; gpu: boolean; cloud: boolean; tier: string; racks: number; kw: number };

export function configMessage(c: RackConfig) {
  return `Hola, me interesa una infraestructura ${c.tier}: ${c.servers} servidores${c.gpu ? " con GPU para IA" : ""}, ${
    c.redundancy ? "con redundancia N+1" : "sin redundancia"
  }${c.cloud ? " y respaldo en la nube" : ""}. El estimador indica ${c.racks} rack(s) y unos ${c.kw.toFixed(1)} kW. ¿Podemos conversar?`;
}

/** Nombre seguro para un archivo subido (sin rutas ni caracteres raros). */
export function safeFileName(name: string) {
  const clean = name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
  return clean.slice(-120) || "archivo";
}
