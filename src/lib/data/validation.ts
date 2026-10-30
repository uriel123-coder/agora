import { z } from "zod";
import type { CategorySlug, Publication } from "@/lib/types/content";

export const CATEGORY_SLUGS = [
  "taller-de-letras",
  "mentes-curiosas",
  "fe-y-pensamiento",
  "shorashim",
  "ecos-de-la-historia",
  "tres-mundos-una-historia",
  "expresiones-del-arte",
  "ideas-en-dialogo",
  "voces-creadoras",
] as const satisfies readonly CategorySlug[];

/** Formato flexible: id/summary/categories pueden completarse en el adaptador. */
export const sheetsPublicationRowSchema = z.object({
  id: z.string().optional().default(""),
  slug: z.string().optional().default(""),
  title: z.string().min(1, "Se necesita un título / nombre"),
  subtitle: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  body: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  coverAlt: z.string().optional().default(""),
  /** Separadas por | o coma. Puede inyectarse desde el nombre de la pestaña. */
  categories: z.string().optional().default(""),
  primaryCategory: z.string().optional(),
  contentType: z.string().optional().default("articulo"),
  tags: z.string().optional().default(""),
  authors: z.string().optional().default(""),
  authorIds: z.string().optional().default(""),
  subject: z.string().optional().default(""),
  schoolYear: z.string().optional().default(""),
  publishedAt: z.string().optional().default(""),
  updatedAt: z.string().optional().default(""),
  status: z.string().optional().default("published"),
  accessLevel: z.string().optional().default("public"),
  featured: z.string().optional().default("false"),
  bibliography: z.string().optional().default(""),
  credits: z.string().optional().default(""),
  media: z.string().optional().default(""),
  relatedIds: z.string().optional().default(""),
  historicalYear: z.string().optional().default(""),
  historicalYearEnd: z.string().optional().default(""),
  historicalLine: z.string().optional().default(""),
  historicalEventId: z.string().optional().default(""),
  historicalDeepUrl: z.string().optional().default(""),
  historicalLabel: z.string().optional().default(""),
});

export type SheetsPublicationRow = z.infer<typeof sheetsPublicationRowSchema>;

export interface ValidationIssue {
  rowId?: string;
  field?: string;
  message: string;
  severity: "error" | "warning";
}

export function splitList(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[|,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseBool(value: string | undefined): boolean {
  if (!value) return false;
  return ["1", "true", "yes", "si", "sí"].includes(value.trim().toLowerCase());
}

export function validatePublicationUniqueness(
  publications: Publication[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const byId = new Map<string, number>();
  const bySlug = new Map<string, number>();
  const bySheets = new Map<string, number>();

  for (const pub of publications) {
    byId.set(pub.id, (byId.get(pub.id) ?? 0) + 1);
    bySlug.set(pub.slug, (bySlug.get(pub.slug) ?? 0) + 1);
    if (pub.sheetsRowId) {
      bySheets.set(pub.sheetsRowId, (bySheets.get(pub.sheetsRowId) ?? 0) + 1);
    }
  }

  for (const [id, count] of byId) {
    if (count > 1) {
      issues.push({
        rowId: id,
        field: "id",
        message: `Identificador duplicado: ${id} (${count} veces)`,
        severity: "error",
      });
    }
  }
  for (const [slug, count] of bySlug) {
    if (count > 1) {
      issues.push({
        rowId: slug,
        field: "slug",
        message: `Slug duplicado: ${slug} (${count} veces)`,
        severity: "error",
      });
    }
  }
  for (const [sheetsId, count] of bySheets) {
    if (count > 1) {
      issues.push({
        rowId: sheetsId,
        field: "sheetsRowId",
        message: `Fila de Sheets duplicada: ${sheetsId}`,
        severity: "error",
      });
    }
  }

  return issues;
}
