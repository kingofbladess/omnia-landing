/**
 * TEXTOS DEL SITIO
 * ----------------
 * Todo el contenido editable de la landing vive aquí.
 * IMPORTANTE: los textos y cifras actuales son PROVISIONALES.
 * Reemplázalos con los datos reales de la empresa antes de publicar.
 */

export const site = {
  name: "OMNIA",
  legalName: "OMNIA Tecnología e Infraestructura, C.A.",
  rif: "J-50886695-9",
  domain: "omnia-landing-odp7.vercel.app",
  email: "contacto@omnia.ia.ve",
  phone: "+58 000 000 0000",
  city: "Maracaibo, Zulia, Venezuela",
  address:
    "Calle 67 con Avenida 3F, C.C. Camoruco, nivel PB, local 1-03, sector Bellas Artes, Maracaibo, estado Zulia, zona postal 4002",
  tagline: "Innovación tecnológica de punta a punta",
};

export const nav = [
  { href: "#soluciones", label: "Soluciones" },
  { href: "#infraestructura", label: "Infraestructura" },
  { href: "#metodo", label: "Método" },
  { href: "#contacto", label: "Contacto" },
];

export const hero = {
  eyebrow: "Data center · Software · Inteligencia artificial",
  title: ["Infraestructura que piensa.", "Software que escala."],
  subtitle:
    "Diseñamos, construimos y operamos la tecnología crítica de tu empresa: desde el rack hasta la última línea de código.",
  primary: { label: "Agenda una consultoría", href: "#contacto" },
  secondary: { label: "Explora soluciones", href: "#soluciones" },
  proof: ["Soporte 24/7", "Diagnóstico sin costo", "Desde Maracaibo"],
};

export const capabilities = [
  "Centros de datos",
  "Cloud híbrida",
  "Software a medida",
  "IA aplicada",
  "Ciberseguridad",
  "Redes y conectividad",
  "Automatización",
  "Soporte 24/7",
];

export const solutions = [
  {
    id: "dc",
    code: "01",
    title: "Data Center",
    text: "Diseño, implementación y operación de centros de datos con alta disponibilidad, energía redundante y monitoreo continuo.",
    points: ["Colocation y racks dedicados", "Energía y climatización redundante", "Monitoreo NOC 24/7"],
  },
  {
    id: "sw",
    code: "02",
    title: "Software a medida",
    text: "Plataformas web, móviles y sistemas empresariales construidos para tu operación, integrados con lo que ya usas.",
    points: ["ERP, CRM e integraciones", "Apps web y móviles", "APIs y microservicios"],
  },
  {
    id: "ai",
    code: "03",
    title: "IA aplicada",
    text: "Modelos y asistentes que automatizan procesos, analizan datos y convierten información en decisiones.",
    points: ["Asistentes y agentes", "Análisis predictivo", "Visión y documentos"],
  },
  {
    id: "sec",
    code: "04",
    title: "Cloud y seguridad",
    text: "Arquitecturas híbridas seguras, respaldos y continuidad de negocio para que tu operación nunca se detenga.",
    points: ["Cloud híbrida y migraciones", "Backups y recuperación", "Hardening y auditorías"],
  },
];

/** Cifras de ejemplo: cámbialas por las reales. */
export const stats = [
  { value: 24, suffix: "/7", label: "Monitoreo de infraestructura" },
  { value: 99.9, suffix: "%", decimals: 1, label: "Objetivo de disponibilidad" },
  { value: 4, suffix: "", label: "Líneas de servicio integradas" },
  { value: 1, suffix: "", label: "Solo proveedor, de punta a punta" },
];

export const method = [
  { step: "Diagnóstico", text: "Analizamos tu infraestructura, procesos y metas para detectar dónde está el mayor impacto." },
  { step: "Arquitectura", text: "Diseñamos la solución completa: hardware, software, datos y seguridad, con costos claros." },
  { step: "Implementación", text: "Desplegamos por fases medibles, sin detener tu operación." },
  { step: "Operación", text: "Monitoreamos, mantenemos y mejoramos continuamente con soporte dedicado." },
];
