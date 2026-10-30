import { slugify } from "@/lib/utils/text";
import {
  CATEGORY_SLUGS,
  parseBool,
  sheetsPublicationRowSchema,
  splitList,
  type SheetsPublicationRow,
  type ValidationIssue,
} from "@/lib/data/validation";
import type {
  AuthorRef,
  CategorySlug,
  ContentType,
  HistoricalLine,
  MediaAsset,
  Publication,
  PublicationStatus,
  AccessLevel,
} from "@/lib/types/content";

function parseCategories(raw: string): CategorySlug[] {
  return splitList(raw)
    .map((s) => s.trim().toLowerCase())
    .filter((s): s is CategorySlug =>
      (CATEGORY_SLUGS as readonly string[]).includes(s),
    );
}

function parseAuthors(raw: string): AuthorRef[] {
  return splitList(raw).map((name, index) => ({
    id: `sheets-author-${slugify(name) || index}`,
    displayName: name,
    nameVisible: true,
    role: "institucional" as const,
  }));
}

function parseMedia(raw: string): MediaAsset[] {
  return splitList(raw).map((url, index) => ({
    id: `media-${index}`,
    type: url.match(/\.(pdf)(\?|$)/i)
      ? "pdf"
      : url.match(/\.(mp4|webm)(\?|$)/i)
        ? "video"
        : url.match(/\.(mp3|wav|ogg)(\?|$)/i)
          ? "audio"
          : "image",
    url,
    alt: "Recurso vinculado",
  }));
}

function asStatus(value: string): PublicationStatus {
  const allowed: PublicationStatus[] = [
    "draft",
    "in_review",
    "approved",
    "published",
    "rejected",
    "archived",
  ];
  return allowed.includes(value as PublicationStatus)
    ? (value as PublicationStatus)
    : "published";
}

function asAccess(value: string): AccessLevel {
  const allowed: AccessLevel[] = ["public", "restricted", "private"];
  return allowed.includes(value as AccessLevel)
    ? (value as AccessLevel)
    : "public";
}

function asContentType(value: string): ContentType {
  return (value || "articulo") as ContentType;
}

function asLine(value: string): HistoricalLine | undefined {
  const allowed: HistoricalLine[] = [
    "hebrea-judia",
    "mundial",
    "mexico",
    "comparativa",
  ];
  return allowed.includes(value as HistoricalLine)
    ? (value as HistoricalLine)
    : undefined;
}

export interface RowConversionResult {
  publication?: Publication;
  issues: ValidationIssue[];
}

/** Convierte una fila estilo Google Sheets en Publication canónica. */
export function rowToPublication(
  input: Record<string, string>,
): RowConversionResult {
  const issues: ValidationIssue[] = [];
  const parsed = sheetsPublicationRowSchema.safeParse(input);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        rowId: input.id,
        field: issue.path.join("."),
        message: issue.message,
        severity: "error",
      });
    }
    return { issues };
  }

  const row: SheetsPublicationRow = parsed.data;
  const categories = parseCategories(row.categories);

  if (categories.length === 0) {
    issues.push({
      rowId: row.id,
      field: "categories",
      message:
        "Debe incluir al menos una de las nueve categorías oficiales (slug).",
      severity: "error",
    });
    return { issues };
  }

  const primaryRaw = row.primaryCategory?.trim().toLowerCase();
  const primary =
    (primaryRaw
      ? categories.find((c) => c === primaryRaw)
      : undefined) ?? categories[0];

  const publication: Publication = {
    id: row.id,
    slug: row.slug?.trim() || slugify(row.title),
    title: row.title.trim(),
    subtitle: row.subtitle || undefined,
    summary: row.summary.trim(),
    body: row.body || `<p>${row.summary}</p>`,
    coverImage: row.coverImage || undefined,
    coverAlt: row.coverAlt || undefined,
    categorySlugs: categories,
    primaryCategory: primary,
    contentType: asContentType(row.contentType),
    tags: splitList(row.tags),
    authors: parseAuthors(row.authors),
    subject: row.subject || undefined,
    schoolYear: row.schoolYear || undefined,
    publishedAt: row.publishedAt || new Date().toISOString(),
    updatedAt: row.updatedAt || undefined,
    status: asStatus(row.status),
    accessLevel: asAccess(row.accessLevel),
    featured: parseBool(row.featured),
    isDemo: false,
    bibliography: splitList(row.bibliography),
    credits: row.credits || undefined,
    media: parseMedia(row.media),
    relatedIds: splitList(row.relatedIds),
    historicalLinks:
      row.historicalYear || row.historicalEventId || row.historicalDeepUrl
        ? [
            {
              year: row.historicalYear
                ? Number(row.historicalYear)
                : undefined,
              yearEnd: row.historicalYearEnd
                ? Number(row.historicalYearEnd)
                : undefined,
              historicalLine: asLine(row.historicalLine),
              eventId: row.historicalEventId || undefined,
              deepUrl: row.historicalDeepUrl || undefined,
              label: row.historicalLabel || undefined,
            },
          ]
        : [],
    sheetsRowId: row.id,
    source: "google-sheets",
  };

  if (!row.body) {
    issues.push({
      rowId: row.id,
      field: "body",
      message: "Cuerpo vacío: se usó el resumen como contenido provisional.",
      severity: "warning",
    });
  }

  if (row.coverImage && !/^https?:\/\//i.test(row.coverImage)) {
    issues.push({
      rowId: row.id,
      field: "coverImage",
      message: "La portada no parece una URL http(s) válida.",
      severity: "warning",
    });
  }

  return { publication, issues };
}

/** Fusiona por id/sheetsRowId sin duplicar. La fuente entrante gana en campos definidos. */
export function upsertPublications(
  existing: Publication[],
  incoming: Publication[],
): Publication[] {
  const map = new Map<string, Publication>();
  for (const pub of existing) map.set(pub.id, pub);
  for (const pub of incoming) {
    const prev =
      map.get(pub.id) ||
      [...map.values()].find(
        (p) => pub.sheetsRowId && p.sheetsRowId === pub.sheetsRowId,
      );
    if (prev) {
      map.delete(prev.id);
      map.set(pub.id, { ...prev, ...pub, id: pub.id });
    } else {
      map.set(pub.id, pub);
    }
  }
  return [...map.values()];
}
