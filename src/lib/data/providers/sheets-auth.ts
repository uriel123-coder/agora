import { google } from "googleapis";
import { getSheetsConfig } from "@/lib/data/providers/sheets";

const SHEETS_TIMEOUT_MS = Number(process.env.GOOGLE_SHEETS_TIMEOUT_MS ?? 20_000);

async function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`Timeout de Google Sheets (${label})`));
        }, SHEETS_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Autenticación server-side con service account. Nunca exponer al cliente. */
export async function getSheetsClient(write = false) {
  const config = getSheetsConfig();
  if (!config.serviceAccountEmail || !config.privateKey) {
    throw new Error(
      "Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    );
  }

  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: [
      write
        ? "https://www.googleapis.com/auth/spreadsheets"
        : "https://www.googleapis.com/auth/spreadsheets.readonly",
    ],
  });

  return google.sheets({ version: "v4", auth });
}

export async function fetchSheetValuesWithServiceAccount(
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const sheets = await getSheetsClient(false);
  const res = await withTimeout(
    sheets.spreadsheets.values.get({ spreadsheetId, range }),
    `values:${range}`,
  );
  return (res.data.values as string[][]) ?? [];
}

export async function listSheetTitles(
  spreadsheetId: string,
): Promise<{ title: string; sheetId: number }[]> {
  const sheets = await getSheetsClient(false);
  const res = await withTimeout(
    sheets.spreadsheets.get({
      spreadsheetId,
      fields: "sheets.properties",
    }),
    "spreadsheet.meta",
  );
  return (
    res.data.sheets?.map((s) => ({
      title: s.properties?.title ?? "",
      sheetId: s.properties?.sheetId ?? 0,
    })) ?? []
  );
}

type CategoryRowInput = {
  spreadsheetId: string;
  tabTitle: string;
  autor: string;
  tema: string;
  anio: string;
  enlace: string;
};

const DEFAULT_HEADERS = ["Autor", "Tema", "Año", "Enlace"] as const;

function colLetter(index0: number): string {
  let n = index0 + 1;
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

function headerIndex(headers: string[], ...candidates: string[]): number {
  const lowered = headers.map((h) => h.trim().toLowerCase());
  for (const c of candidates) {
    const i = lowered.indexOf(c.toLowerCase());
    if (i >= 0) return i;
  }
  return -1;
}

/**
 * Lee encabezados reales de la pestaña.
 * Taller puede ser Autor|Género|Título|Año|Enlace (no A:D fijo).
 */
async function getTabHeaders(
  spreadsheetId: string,
  tabTitle: string,
): Promise<string[]> {
  const sheets = await getSheetsClient(true);
  const safeTab = tabTitle.replace(/'/g, "''");
  const res = await withTimeout(
    sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `'${safeTab}'!1:1`,
    }),
    `headers:${tabTitle}`,
  );
  return ((res.data.values?.[0] as string[]) ?? []).map((h) =>
    String(h ?? "").trim(),
  );
}

async function ensureTabHeaders(
  spreadsheetId: string,
  tabTitle: string,
): Promise<string[]> {
  const existing = await getTabHeaders(spreadsheetId, tabTitle);
  if (existing.some((h) => h.length > 0)) return existing;

  const sheets = await getSheetsClient(true);
  const safeTab = tabTitle.replace(/'/g, "''");
  await withTimeout(
    sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `'${safeTab}'!A1:D1`,
      valueInputOption: "RAW",
      requestBody: { values: [Array.from(DEFAULT_HEADERS)] },
    }),
    `ensure-headers:${tabTitle}`,
  );
  return Array.from(DEFAULT_HEADERS);
}

