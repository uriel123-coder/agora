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
import { rowsToTimelineEvents } from "@/lib/data/adapters/timeline";
import {
  validatePublicationUniqueness,
  type ValidationIssue,
} from "@/lib/data/validation";
import type { Publication } from "@/lib/types/content";
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

export async function loadPublicationsFromSheets(): Promise<{
  publications: Publication[];
  issues: ValidationIssue[];
  error?: string;
}> {
  const cacheKey = "sheets:publications";
  const cached = getCached<{
    publications: Publication[];
    issues: ValidationIssue[];
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

  // Intentar rango de publicaciones; si la hoja actual es cronología, no forzar conversión.
  const { values, error } = await fetchSheetValues(
    config,
    config.publicationsRange,
  );
  if (error) return { publications: [], issues: [], error };

  const { headers, rows } = rowsToObjects(values);
  if (detectSheetKind(headers) === "timeline") {
    return {
      publications: [],
      issues: [],
      error:
        "La hoja conectada es la cronología comparativa, no un catálogo de publicaciones. El catálogo sigue en datos demo hasta que exista una pestaña Publicaciones.",
    };
  }

  const publications: Publication[] = [];
  const issues: ValidationIssue[] = [];

  for (const row of rows) {
    if (!Object.values(row).some((v) => v.trim())) continue;
    const result = rowToPublication(row);
    issues.push(...result.issues);
    if (result.publication) publications.push(result.publication);
  }

  issues.push(...validatePublicationUniqueness(publications));
  const payload = { publications, issues };
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
      messages.push(
        "El catálogo editorial de Ágora sigue en datos de demostración hasta que exista una hoja Publicaciones con columnas canónicas.",
      );
    } else if (diagnostic.sheetKind === "publications") {
      const loaded = await loadPublicationsFromSheets();
      diagnostic.convertedCount = loaded.publications.length;
      diagnostic.conversionIssues = loaded.issues;
      diagnostic.duplicateIssues = validatePublicationUniqueness(
        loaded.publications,
      );
      diagnostic.headersOk = EXPECTED_PUBLICATION_HEADERS.every((h) =>
        headers.includes(h),
      );
      messages.push(
        `Publicaciones convertidas: ${loaded.publications.length}.`,
      );
    } else {
      messages.push(
        "Estructura de hoja no reconocida. Revisa encabezados o indica el rango correcto.",
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
