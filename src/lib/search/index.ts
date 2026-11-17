import Fuse from "fuse.js";
import { CATEGORIES } from "@/lib/categories";
import { normalizeText } from "@/lib/utils/text";
import type {
  CategorySlug,
  ContentType,
  Publication,
  SearchFilters,
  SearchResponse,
  SearchResultItem,
} from "@/lib/types/content";

/** Sinónimos y plurales → tipo de contenido canónico. */
const CONTENT_TYPE_ALIASES: Record<string, ContentType> = {
  cuento: "cuento",
  cuentos: "cuento",
  fabula: "cuento",
  fabulas: "cuento",
  relato: "cuento",
  relatos: "cuento",
  leyenda: "cuento",
  leyendas: "cuento",
  poema: "poema",
  poemas: "poema",
  poesia: "poema",
  poesias: "poema",
  ensayo: "ensayo",
  ensayos: "ensayo",
  articulo: "articulo",
  articulos: "articulo",
  investigacion: "investigacion",
  investigaciones: "investigacion",
  experimento: "experimento",
  experimentos: "experimento",
  galeria: "galeria",
  galerias: "galeria",
  foto: "galeria",
  fotos: "galeria",
  imagen: "galeria",
  imagenes: "galeria",
  video: "video",
  videos: "video",
  audio: "audio",
  podcast: "audio",
  podcasts: "audio",
  documento: "documento",
  documentos: "documento",
  pdf: "documento",
  pdfs: "documento",
  docx: "documento",
  word: "documento",
  entrevista: "entrevista",
  entrevistas: "entrevista",
  proyecto: "proyecto",
  proyectos: "proyecto",
  obra: "obra",
  obras: "obra",
  reflexion: "reflexion",
  reflexiones: "reflexion",
};

const CATEGORY_ALIASES: Record<string, CategorySlug> = {
  letras: "taller-de-letras",
  literatura: "taller-de-letras",
  "taller de letras": "taller-de-letras",
  ciencia: "mentes-curiosas",
  "mentes curiosas": "mentes-curiosas",
  fe: "fe-y-pensamiento",
  "fe y pensamiento": "fe-y-pensamiento",
  shorashim: "shorashim",
  historia: "ecos-de-la-historia",
  "ecos de la historia": "ecos-de-la-historia",
  arte: "expresiones-del-arte",
  "expresiones del arte": "expresiones-del-arte",
  ideas: "ideas-en-dialogo",
  "ideas en dialogo": "ideas-en-dialogo",
  foro: "ideas-en-dialogo",
  voces: "voces-creadoras",
  "voces creadoras": "voces-creadoras",
};

function lightStem(token: string): string {
  const t = normalizeText(token);
  if (t.length <= 3) return t;
  if (t.endsWith("ciones")) return `${t.slice(0, -5)}cion`;
  if (t.endsWith("iones")) return `${t.slice(0, -5)}ion`;
  if (t.endsWith("eses")) return t.slice(0, -2);
  if (t.endsWith("es") && t.length > 4) return t.slice(0, -2);
  if (t.endsWith("s") && t.length > 3) return t.slice(0, -1);
  return t;
}

function expandQueryTokens(query: string): string[] {
  const raw = normalizeText(query)
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
  const out = new Set<string>();
  for (const token of raw) {
    out.add(token);
    out.add(lightStem(token));
    const type = CONTENT_TYPE_ALIASES[token] ?? CONTENT_TYPE_ALIASES[lightStem(token)];
    if (type) {
      out.add(normalizeText(type));
      out.add(lightStem(type));
    }
  }
  return [...out];
}

function mediaKindWords(pub: Publication): string {
  return pub.media
    .map((m) => {
      if (m.type === "video") return "video videos vídeo";
      if (m.type === "image") return "imagen imagenes foto fotos galeria";
      if (m.type === "audio") return "audio podcast podcasts";
      if (m.type === "pdf") return "pdf documento documentos";
      if (m.type === "document") return "documento documentos word docx";
      return m.type;
    })
    .join(" ");
}

function contentTypeWords(type: ContentType): string {
  const extras: Partial<Record<ContentType, string>> = {
    cuento: "cuento cuentos fabula fabulas relato relatos leyenda leyendas narrativa",
    poema: "poema poemas poesia literario",
    articulo: "articulo articulos ensayo investigacion",
    experimento: "experimento experimentos ciencia laboratorio",
    galeria: "galeria galerias foto fotos imagen imagenes",
    video: "video videos",
    documento: "documento documentos pdf",
    entrevista: "entrevista entrevistas",
    proyecto: "proyecto proyectos",
    reflexion: "reflexion reflexiones etica filosofia",
  };
  return `${type} ${extras[type] ?? ""}`;
}

