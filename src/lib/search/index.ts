import Fuse from "fuse.js";
import { normalizeText } from "@/lib/utils/text";
import type {
  Publication,
  SearchFilters,
  SearchResponse,
  SearchResultItem,
} from "@/lib/types/content";

function buildHaystack(pub: Publication): string {
  return [
    pub.title,
    pub.subtitle,
    pub.summary,
    pub.body.replace(/<[^>]+>/g, " "),
    pub.tags.join(" "),
    pub.subject,
    pub.schoolYear,
    pub.contentType,
    pub.authors
      .filter((a) => a.nameVisible)
      .map((a) => a.displayName)
      .join(" "),
    pub.categorySlugs.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
}

export function searchPublications(
  publications: Publication[],
  filters: SearchFilters,
): SearchResponse {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, filters.pageSize ?? 12));
  let pool = [...publications];

  const categoryFilter = filters.category;
  if (categoryFilter) {
    pool = pool.filter((p) => p.categorySlugs.includes(categoryFilter));
  }
  const contentTypeFilter = filters.contentType;
  if (contentTypeFilter) {
    pool = pool.filter((p) => p.contentType === contentTypeFilter);
  }
  if (filters.tag) {
    const tag = normalizeText(filters.tag);
    pool = pool.filter((p) => p.tags.some((t) => normalizeText(t).includes(tag)));
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
      p.authors.some(
        (a) => a.nameVisible && normalizeText(a.displayName).includes(author),
      ),
    );
  }
  if (filters.studentId) {
    pool = pool.filter((p) =>
      p.authors.some((a) => a.studentId === filters.studentId && a.nameVisible),
    );
  }
  if (filters.dateFrom) {
    const from = new Date(filters.dateFrom).getTime();
    pool = pool.filter((p) => new Date(p.publishedAt).getTime() >= from);
  }
  if (filters.dateTo) {
    const to = new Date(filters.dateTo).getTime();
    pool = pool.filter((p) => new Date(p.publishedAt).getTime() <= to);
  }

  // Nunca mezclar privados en resultados públicos
  pool = pool.filter((p) => p.accessLevel !== "private" || filters.accessLevel === "private");

  const query = (filters.query ?? "").trim();
  let items: SearchResultItem[] = [];

  if (query) {
    const fuse = new Fuse(
      pool.map((publication) => ({
        publication,
        haystack: normalizeText(buildHaystack(publication)),
        title: normalizeText(publication.title),
      })),
      {
        keys: [
          { name: "title", weight: 0.45 },
          { name: "haystack", weight: 0.55 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        includeScore: true,
        minMatchCharLength: 2,
      },
    );

    const normalizedQuery = normalizeText(query);
    items = fuse.search(normalizedQuery).map((result) => {
      const publication = result.item.publication;
      const score = 1 - (result.score ?? 0);
      const highlights: SearchResultItem["highlights"] = [];
      if (normalizeText(publication.title).includes(normalizedQuery.split(" ")[0] ?? "")) {
        highlights.push({ field: "title", snippet: publication.title });
      }
      highlights.push({ field: "summary", snippet: publication.summary });
      return { publication, score, highlights };
    });
  } else {
    items = pool.map((publication) => ({
      publication,
      score: publication.featured ? 1 : 0.5,
      highlights: [],
    }));
  }

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
}

export function suggestPublications(
  publications: Publication[],
  query: string,
  limit = 6,
): Publication[] {
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
}
