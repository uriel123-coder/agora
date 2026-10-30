import {
  CONTENT_CACHE_TTL_MS,
  getCached,
  invalidateCache,
  setCached,
} from "@/lib/data/cache";
import {
  rowToPublication,
  upsertPublications,
} from "@/lib/data/adapters/publication";
import { categorySlugFromTabTitle } from "@/lib/data/adapters/sheet-aliases";
import { rowsToTimelineEvents } from "@/lib/data/adapters/timeline";
import {
  validatePublicationUniqueness,
  type ValidationIssue,
} from "@/lib/data/validation";
import type { CategorySlug, Publication } from "@/lib/types/content";
import type { TimelineBundle } from "@/lib/types/timeline";

export interface SheetsConfig {
  enabled: boolean;
  spreadsheetId: string;
  /** Rango propuesto para catálogo de publicaciones (cuando exista). */
  publicationsRange: string;
  /** Rango real de la cronología comparativa. */
  timelineRange: string;
  apiKey?: string;
  serviceAccountEmail?: string;
  privateKey?: string;
}

export interface SheetsDiagnostic {
  configured: boolean;
  enabled: boolean;
  authMode: "none" | "api-key" | "service-account";
  canReachApi: boolean;
  canReadSheet: boolean;
  headersOk: boolean;
  headers: string[];
  expectedHeaders: string[];
  expectedTimelineHeaders: string[];
  sheetKind: "timeline" | "publications" | "unknown" | "unreachable";
  rowCount: number;
  convertedCount: number;
  timelineEventCount: number;
  duplicateIssues: ValidationIssue[];
  conversionIssues: ValidationIssue[];
  incompleteRows: number;
  invalidMediaLinks: number;
  messages: string[];
  lastCheckedAt: string;
  sheetTitles: string[];
}

export const EXPECTED_PUBLICATION_HEADERS = [
  "id",
  "slug",
  "title",
  "subtitle",
  "summary",
  "body",
  "coverImage",
  "coverAlt",
  "categories",
  "primaryCategory",
  "contentType",
  "tags",
  "authors",
  "subject",
  "schoolYear",
  "publishedAt",
  "updatedAt",
  "status",
  "accessLevel",
  "featured",
  "bibliography",
  "credits",
  "media",
  "relatedIds",
  "historicalYear",
  "historicalYearEnd",
  "historicalLine",
  "historicalEventId",
  "historicalDeepUrl",
  "historicalLabel",
] as const;

export const EXPECTED_TIMELINE_HEADERS = [
  "Etapa",
  "Fuente",
  "Autor",
  "Eventos de la Historia hebrea",
  "Año hebreo",
  "Año gregoriano",
  "Eventos de la Historia del mundo",
  "Periodo",
  "Eventos de la Historia de México",
] as const;

export function isBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.AGORA_SKIP_SHEETS === "true"
  );
}

export function getSheetsConfig(): SheetsConfig {
  const enabled =
    process.env.GOOGLE_SHEETS_ENABLED === "true" && !isBuildPhase();
  return {
    enabled,
    spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "",
    publicationsRange:
      process.env.GOOGLE_SHEETS_PUBLICATIONS_RANGE ?? "Publicaciones!A:AD",
    timelineRange:
      process.env.GOOGLE_SHEETS_TIMELINE_RANGE ?? "'Hoja1'!A:N",
    apiKey: process.env.GOOGLE_SHEETS_API_KEY,
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    privateKey: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
      /\\n/g,
      "\n",
    ),
  };
}

function rowsToObjects(
  values: string[][],
): { headers: string[]; rows: Record<string, string>[] } {
  if (!values.length) return { headers: [], rows: [] };
  const headers = values[0].map((h) => h.trim());
  const rows = values.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] ?? "";
    });
    return obj;
  });
  return { headers, rows };
}

function detectSheetKind(headers: string[]): SheetsDiagnostic["sheetKind"] {
  const joined = headers.join(" | ").toLowerCase();
  if (
    joined.includes("historia hebrea") ||
    joined.includes("año gregoriano") ||
    joined.includes("historia de méxico") ||
    joined.includes("historia de mexico")
  ) {
    return "timeline";
  }
  if (headers.includes("id") && headers.includes("title") && headers.includes("categories")) {
    return "publications";
  }
  return "unknown";
}

async function fetchWithServiceAccount(
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const { fetchSheetValuesWithServiceAccount } = await import(
    "@/lib/data/providers/sheets-auth"
  );
  return fetchSheetValuesWithServiceAccount(spreadsheetId, range);
}

