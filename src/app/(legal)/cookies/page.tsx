import type { Metadata } from "next";
import { CookieSettingsButton } from "@/components/CookieBanner";
import { LegalHeader } from "@/components/LegalHeader";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Política de Cookies" };

const rows = [
  { name: "omnia_consent", type: "Necesaria", purpose: "Guarda tus preferencias de cookies.", duration: "180 días" },
  { name: "sb-*-auth-token", type: "Necesaria", purpose: "Mantiene tu sesión iniciada de forma segura (Supabase).", duration: "Sesión / hasta cerrar sesión" },
  { name: "Analítica (si se activa)", type: "Análisis", purpose: "Estadísticas anónimas de uso del sitio.", duration: "Según proveedor" },
  { name: "Marketing (si se activa)", type: "Marketing", purpose: "Medición de campañas publicitarias.", duration: "Según proveedor" },
];

export default function Cookies() {
  return (
    <>
      <LegalHeader
        title="Política de Cookies"
        intro={`Las cookies son pequeños archivos que el navegador guarda al visitar un sitio. En ${site.domain} las usamos para que el sitio funcione y, solo con tu permiso, para analizar su uso.`}
      />

      <h2>1. Tipos de cookies</h2>
      <ul>
        <li>
          <strong>Necesarias:</strong> imprescindibles para la seguridad, el inicio de sesión y recordar tus preferencias.
          No se pueden desactivar.
        </li>
        <li>
          <strong>Análisis:</strong> nos ayudan a entender cómo se usa el sitio para mejorarlo. Solo se activan si las
          aceptas.
        </li>
        <li>
          <strong>Marketing:</strong> permiten medir campañas. Solo se activan si las aceptas.
        </li>
      </ul>

      <h2>2. Cookies que usamos</h2>
      <div className="not-prose -mx-4 overflow-x-auto sm:mx-0">
        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line-strong text-fg">
              <th className="px-4 py-3 font-semibold">Cookie</th>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Finalidad</th>
              <th className="px-4 py-3 font-semibold">Duración</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-line text-[#b9c3d8]">
                <td className="px-4 py-3 font-mono text-xs">{r.name}</td>
                <td className="px-4 py-3">{r.type}</td>
                <td className="px-4 py-3">{r.purpose}</td>
                <td className="px-4 py-3">{r.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>3. Cómo cambiar tu elección</h2>
      <p>
        Puedes cambiar tus preferencias en cualquier momento:{" "}
        <CookieSettingsButton className="font-semibold text-accent-2 underline underline-offset-4" />. También puedes
        borrar las cookies desde la configuración de tu navegador; si borras las necesarias, se cerrará tu sesión.
      </p>

      <h2>4. Contacto</h2>
      <p>
        Dudas sobre cookies: <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
    </>
  );
}
