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

/** Actualiza una fila A:D de una pestaña de categoría (Autor, Tema, Año, Enlace). */
export async function updateCategorySheetRow(input: {
  spreadsheetId: string;
  tabTitle: string;
  rowNumber: number;
  autor: string;
  tema: string;
  anio: string;
  enlace: string;
}): Promise<void> {
  const sheets = await getSheetsClient(true);
  const safeTab = input.tabTitle.replace(/'/g, "''");
  const range = `'${safeTab}'!A${input.rowNumber}:D${input.rowNumber}`;
  await withTimeout(
    sheets.spreadsheets.values.update({
      spreadsheetId: input.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[input.autor, input.tema, input.anio, input.enlace]],
      },
    }),
    `update:${range}`,
  );
}

/** Agrega una fila al final de una pestaña de categoría. */
export async function appendCategorySheetRow(input: {
  spreadsheetId: string;
  tabTitle: string;
  autor: string;
  tema: string;
  anio: string;
  enlace: string;
}): Promise<void> {
  const sheets = await getSheetsClient(true);
  const safeTab = input.tabTitle.replace(/'/g, "''");
  const range = `'${safeTab}'!A:D`;
  await withTimeout(
    sheets.spreadsheets.values.append({
      spreadsheetId: input.spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[input.autor, input.tema, input.anio, input.enlace]],
      },
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
