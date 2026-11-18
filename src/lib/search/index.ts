import Fuse from "fuse.js";
import { CATEGORIES } from "@/lib/categories";
import {
  contentTypeSearchAliases,
  editDistance,
  fuzzyLookup,
  resolveContentType,
  splitTypeFragments,
} from "@/lib/content-type";
import { normalizeText } from "@/lib/utils/text";
import type {
  CategorySlug,
  ContentType,
  Publication,
  SearchFilters,
  SearchResponse,
  SearchResultItem,
} from "@/lib/types/content";

const CONTENT_TYPE_ALIASES = contentTypeSearchAliases();

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

/** Partes de búsqueda: «audio/podcast», «cuentos / poemas», espacios. */
function queryParts(query: string): string[] {
  return splitTypeFragments(query).flatMap((part) =>
    part.split(/\s+/).map((t) => t.trim()).filter((t) => t.length >= 2),
  );
}

function resolveTypeToken(token: string): ContentType | null {
  const n = normalizeText(token);
  if (CONTENT_TYPE_ALIASES[n]) return CONTENT_TYPE_ALIASES[n]!;
  const stemmed = lightStem(n);
  if (CONTENT_TYPE_ALIASES[stemmed]) return CONTENT_TYPE_ALIASES[stemmed]!;
  return fuzzyLookup(n, CONTENT_TYPE_ALIASES, n.length >= 5 ? 2 : 1);
}

function expandQueryTokens(query: string): string[] {
  const raw = queryParts(query);
  const out = new Set<string>();
  for (const token of raw) {
    out.add(token);
    out.add(lightStem(token));
    const type = resolveTypeToken(token);
    if (type) {
      out.add(normalizeText(type));
      out.add(lightStem(type));
      if (type === "audio") {
        out.add("podcast");
        out.add("podcasts");
        out.add("audios");
        out.add("sonido");
      }
    }
    // Tipazos leves contra alias conocidos
    const fuzzy = fuzzyLookup(token, CONTENT_TYPE_ALIASES, token.length >= 5 ? 2 : 1);
    if (fuzzy) {
      out.add(normalizeText(fuzzy));
      out.add(lightStem(fuzzy));
    }
  }
  return [...out];
}

