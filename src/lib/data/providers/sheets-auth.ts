import { google } from "googleapis";
import { getSheetsConfig } from "@/lib/data/providers/sheets";

const SHEETS_TIMEOUT_MS = Number(process.env.GOOGLE_SHEETS_TIMEOUT_MS ?? 12_000);

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
export async function getSheetsClient() {
  const config = getSheetsConfig();
  if (!config.serviceAccountEmail || !config.privateKey) {
    throw new Error(
      "Faltan GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
    );
  }

  const auth = new google.auth.JWT({
    email: config.serviceAccountEmail,
    key: config.privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function fetchSheetValuesWithServiceAccount(
  spreadsheetId: string,
  range: string,
): Promise<string[][]> {
  const sheets = await getSheetsClient();
  const res = await withTimeout(
    sheets.spreadsheets.values.get({ spreadsheetId, range }),
    `values:${range}`,
  );
  return (res.data.values as string[][]) ?? [];
}

export async function listSheetTitles(
  spreadsheetId: string,
): Promise<{ title: string; sheetId: number }[]> {
  const sheets = await getSheetsClient();
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