export async function fetchSheetValues(
  config: SheetsConfig,
  range = config.timelineRange,
): Promise<{ values: string[][]; error?: string }> {
  if (!config.spreadsheetId) {
    return { values: [], error: "Falta GOOGLE_SHEETS_SPREADSHEET_ID." };
  }

  if (config.serviceAccountEmail && config.privateKey) {
    try {
      const values = await fetchWithServiceAccount(config.spreadsheetId, range);
      return { values };
    } catch (err) {
      return {
        values: [],
        error:
          err instanceof Error
            ? err.message
            : "Error al leer Sheets con service account.",
      };
    }
  }

  if (config.apiKey) {
    const url = new URL(
      `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(range)}`,
    );
    url.searchParams.set("key", config.apiKey);
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      return {
        values: [],
        error: `Sheets API respondió ${res.status}. Verifica API key, ID y permisos.`,
      };
    }
    const data = (await res.json()) as { values?: string[][] };
    return { values: data.values ?? [] };
  }

  return {
    values: [],
    error:
      "Sin autenticación Sheets. Define service account o GOOGLE_SHEETS_API_KEY.",
  };
}

export async function loadTimelineFromSheets(): Promise<{
  bundle: TimelineBundle;
  error?: string;
}> {
  const empty: TimelineBundle = {
    events: [],
    etapas: [],
    totalRows: 0,
    source: "empty",
    sheetTitle: "Hoja1",
  };

  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.AGORA_SKIP_SHEETS === "true"
  ) {
    return { bundle: empty, error: "Sheets omitido en fase de build." };
  }

  const cacheKey = "sheets:timeline";
  const cached = getCached<TimelineBundle>(cacheKey);
  if (cached) return { bundle: cached };

  const config = getSheetsConfig();
  if (!config.enabled) {
    return {
      bundle: empty,
      error: "Google Sheets deshabilitado.",
    };
  }

  const { values, error } = await fetchSheetValues(config, config.timelineRange);
  if (error) {
    return {
      bundle: {
        events: [],
        etapas: [],
        totalRows: 0,
        source: "empty",
        sheetTitle: "Hoja1",
      },
      error,
    };
  }

  const bundle = rowsToTimelineEvents(values);
  setCached(cacheKey, bundle, CONTENT_CACHE_TTL_MS);
  return { bundle };
}

function convertSheetRows(
  values: string[][],
  defaultCategory?: CategorySlug,
): { publications: Publication[]; issues: ValidationIssue[] } {
  const { headers, rows } = rowsToObjects(values);
  if (detectSheetKind(headers) === "timeline") {
    return { publications: [], issues: [] };
  }

  const publications: Publication[] = [];
  const issues: ValidationIssue[] = [];

  for (const row of rows) {
    if (!Object.values(row).some((v) => String(v).trim())) continue;
    // Filas con solo un nombre y sin más datos aún no forman publicación.
    const meaningful = Object.entries(row).filter(
      ([, v]) => String(v).trim().length > 0,
    );
    if (meaningful.length <= 1 && !row.title && !row.Nombre && !row.nombre) {
      // Permitir título único si hay categoría por pestaña.
      const titleish = meaningful[0]?.[1];
      if (!titleish || !defaultCategory) continue;
    }
    const result = rowToPublication(row, { defaultCategory });
    issues.push(...result.issues);
    if (result.publication) publications.push(result.publication);
  }

  return { publications, issues };
}

export async function loadPublicationsFromSheets(): Promise<{
  publications: Publication[];
  issues: ValidationIssue[];
  error?: string;
  sources?: string[];
}> {
  const cacheKey = "sheets:publications";
  const cached = getCached<{
    publications: Publication[];
    issues: ValidationIssue[];
    sources?: string[];
  }>(cacheKey);
  if (cached) return cached;

  const config = getSheetsConfig();
  if (!config.enabled) {
    return {
      publications: [],
      issues: [],
      error: "Google Sheets deshabilitado (GOOGLE_SHEETS_ENABLED≠true).",
    };
  }

  const publications: Publication[] = [];
  const issues: ValidationIssue[] = [];
  const sources: string[] = [];
  const errors: string[] = [];

  // 1) Pestaña Publicaciones (formato canónico o flexible).
  const primary = await fetchSheetValues(config, config.publicationsRange);
  if (!primary.error && primary.values.length > 0) {
    const { headers } = rowsToObjects(primary.values);
    if (detectSheetKind(headers) !== "timeline") {
      const converted = convertSheetRows(primary.values);
      publications.push(...converted.publications);
      issues.push(...converted.issues);
      sources.push(config.publicationsRange);
    }
  } else if (primary.error) {
    errors.push(primary.error);
  }

  // 2) Pestañas por categoría (ej. "Taller de letras") si existen.
  try {
    const { listSheetTitles } = await import("@/lib/data/providers/sheets-auth");
    const tabs = await listSheetTitles(config.spreadsheetId);
    for (const tab of tabs) {
      const slug = categorySlugFromTabTitle(tab.title) as CategorySlug | null;
      if (!slug) continue;
      const range = `'${tab.title.replace(/'/g, "''")}'!A:Z`;
      const { values, error } = await fetchSheetValues(config, range);
      if (error || !values.length) continue;
      const converted = convertSheetRows(values, slug);
      if (converted.publications.length === 0) continue;
      publications.push(...converted.publications);
      issues.push(...converted.issues);
      sources.push(tab.title);
    }
  } catch {
    // Si no hay service account para listar pestañas, seguimos con lo leído.
  }

  if (publications.length === 0) {
    const payload = {
      publications: [],
      issues,
      sources,
      error:
        errors[0] ||
        "Aún no hay filas de publicaciones en Sheets. Crea la pestaña «Publicaciones» (o una pestaña por categoría) con nombre, descripción y archivo/URL.",
    };
    setCached(cacheKey, payload, CONTENT_CACHE_TTL_MS);
    return payload;
  }

  issues.push(...validatePublicationUniqueness(publications));
  const merged = upsertPublications([], publications);
  const payload = { publications: merged, issues, sources };
  setCached(cacheKey, payload, CONTENT_CACHE_TTL_MS);
  return payload;
}

