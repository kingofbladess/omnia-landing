/**
 * Devuelve `next` solo si es una ruta interna del sitio; si no, `fallback`.
 * Evita redirecciones abiertas: rechaza "//otro.com", "/\otro.com" (los navegadores
 * tratan "\" como "/"), esquemas como "javascript:" y caracteres de control.
 */
export function safeRedirect(next: string | null | undefined, fallback = "/cuenta"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("\\") || /[\u0000-\u001f\u007f]/.test(next)) return fallback;
  try {
    const base = "https://omnia.invalid";
    const url = new URL(next, base);
    if (url.origin !== base) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}