function mediaKindWords(pub: Publication): string {
  return pub.media
    .map((m) => {
      if (m.type === "video") return "video videos";
      if (m.type === "image") return "imagen imagenes foto fotos galeria";
      if (m.type === "audio") return "audio audios podcast podcasts sonido";
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
    audio: "audio audios podcast podcasts sonido audio/podcast",
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

type MediaKind = "video" | "image" | "audio" | "pdf" | "document";

/** Tipos de contenido sugeridos por la consulta (soporta audio/podcast). */
function contentTypesFromQuery(query: string): ContentType[] {
  const parts = queryParts(query);
  if (parts.length === 0) {
    const single = resolveContentType(query);
    return single !== "otro" && single !== "articulo" ? [single] : [];
  }
  const types = new Set<ContentType>();
  for (const part of parts) {
    const t = resolveTypeToken(part);
    if (t) types.add(t);
  }
  // Toda la cadena tipo Sheets
  const whole = resolveContentType(query);
  if (whole !== "otro") types.add(whole);
  return [...types];
}

function categoryFromQuery(query: string): CategorySlug | null {
  const q = normalizeText(query.trim());
  if (CATEGORY_ALIASES[q]) return CATEGORY_ALIASES[q]!;
  const byName = CATEGORIES.find((c) => normalizeText(c.name) === q);
  if (byName) return byName.slug;
  return fuzzyLookup(q, CATEGORY_ALIASES, q.length >= 6 ? 2 : 1);
}

function pubMatchesMediaType(pub: Publication, type: MediaKind): boolean {
  if (type === "audio") {
    return (
      pub.contentType === "audio" ||
      pub.media.some((m) => m.type === "audio")
    );
  }
  if (pub.contentType === type) return true;
  if (type === "image" && pub.contentType === "galeria") return true;
  if (type === "document" && pub.contentType === "documento") return true;
  if (type === "pdf") {
    return (
      pub.media.some((m) => m.type === "pdf") ||
      pub.contentType === "documento"
    );
  }
  return pub.media.some((m) => m.type === type);
}

function pubMatchesContentType(pub: Publication, type: ContentType): boolean {
  if (pub.contentType === type) return true;
  if (type === "audio") return pubMatchesMediaType(pub, "audio");
  if (type === "video") return pubMatchesMediaType(pub, "video");
  if (type === "documento") {
    return (
      pubMatchesMediaType(pub, "document") || pubMatchesMediaType(pub, "pdf")
    );
  }
  if (type === "galeria") return pubMatchesMediaType(pub, "image");
  // Etiquetas / sinónimos explícitos (no haystack completo)
  const tagBlob = normalizeText((pub.tags ?? []).join(" "));
  const aliases = Object.entries(CONTENT_TYPE_ALIASES)
    .filter(([, v]) => v === type)
    .map(([k]) => k);
  return aliases.some((a) => tagBlob.includes(a));
}

function scoreExactMatch(haystack: string, tokens: string[]): number {
  if (tokens.length === 0) return 0;
  let hits = 0;
  for (const token of tokens) {
    if (token.length < 2) continue;
    if (haystack.includes(token)) {
      hits += 1;
      continue;
    }
    // Tipazo leve dentro del haystack: comparar con palabras
    if (token.length >= 4) {
      const words = haystack.split(/\s+/);
      if (
        words.some((w) => {
          if (Math.abs(w.length - token.length) > 2) return false;
          return editDistance(token, w) <= (token.length >= 6 ? 2 : 1);
        })
      ) {
        hits += 0.7;
      }
    }
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

    const typeQueries =
      query.length >= 2 ? contentTypesFromQuery(query) : [];
    const categoryQuery =
      query.length >= 2 && !query.includes("/")
        ? categoryFromQuery(query)
        : null;

    // Consulta solo de tipo(s): audio, podcast, audio/podcast, cuentos/poemas…
    const onlyTypes =
      typeQueries.length > 0 &&
      queryParts(query).every((p) => resolveTypeToken(p) !== null);

    if (onlyTypes) {
      const matched = pool.filter((p) =>
        typeQueries.some((t) => pubMatchesContentType(p, t)),
      );
      items = matched.map((p) => toItem(p, p.featured ? 1 : 0.92));
    } else if (categoryQuery && !filters.category) {
      items = pool
        .filter((p) => p.categorySlugs.includes(categoryQuery))
        .map((p) => toItem(p, p.featured ? 1 : 0.88));
    } else if (query.length >= 2) {
      const tokens = expandQueryTokens(query);
      const normalizedQuery = normalizeText(query.replace(/\//g, " "));

      const scored = pool.map((publication) => {
        const haystack = normalizeText(buildHaystack(publication));
        const title = normalizeText(publication.title);
        const tags = normalizeText((publication.tags ?? []).join(" "));
        const exact = scoreExactMatch(haystack, tokens);
        const titleHit = tokens.some((t) => title.includes(t)) ? 0.35 : 0;
        const tagHit = tokens.some((t) => tags.includes(t)) ? 0.2 : 0;
        const typeHit = typeQueries.some((t) =>
          pubMatchesContentType(publication, t),
        )
          ? 0.3
          : publication.contentType &&
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
        .filter((s) => s.exact > 0 || s.score >= 0.22)
        .map((s) => toItem(s.publication, Math.max(s.score, 0.4)));

      if (strong.length > 0) {
        items = strong;
      } else {
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
              { name: "title", weight: 0.32 },
              { name: "contentType", weight: 0.22 },
              { name: "authors", weight: 0.14 },
              { name: "tags", weight: 0.14 },
              { name: "haystack", weight: 0.18 },
            ],
            threshold: 0.52,
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

export function relatedPublications(
  publications: Publication[],
  seed: Publication[],
  limit = 8,
): Publication[] {
  try {
    if (!seed.length) {
      return publications
        .filter(
          (p) =>
            p.featured && p.primaryCategory !== "tres-mundos-una-historia",
        )
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

  const types = contentTypesFromQuery(query);
  for (const type of types.slice(0, 2)) {
    const label =
      type === "audio"
        ? "Ver audio / podcast"
        : type === "galeria"
          ? "Ver fotos / galería"
          : `Ver ${type}`;
    links.push({
      href: `/buscar?q=${encodeURIComponent(type === "audio" ? "audio/podcast" : type)}`,
      label,
      description: `Trabajos de tipo ${type}`,
    });
  }

  if (!query.includes("/")) {
    const cat = categoryFromQuery(query);
    if (cat) {
      const name = CATEGORIES.find((c) => c.slug === cat)?.name ?? cat;
      links.push({
        href: `/${cat}`,
        label: name,
        description: "Abrir categoría completa",
      });
    }
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