export async function diagnoseSheetsConnection(): Promise<SheetsDiagnostic> {
  const config = getSheetsConfig();
  const messages: string[] = [];
  const authMode =
    config.apiKey
      ? "api-key"
      : config.serviceAccountEmail && config.privateKey
        ? "service-account"
        : "none";

  const diagnostic: SheetsDiagnostic = {
    configured: Boolean(config.spreadsheetId),
    enabled: config.enabled,
    authMode,
    canReachApi: false,
    canReadSheet: false,
    headersOk: false,
    headers: [],
    expectedHeaders: [...EXPECTED_PUBLICATION_HEADERS],
    expectedTimelineHeaders: [...EXPECTED_TIMELINE_HEADERS],
    sheetKind: "unreachable",
    rowCount: 0,
    convertedCount: 0,
    timelineEventCount: 0,
    duplicateIssues: [],
    conversionIssues: [],
    incompleteRows: 0,
    invalidMediaLinks: 0,
    messages,
    lastCheckedAt: new Date().toISOString(),
    sheetTitles: [],
  };

  if (!config.enabled) {
    messages.push("Integración deshabilitada. Activa GOOGLE_SHEETS_ENABLED=true.");
    return diagnostic;
  }
  if (!config.spreadsheetId) {
    messages.push("Falta el ID del spreadsheet.");
    return diagnostic;
  }
  if (authMode === "none") {
    messages.push("Faltan credenciales de autenticación.");
    return diagnostic;
  }

  try {
    if (authMode === "service-account") {
      const { listSheetTitles } = await import("@/lib/data/providers/sheets-auth");
      diagnostic.sheetTitles = (
        await listSheetTitles(config.spreadsheetId)
      ).map((s) => s.title);
    }

    const { values, error } = await fetchSheetValues(
      config,
      config.timelineRange,
    );
    if (error) {
      messages.push(error);
      diagnostic.canReachApi = !error.toLowerCase().includes("enotfound");
      return diagnostic;
    }

    diagnostic.canReachApi = true;
    diagnostic.canReadSheet = true;
    const { headers } = rowsToObjects(values);
    diagnostic.headers = headers;
    diagnostic.rowCount = Math.max(0, values.length - 1);
    diagnostic.sheetKind = detectSheetKind(headers);

    if (diagnostic.sheetKind === "timeline") {
      const bundle = rowsToTimelineEvents(values);
      diagnostic.timelineEventCount = bundle.events.length;
      diagnostic.headersOk = EXPECTED_TIMELINE_HEADERS.every((h) =>
        headers.some((x) => x.toLowerCase().includes(h.toLowerCase().slice(0, 12))),
      );
      messages.push(
        `Cronología leída correctamente: ${bundle.totalRows} filas → ${bundle.events.length} eventos normalizados.`,
      );
    } else if (diagnostic.sheetKind === "publications") {
      diagnostic.headersOk = EXPECTED_PUBLICATION_HEADERS.every((h) =>
        headers.includes(h),
      );
    } else {
      messages.push(
        "La hoja principal es cronología u otra estructura. Eso está bien para Tres mundos.",
      );
    }

    // Siempre intentar catálogo (Publicaciones + pestañas por categoría).
    invalidateCache("sheets:publications");
    const loaded = await loadPublicationsFromSheets();
    diagnostic.convertedCount = loaded.publications.length;
    diagnostic.conversionIssues = loaded.issues;
    diagnostic.duplicateIssues = validatePublicationUniqueness(
      loaded.publications,
    );
    if (loaded.publications.length > 0) {
      messages.push(
        `Catálogo desde Sheets: ${loaded.publications.length} publicaciones` +
          (loaded.sources?.length
            ? ` (fuentes: ${loaded.sources.join(", ")})`
            : "."),
      );
    } else {
      messages.push(
        loaded.error ||
          "Sin publicaciones todavía. Puedes usar columnas simples: nombre/título, descripción, archivo/URL, alumno, categoría.",
      );
    }
  } catch (err) {
    messages.push(
      err instanceof Error ? err.message : "Error desconocido al consultar Sheets.",
    );
  }

  return diagnostic;
}

export function refreshSheetsCache(): void {
  invalidateCache("sheets:");
}

export function mergeContentSources(
  demo: Publication[],
  sheets: Publication[],
): Publication[] {
  const fromSheets = sheets;
  const demoOnly = demo.filter(
    (d) => !fromSheets.some((s) => s.id === d.id || s.slug === d.slug),
  );
  return upsertPublications(demoOnly, fromSheets);
}
