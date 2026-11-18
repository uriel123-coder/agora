import { normalizeText } from "@/lib/utils/text";
import type { ContentType } from "@/lib/types/content";

/** Fragmentos de género/tipo de Sheets → tipo canónico. */
const FRAGMENT_MAP: Record<string, ContentType> = {
  articulo: "articulo",
  articulos: "articulo",
  cuento: "cuento",
  cuentos: "cuento",
  fabula: "cuento",
  fabulas: "cuento",
  relato: "cuento",
  relatos: "cuento",
  leyenda: "cuento",
  leyendas: "cuento",
  narrativa: "cuento",
  poema: "poema",
  poemas: "poema",
  poesia: "poema",
  poesias: "poema",
  ensayo: "ensayo",
  ensayos: "ensayo",
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
  audios: "audio",
  podcast: "audio",
  podcasts: "audio",
  sonido: "audio",
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
  shorashim: "ensayo",
};

/** Parte un valor de Sheets tipo «audio/podcast», «video | documental», etc. */
export function splitTypeFragments(value: string): string[] {
  return normalizeText(value)
    .split(/[/|,;·•]+|\s+y\s+|\s+o\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 2);
}

export function resolveContentType(value: string): ContentType {
  const raw = (value || "").trim();
  if (!raw) return "articulo";

  const whole = normalizeText(raw).replace(/\s+/g, " ");
  if (FRAGMENT_MAP[whole]) return FRAGMENT_MAP[whole];

  // Compestos frecuentes
  if (whole.includes("audio") || whole.includes("podcast") || whole.includes("sonido")) {
    return "audio";
  }
  if (whole.includes("video") || whole.includes("film") || whole.includes("clip")) {
    return "video";
  }
  if (whole.includes("pdf") || whole.includes("documento") || whole.includes("docx")) {
    return "documento";
  }
  if (whole.includes("foto") || whole.includes("imagen") || whole.includes("galeria")) {
    return "galeria";
  }

  for (const part of splitTypeFragments(raw)) {
    if (FRAGMENT_MAP[part]) return FRAGMENT_MAP[part];
  }

  return "otro";
}

export function contentTypeSearchAliases(): Record<string, ContentType> {
  return { ...FRAGMENT_MAP };
}

/** Distancia de edición simple (Levenshtein). */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const rows = a.length + 1;
  const cols = b.length + 1;
  const matrix: number[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(0),
  );
  for (let i = 0; i < rows; i++) matrix[i]![0] = i;
  for (let j = 0; j < cols; j++) matrix[0]![j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i]![j] = Math.min(
        matrix[i - 1]![j]! + 1,
        matrix[i]![j - 1]! + 1,
        matrix[i - 1]![j - 1]! + cost,
      );
    }
  }
  return matrix[a.length]![b.length]!;
}

/** Corrige tipazos leves contra un diccionario de claves. */
export function fuzzyLookup<T>(
  token: string,
  dictionary: Record<string, T>,
  maxDistance = 1,
): T | null {
  const t = normalizeText(token);
  if (dictionary[t] !== undefined) return dictionary[t]!;
  if (t.length < 4) return null;
  let best: T | null = null;
  let bestDist = maxDistance + 1;
  for (const key of Object.keys(dictionary)) {
    if (Math.abs(key.length - t.length) > maxDistance) continue;
    const d = editDistance(t, key);
    if (d < bestDist) {
      bestDist = d;
      best = dictionary[key]!;
    }
  }
  return bestDist <= maxDistance ? best : null;
}