/** Construye la fila respetando el orden real de columnas. */
function buildRowValues(
  headers: string[],
  input: Pick<CategoryRowInput, "autor" | "tema" | "anio" | "enlace">,
  previous?: string[],
): string[] {
  const prev = previous ?? [];
  const values = headers.map((_, i) => prev[i] ?? "");

  const set = (candidates: string[], value: string) => {
    const i = headerIndex(headers, ...candidates);
    if (i >= 0) values[i] = value;
  };

  set(["Autor", "autor", "Alumno"], input.autor);
  // Título del trabajo: Título > Tema > (si no hay) Género/Clasificación
  const titleIdx = headerIndex(headers, "Título", "Titulo", "Tema", "Nombre");
  if (titleIdx >= 0) {
    values[titleIdx] = input.tema;
  } else {
    set(["Género", "Genero", "Clasificación", "Clasificacion"], input.tema);
  }
  set(["Año", "Ano", "Ciclo"], input.anio);
  set(["Enlace", "Link", "URL", "Archivo", "Media"], input.enlace);

  // Si la hoja no tenía encabezados reconocibles, caer al formato A–D clásico
  if (!headers.length || headerIndex(headers, "Autor") < 0) {
    return [input.autor, input.tema, input.anio, input.enlace];
  }
  return values;
}

/** Actualiza una fila usando los encabezados reales de la pestaña. */
export async function updateCategorySheetRow(
  input: CategoryRowInput & { rowNumber: number },
): Promise<void> {
  const sheets = await getSheetsClient(true);
  const headers = await ensureTabHeaders(input.spreadsheetId, input.tabTitle);
  const safeTab = input.tabTitle.replace(/'/g, "''");
  const lastCol = colLetter(Math.max(headers.length, 4) - 1);
  const rowRange = `'${safeTab}'!A${input.rowNumber}:${lastCol}${input.rowNumber}`;

  const current = await withTimeout(
    sheets.spreadsheets.values.get({
      spreadsheetId: input.spreadsheetId,
      range: rowRange,
    }),
    `read-row:${rowRange}`,
  );
  const previous = (current.data.values?.[0] as string[]) ?? [];
  const values = buildRowValues(headers, input, previous);

  await withTimeout(
    sheets.spreadsheets.values.update({
      spreadsheetId: input.spreadsheetId,
      range: `'${safeTab}'!A${input.rowNumber}:${colLetter(values.length - 1)}${input.rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [values] },
    }),
    `update:${rowRange}`,
  );
}

/** Agrega una fila al final de una pestaña de categoría. */
export async function appendCategorySheetRow(
  input: CategoryRowInput,
): Promise<void> {
  const sheets = await getSheetsClient(true);
  const headers = await ensureTabHeaders(input.spreadsheetId, input.tabTitle);
  const safeTab = input.tabTitle.replace(/'/g, "''");
  const values = buildRowValues(headers, input);
  const lastCol = colLetter(Math.max(values.length, 4) - 1);
  const range = `'${safeTab}'!A:${lastCol}`;

  await withTimeout(
    sheets.spreadsheets.values.append({
      spreadsheetId: input.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [values] },
    }),
    `append:${range}`,
  );
}

/** Borra una fila de una pestaña (por número 1-based de Sheets). */
export async function deleteCategorySheetRow(input: {
  spreadsheetId: string;
  tabTitle: string;
  rowNumber: number;
}): Promise<void> {
  const sheets = await getSheetsClient(true);
  const meta = await withTimeout(
    sheets.spreadsheets.get({
      spreadsheetId: input.spreadsheetId,
      fields: "sheets.properties",
    }),
    "spreadsheet.meta.delete",
  );
  const sheet = meta.data.sheets?.find(
    (s) => s.properties?.title === input.tabTitle,
  );
  const sheetId = sheet?.properties?.sheetId;
  if (sheetId == null) {
    throw new Error(`No se encontró la pestaña «${input.tabTitle}»`);
  }
  if (input.rowNumber < 2) {
    throw new Error("No se puede borrar la fila de encabezados");
  }

  await withTimeout(
    sheets.spreadsheets.batchUpdate({
      spreadsheetId: input.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId,
                dimension: "ROWS",
                startIndex: input.rowNumber - 1,
                endIndex: input.rowNumber,
              },
            },
          },
        ],
      },
    }),
    `delete-row:${input.tabTitle}:${input.rowNumber}`,
  );
}