function categoryWords(pub: Publication): string {
  return pub.categorySlugs
    .filter((c) => c !== "tres-mundos-una-historia")
    .map((slug) => {
      const cat = CATEGORIES.find((c) => c.slug === slug);
      return [slug.replace(/-/g, " "), cat?.name, cat?.tagline, cat?.description]
        .filter(Boolean)
        .join(" ");
    })
    .join(" ");
}

function buildHaystack(pub: Publication): string {
  return [
    pub.title,
    pub.subtitle,
    pub.summary,
    pub.body.replace(/<[^>]+>/g, " "),
    pub.tags.join(" "),
    pub.subject,
    pub.schoolYear,
    contentTypeWords(pub.contentType),
    mediaKindWords(pub),
    categoryWords(pub),
    pub.authors
      .filter((a) => a.nameVisible)
      .map((a) => a.displayName)
      .join(" "),
    pub.media.map((m) => m.title).join(" "),
    pub.historicalLinks.map((h) => h.label ?? "").join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

function mediaTypeFromQuery(
  query: string,
): "video" | "image" | "audio" | "pdf" | "document" | null {
  const q = normalizeText(query);
  if (["video", "videos", "vídeo", "vídeos"].includes(q)) return "video";
  if (["imagen", "imagenes", "foto", "fotos"].includes(q)) return "image";
  if (["audio", "podcast", "podcasts"].includes(q)) return "audio";
  if (["pdf", "pdfs"].includes(q)) return "pdf";
  if (["documento", "documentos", "docx", "word"].includes(q)) return "document";
  return null;
}

function contentTypeFromQuery(query: string): ContentType | null {
  const q = normalizeText(query.trim());
  if (CONTENT_TYPE_ALIASES[q]) return CONTENT_TYPE_ALIASES[q];
  const stemmed = lightStem(q);
  if (CONTENT_TYPE_ALIASES[stemmed]) return CONTENT_TYPE_ALIASES[stemmed];
  return null;
}

function categoryFromQuery(query: string): CategorySlug | null {
  const q = normalizeText(query.trim());
  if (CATEGORY_ALIASES[q]) return CATEGORY_ALIASES[q];
  const byName = CATEGORIES.find((c) => normalizeText(c.name) === q);
  return byName?.slug ?? null;
}

function pubMatchesMediaType(
  pub: Publication,
  type: "video" | "image" | "audio" | "pdf" | "document",
): boolean {
  if (pub.contentType === type) return true;
  if (type === "image" && pub.contentType === "galeria") return true;
  if (type === "document" && pub.contentType === "documento") return true;
  return pub.media.some((m) => m.type === type);
}

function scoreExactMatch(haystack: string, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  let hits = 0;
  for (const token of tokens) {
    if (token.length < 2) continue;
    if (haystack.includes(token)) hits += 1;
  }
  return hits / tokens.length;
}

function applyPoolFilters(
  publications: Publication[],
  filters: SearchFilters,
): Publication[] {
  let pool = Array.isArray(publications) ? [...publications] : [];

  try {
    const categoryFilter = filters.category;
    if (categoryFilter) {
      pool = pool.filter((p) => p.categorySlugs?.includes(categoryFilter));
    }
    const contentTypeFilter = filters.contentType;
    if (contentTypeFilter) {
      pool = pool.filter((p) => p.contentType === contentTypeFilter);
    }
    if (filters.tag) {
      const tag = normalizeText(filters.tag);
      pool = pool.filter((p) =>
        (p.tags ?? []).some((t) => normalizeText(t).includes(tag)),
      );
    }
    if (filters.subject) {
      const subject = normalizeText(filters.subject);
      pool = pool.filter(
        (p) => p.subject && normalizeText(p.subject).includes(subject),
      );
    }
    if (filters.schoolYear) {
      pool = pool.filter((p) => p.schoolYear === filters.schoolYear);
    }
    if (filters.author) {
      const author = normalizeText(filters.author);
      pool = pool.filter((p) =>
        (p.authors ?? []).some(
          (a) => a.nameVisible && normalizeText(a.displayName).includes(author),
        ),
      );
    }
    if (filters.studentId) {
      pool = pool.filter((p) =>
        (p.authors ?? []).some(
          (a) => a.studentId === filters.studentId && a.nameVisible,
        ),
      );
    }
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom).getTime();
      if (!Number.isNaN(from)) {
        pool = pool.filter((p) => new Date(p.publishedAt).getTime() >= from);
      }
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo).getTime();
      if (!Number.isNaN(to)) {
        pool = pool.filter((p) => new Date(p.publishedAt).getTime() <= to);
      }
    }

    pool = pool.filter(
      (p) => p.accessLevel !== "private" || filters.accessLevel === "private",
    );
    pool = pool.filter((p) => p.primaryCategory !== "tres-mundos-una-historia");
  } catch {
    return publications.filter(
      (p) => p.primaryCategory !== "tres-mundos-una-historia",
    );
  }

  return pool;
}

