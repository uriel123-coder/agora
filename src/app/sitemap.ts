import type { MetadataRoute } from "next";
import demoPublications from "@/data/demo/publications.json";
import { CATEGORIES } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  // Sitemap usa catálogo demo para no bloquear el build con Sheets.
  const pubs = demoPublications as Publication[];
  const staticRoutes = [
    "",
    "/explorar",
    "/categorias",
    "/buscar",
    "/ideas-en-dialogo",
    "/tres-mundos-una-historia",
    ...CATEGORIES.map((c) => `/${c.slug}`),
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
    })),
    ...pubs
      .filter((p) => p.accessLevel === "public" && p.status === "published")
      .map((p) => ({
        url: `${base}/publicacion/${p.slug}`,
        lastModified: new Date(p.updatedAt ?? p.publishedAt),
      })),
  ];
}
