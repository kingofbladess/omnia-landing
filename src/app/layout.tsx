import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { site } from "@/content/site";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

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
    <html lang="es" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