function toItem(publication: Publication, score: number): SearchResultItem {
  return {
    publication,
    score,
    highlights: [
      {
        field: "summary",
        snippet: publication.summary || publication.title,
      },
    ],
  };
}

export function searchPublications(
  publications: Publication[],
  filters: SearchFilters,
): SearchResponse {
  try {
    const page = Math.max(1, filters.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 12));
    const pool = applyPoolFilters(publications, filters);
    const query = (filters.query ?? "").trim();
    let items: SearchResultItem[] = [];

    const mediaQuery = query.length >= 2 ? mediaTypeFromQuery(query) : null;
    const typeQuery = query.length >= 2 ? contentTypeFromQuery(query) : null;
    const categoryQuery = query.length >= 2 ? categoryFromQuery(query) : null;

    if (mediaQuery) {
      items = pool
        .filter((p) => pubMatchesMediaType(p, mediaQuery))
        .map((p) => toItem(p, p.featured ? 1 : 0.9));
    } else if (typeQuery) {
      items = pool
        .filter((p) => p.contentType === typeQuery)
        .map((p) => toItem(p, p.featured ? 1 : 0.92));
      // Si no hay del tipo exacto, ampliar con tags/haystack
      if (items.length === 0) {
        const token = normalizeText(typeQuery);
        items = pool
          .filter((p) => {
            const hay = normalizeText(buildHaystack(p));
            return hay.includes(token) || hay.includes(lightStem(token));
          })
          .map((p) => toItem(p, 0.75));
      }
    } else if (categoryQuery && !filters.category) {
      items = pool
        .filter((p) => p.categorySlugs.includes(categoryQuery))
        .map((p) => toItem(p, p.featured ? 1 : 0.88));
    } else if (query.length >= 2) {
      const tokens = expandQueryTokens(query);
      const normalizedQuery = normalizeText(query);

      const scored = pool.map((publication) => {
        const haystack = normalizeText(buildHaystack(publication));
        const title = normalizeText(publication.title);
        const tags = normalizeText((publication.tags ?? []).join(" "));
        const exact = scoreExactMatch(haystack, tokens);
        const titleHit = tokens.some((t) => title.includes(t)) ? 0.35 : 0;
        const tagHit = tokens.some((t) => tags.includes(t)) ? 0.2 : 0;
        const typeHit =
          publication.contentType &&
          tokens.includes(normalizeText(publication.contentType))
            ? 0.25
            : 0;
        return {
          publication,
          score: Math.min(1, exact * 0.7 + titleHit + tagHit + typeHit),
          exact,
        };
      });

      const strong = scored
        .filter((s) => s.exact > 0 || s.score >= 0.25)
        .map((s) => toItem(s.publication, Math.max(s.score, 0.4)));

      if (strong.length > 0) {
        items = strong;
      } else {
        // Fuse como respaldo más permisivo
        const fuse = new Fuse(
          pool.map((publication) => ({
            publication,
            haystack: normalizeText(buildHaystack(publication)),
            title: normalizeText(publication.title),
            authors: normalizeText(
              publication.authors
                .filter((a) => a.nameVisible)
                .map((a) => a.displayName)
                .join(" "),
            ),
            tags: normalizeText(publication.tags.join(" ")),
            contentType: normalizeText(
              contentTypeWords(publication.contentType),
            ),
          })),
          {
            keys: [
              { name: "title", weight: 0.35 },
              { name: "contentType", weight: 0.2 },
              { name: "authors", weight: 0.15 },
              { name: "tags", weight: 0.15 },
              { name: "haystack", weight: 0.15 },
            ],
            threshold: 0.48,
            ignoreLocation: true,
            includeScore: true,
            minMatchCharLength: 2,
          },
        );

        items = fuse.search(normalizedQuery).map((result) => {
          const publication = result.item.publication;
          const score = 1 - (result.score ?? 0);
          return toItem(publication, score);
        });
      }
    } else if (
      filters.category ||
      filters.author ||
      filters.studentId ||
      filters.tag
    ) {
      items = pool.map((publication) =>
        toItem(publication, publication.featured ? 1 : 0.5),
      );
    }

    // Deduplicar por id
    const seen = new Set<string>();
    items = items.filter((item) => {
      if (seen.has(item.publication.id)) return false;
      seen.add(item.publication.id);
      return true;
    });

    const sort = filters.sort ?? (query ? "relevance" : "date");
    items.sort((a, b) => {
      if (sort === "title") {
        return a.publication.title.localeCompare(b.publication.title, "es");
      }
      if (sort === "date") {
        return (
          new Date(b.publication.publishedAt).getTime() -
          new Date(a.publication.publishedAt).getTime()
        );
      }
      return b.score - a.score;
    });

    const total = items.length;
    const start = (page - 1) * pageSize;
    const pageItems = items.slice(start, start + pageSize);

    return {
      items: pageItems,
      total,
      page,
      pageSize,
      query,
    };
  } catch {
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: filters.pageSize ?? 12,
      query: filters.query ?? "",
    };
  }
}

