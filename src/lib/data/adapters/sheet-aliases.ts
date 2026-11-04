/**
 * Formato real Or Hajayim (2026):
 * Cada categoría = pestaña con columnas:
 *   Autor | Tema|Género|Clasificación | Año | Enlace
 * Timeline = "Tres Mundos, una historia"
 */
/**
 * Mapeo de encabezados OH → campos canónicos.
 * Importante: Género/Clasificación NO pisan el Título (Taller tiene ambos).
 */
const ALIAS_TO_CANONICAL: Record<string, string> = {
  id: "id",
  slug: "slug",
  title: "title",
  titulo: "title",
  título: "title",
  nombre: "title",
  tema: "title",
  "nombre del trabajo": "title",
  subtitle: "subtitle",
  summary: "summary",
  resumen: "summary",
  descripcion: "summary",
  descripción: "summary",
  body: "body",
  contenttype: "contentType",
  tipo: "contentType",
  género: "contentType",
  genero: "contentType",
  clasificación: "contentType",
  clasificacion: "contentType",
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

function cell(row: Record<string, string>, ...names: string[]): string {
  for (const name of names) {
    const direct = row[name];
    if (direct?.trim()) return direct.trim();
    const found = Object.entries(row).find(
      ([k]) => k.trim().toLowerCase() === name.toLowerCase(),
    );
    if (found?.[1]?.trim()) return found[1].trim();
  }
  return "";
}

/** Renombra claves de una fila a nombres canónicos. */
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

  // Título real: Título > Tema > Nombre (nunca dejar que Género gane si hay Título)
  const explicitTitle = cell(row, "Título", "Titulo", "title", "Tema", "Nombre");
  if (explicitTitle) out.title = explicitTitle;

  const genre = cell(
    row,
    "Género",
    "Genero",
    "género",
    "genero",
    "Clasificación",
    "Clasificacion",
    "tipo",
  );
  if (genre) {
    out.contentType = genre;
    // Solo si no hay título de trabajo, usar género/clasificación como título
    if (!out.title?.trim()) out.title = genre;
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

/** Etiqueta del campo principal editable (título del trabajo). */
export function titleColumnLabelForTab(tabTitle: string): string {
  const key = tabTitle.trim().toLowerCase().replace(/\s+/g, " ");
  if (key === "taller de letras") return "Título";
  if (key === "expresiones del arte") return "Clasificación";
  return "Tema";
}

/** Resuelve el nombre real de pestaña aunque haya espacios dobles o mayúsculas. */
export function resolveSheetTabTitle(
  availableTitles: string[],
  wanted: string,
): string | null {
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  const want = norm(wanted);
  const exact = availableTitles.find((t) => norm(t) === want);
  if (exact) return exact;
  return (
    availableTitles.find((t) => norm(t).includes(want) || want.includes(norm(t))) ||
    null
  );
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
