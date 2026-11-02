import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = `https://${site.domain}`;
  return ["", "/terminos", "/privacidad", "/cookies"].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));
}
