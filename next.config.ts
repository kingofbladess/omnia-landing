import type { NextConfig } from "next";

/** Cabeceras de seguridad que se envían en todas las páginas. */
const securityHeaders = [
  // Nadie puede incrustar el sitio en un <iframe> (evita clickjacking).
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  // El navegador no "adivina" tipos de archivo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Al salir hacia otro sitio solo se comparte el dominio, nunca la ruta completa.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // El sitio no usa cámara, micrófono ni ubicación.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  // Siempre HTTPS (Traefik/Dokploy ya sirve con HTTPS; esto lo fija en el navegador).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Permite compilar en otra carpeta (p. ej. para verificar sin tocar el servidor de desarrollo).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Salida autocontenida para la imagen Docker (Dokploy).
  output: "standalone",
  // No anunciar "X-Powered-By: Next.js".
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
