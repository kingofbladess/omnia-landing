import type { Metadata, Viewport } from "next";
import { Manrope, Sora, IBM_Plex_Mono, Michroma } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { site } from "@/content/site";

// Tipografía del sitio: Manrope (texto), Sora (títulos) e IBM Plex Mono (datos y etiquetas).
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-mono", display: "swap" });
// Solo para el nombre OMNIA en 3D (portada y pie).
const brand = Michroma({ weight: "400", subsets: ["latin"], variable: "--font-brand", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(`https://${site.domain}`),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description:
    "Data center, software a medida, inteligencia artificial y cloud segura para empresas. Diseñamos, construimos y operamos tu tecnología crítica.",
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description: "Infraestructura que piensa. Software que escala.",
    url: `https://${site.domain}`,
    siteName: site.name,
    locale: "es_VE",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070c",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${body.variable} ${display.variable} ${mono.variable} ${brand.variable}`}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