/** Sugerencias relacionadas por categoría, tipo o etiquetas. */
export function relatedPublications(
  publications: Publication[],
  seed: Publication[],
  limit = 8,
): Publication[] {
  try {
    if (!seed.length) {
      return publications
        .filter((p) => p.featured && p.primaryCategory !== "tres-mundos-una-historia")
        .slice(0, limit);
    }

    const seedIds = new Set(seed.map((p) => p.id));
    const categories = new Set(seed.flatMap((p) => p.categorySlugs));
    const types = new Set(seed.map((p) => p.contentType));
    const tags = new Set(
      seed.flatMap((p) => p.tags.map((t) => normalizeText(t))),
    );

    const ranked = publications
      .filter(
        (p) =>
          !seedIds.has(p.id) &&
          p.primaryCategory !== "tres-mundos-una-historia" &&
          p.accessLevel !== "private",
      )
      .map((p) => {
        let score = 0;
        if (p.categorySlugs.some((c) => categories.has(c))) score += 3;
        if (types.has(p.contentType)) score += 2;
        if (p.tags.some((t) => tags.has(normalizeText(t)))) score += 2;
        if (p.featured) score += 1;
        return { p, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.p);

    if (ranked.length >= Math.min(3, limit)) return ranked;

    const fill = publications
      .filter(
        (p) =>
          !seedIds.has(p.id) &&
          !ranked.some((r) => r.id === p.id) &&
          p.primaryCategory !== "tres-mundos-una-historia",
      )
      .slice(0, limit - ranked.length);

    return [...ranked, ...fill];
  } catch {
    return [];
  }
}

export function suggestPublications(
  publications: Publication[],
  query: string,
  limit = 6,
): Publication[] {
  try {
    if (!query.trim()) {
      return publications.filter((p) => p.featured).slice(0, limit);
    }
    const result = searchPublications(publications, {
      query,
      page: 1,
      pageSize: limit,
      sort: "relevance",
    });
    return result.items.map((i) => i.publication);
  } catch {
    return [];
  }
}

export function searchQuickLinks(query: string): {
  href: string;
  label: string;
  description: string;
}[] {
  const q = normalizeText(query);
  if (q.length < 2) return [];
  const links: { href: string; label: string; description: string }[] = [];

  const type = contentTypeFromQuery(query);
  if (type) {
    links.push({
      href: `/buscar?q=${encodeURIComponent(type)}`,
      label: `Ver ${type}s`,
      description: `Todos los trabajos de tipo ${type}`,
    });
  }

  const cat = categoryFromQuery(query);
  if (cat) {
    const name = CATEGORIES.find((c) => c.slug === cat)?.name ?? cat;
    links.push({
      href: `/${cat}`,
      label: name,
      description: "Abrir categoría completa",
    });
  }

  if (q.includes("alumno") || q.includes("estudiante")) {
    links.push({
      href: "/buscar-alumno",
      label: "Buscar alumnos",
      description: "Localiza publicaciones por nombre",
    });
  }

  return links.slice(0, 4);
}
