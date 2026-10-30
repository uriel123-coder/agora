/**
 * Normaliza encabezados de Sheets (ES/EN, informal) → campos canónicos.
 * Así el colegio puede empezar simple (nombre, descripción, archivo)
 * y luego adoptar el formato completo.
 */
const ALIAS_TO_CANONICAL: Record<string, string> = {
  id: "id",
  slug: "slug",
  title: "title",
  titulo: "title",
  título: "title",
  nombre: "title",
  "nombre del trabajo": "title",
  "nombre de la publicacion": "title",
  "nombre de la publicación": "title",
  subtitle: "subtitle",
  subtitulo: "subtitle",
  subtítulo: "subtitle",
  summary: "summary",
  resumen: "summary",
  descripcion: "summary",
  descripción: "summary",
  body: "body",
  cuerpo: "body",
  contenido: "body",
  texto: "body",
  coverimage: "coverImage",
  portada: "coverImage",
  imagen: "coverImage",
  "imagen de portada": "coverImage",
  coveralt: "coverAlt",
  categories: "categories",
  categoria: "categories",
  categoría: "categories",
  categorias: "categories",
  categorías: "categories",
  primarycategory: "primaryCategory",
  contenttype: "contentType",
  tipo: "contentType",
  "tipo de contenido": "contentType",
  tags: "tags",
  etiquetas: "tags",
  authors: "authors",
  autor: "authors",
  autores: "authors",
  alumno: "authors",
  "nombre del alumno": "authors",
  subject: "subject",
  materia: "subject",
  schoolyear: "schoolYear",
  ciclo: "schoolYear",
  "ciclo escolar": "schoolYear",
  ano: "schoolYear",
  año: "schoolYear",
  publishedat: "publishedAt",
  fecha: "publishedAt",
  status: "status",
  estado: "status",
  accesslevel: "accessLevel",
  acceso: "accessLevel",
  featured: "featured",
  destacado: "featured",
  bibliography: "bibliography",
  bibliografia: "bibliography",
  bibliografía: "bibliography",
  credits: "credits",
  creditos: "credits",
  créditos: "credits",
  media: "media",
  archivo: "media",
  archivos: "media",
  documento: "media",
  documentos: "media",
  recurso: "media",
  recursos: "media",
  url: "media",
  enlace: "media",
  link: "media",
  relatedids: "relatedIds",
  historicalyear: "historicalYear",
  historicalyearend: "historicalYearEnd",
  historicalline: "historicalLine",
  historicaleventid: "historicalEventId",
  historicaldeepurl: "historicalDeepUrl",
  historicallabel: "historicalLabel",
};

export function normalizeHeaderKey(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return ALIAS_TO_CANONICAL[key] ?? raw.trim();
}

/** Renombra claves de una fila a nombres canónicos. */
export function normalizeSheetRow(
  row: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(row)) {
    const canonical = normalizeHeaderKey(key);
    if (!canonical) continue;
    // Si hay colisión, prioriza el valor no vacío más específico.
    if (!out[canonical] || !String(out[canonical]).trim()) {
      out[canonical] = value ?? "";
    }
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

export function categorySlugFromTabTitle(title: string): string | null {
  const key = title.trim().toLowerCase();
  const slug = CATEGORY_TAB_ALIASES[key];
  if (!slug || slug === "publicaciones") return null;
  return slug;
}
