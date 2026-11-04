/**
 * Formato real Or Hajayim (2026):
 * Cada categoría = pestaña con columnas:
 *   Autor | Tema|Género|Clasificación | Año | Enlace
 * Timeline = "Tres Mundos, una historia"
 */
const ALIAS_TO_CANONICAL: Record<string, string> = {
  id: "id",
  slug: "slug",
  title: "title",
  titulo: "title",
  título: "title",
  nombre: "title",
  tema: "title",
  género: "title",
  genero: "title",
  clasificación: "title",
  clasificacion: "title",
  "nombre del trabajo": "title",
  subtitle: "subtitle",
  summary: "summary",
  resumen: "summary",
  descripcion: "summary",
  descripción: "summary",
  body: "body",
  contenttype: "contentType",
  tipo: "contentType",
  categories: "categories",
  categoria: "categories",
  categoría: "categories",
  authors: "authors",
  autor: "authors",
  autores: "authors",
  alumno: "authors",
  "nombre del alumno": "authors",
  subject: "subject",
  materia: "subject",
  schoolyear: "schoolYear",
  ciclo: "schoolYear",
  año: "schoolYear",
  ano: "schoolYear",
  media: "media",
  archivo: "media",
  documento: "media",
  url: "media",
  enlace: "media",
  link: "media",
  tags: "tags",
  etiquetas: "tags",
  status: "status",
  estado: "status",
};

export function normalizeHeaderKey(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return ALIAS_TO_CANONICAL[key] ?? raw.trim();
}

/** Renombra claves de una fila a nombres canónicos; conserva originales en __raw. */
export function normalizeSheetRow(
  row: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const canonical = normalizeHeaderKey(key);
    if (!canonical) continue;
    if (!out[canonical] || !String(out[canonical]).trim()) {
      out[canonical] = value ?? "";
    }
  }
  // Conservar género/clasificación como contentType si aplica
  const genre =
    row["Género"] ||
    row["Género"] ||
    row["genero"] ||
    row["Género"] ||
    row["Clasificación"] ||
    row["Clasificacion"] ||
    "";
  if (genre && !out.contentType) out.contentType = String(genre);
  // Si el título vino de Género (Taller), contentType = mismo valor está bien
  const rawGenre = row["Género"] || row["genero"] || row["Genero"];
  if (rawGenre && out.title === rawGenre) {
    out.contentType = String(rawGenre);
  }
  return out;
}

export const CATEGORY_TAB_ALIASES: Record<string, string> = {
  "taller de letras": "taller-de-letras",
  "mentes curiosas": "mentes-curiosas",
  "fe y pensamiento": "fe-y-pensamiento",
  shorashim: "shorashim",
  "ecos de la historia": "ecos-de-la-historia",
  "tres mundos, una historia": "tres-mundos-una-historia",
  "tres mundos una historia": "tres-mundos-una-historia",
  "expresiones del arte": "expresiones-del-arte",
  "ideas en dialogo": "ideas-en-dialogo",
  "ideas en diálogo": "ideas-en-dialogo",
  "voces creadoras": "voces-creadoras",
  publicaciones: "publicaciones",
};

/** Título de pestaña → slug de categoría (null = no es catálogo). */
export function categorySlugFromTabTitle(title: string): string | null {
  const key = title.trim().toLowerCase().replace(/\s+/g, " ");
  // Timeline no es catálogo de trabajos
  if (key.includes("tres mundos")) return null;
  const slug = CATEGORY_TAB_ALIASES[key];
  if (!slug || slug === "publicaciones" || slug === "tres-mundos-una-historia") {
    return null;
  }
  return slug;
}

/** Qué columna B usa cada pestaña (Tema / Género / Clasificación). */
export function titleColumnLabelForTab(tabTitle: string): string {
  const key = tabTitle.trim().toLowerCase().replace(/\s+/g, " ");
  if (key === "taller de letras") return "Género";
  if (key === "expresiones del arte") return "Clasificación";
  return "Tema";
}

/** Nombre preferido de pestaña en Sheets para una categoría. */
export function sheetTabTitleForCategorySlug(slug: string): string | null {
  if (slug === "tres-mundos-una-historia" || slug === "publicaciones") {
    return null;
  }
  const known: Record<string, string> = {
    "taller-de-letras": "Taller de letras",
    "mentes-curiosas": "Mentes curiosas",
    "fe-y-pensamiento": "Fe y pensamiento",
    shorashim: "Shorashim",
    "ecos-de-la-historia": "Ecos de la historia",
    "expresiones-del-arte": "Expresiones del arte",
    "ideas-en-dialogo": "Ideas en diálogo",
    "voces-creadoras": "Voces creadoras",
  };
  return known[slug] ?? null;
}

export const TIMELINE_TAB_CANDIDATES = [
  "Tres Mundos, una historia",
  "Hoja1",
  "Hoja 1",
];
