import { NextResponse } from "next/server";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import {
  getSheetsConfig,
  refreshSheetsCache,
} from "@/lib/data/providers/sheets";
import {
  appendCategorySheetRow,
  deleteCategorySheetRow,
  updateCategorySheetRow,
} from "@/lib/data/providers/sheets-auth";

export const runtime = "nodejs";
export const maxDuration = 30;

function friendlyWriteError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/permission|forbidden|403|The caller does not have permission/i.test(message)) {
    return "Sin permiso para escribir. Comparte el Google Sheet con la cuenta de servicio como Editor (no solo Lector).";
  }
  if (/timeout|Timeout/i.test(message)) {
    return "Sheets tardó demasiado al guardar. Intenta otra vez.";
  }
  if (/Unable to parse range|Unable to parse/i.test(message)) {
    return "No se encontró esa pestaña en el spreadsheet. Revisa el nombre exacto.";
  }
  return message || "No se pudo escribir en Google Sheets";
}

type Body = {
  action: "update" | "append" | "delete";
  tabTitle: string;
  rowNumber?: number;
  autor?: string;
  tema?: string;
  anio?: string;
  enlace?: string;
};

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const config = getSheetsConfig();
  if (!config.enabled || !config.spreadsheetId) {
    return NextResponse.json(
      { error: "Sheets no está configurado" },
      { status: 400 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body.tabTitle) {
    return NextResponse.json({ error: "Falta tabTitle" }, { status: 400 });
  }

  try {
    if (body.action === "delete") {
      if (!body.rowNumber || body.rowNumber < 2) {
        return NextResponse.json(
          { error: "rowNumber inválido" },
          { status: 400 },
        );
      }
      await deleteCategorySheetRow({
        spreadsheetId: config.spreadsheetId,
        tabTitle: body.tabTitle,
        rowNumber: body.rowNumber,
      });
      refreshSheetsCache();
      return NextResponse.json({ ok: true });
    }

    if (!body.autor?.trim() || !body.tema?.trim()) {
      return NextResponse.json(
        { error: "Faltan autor o tema" },
        { status: 400 },
      );
    }

    if (body.action === "append") {
      await appendCategorySheetRow({
        spreadsheetId: config.spreadsheetId,
        tabTitle: body.tabTitle,
        autor: body.autor.trim(),
        tema: body.tema.trim(),
        anio: body.anio?.trim() || "",
        enlace: body.enlace?.trim() || "",
      });
    } else {
      if (!body.rowNumber || body.rowNumber < 2) {
        return NextResponse.json(
          { error: "rowNumber inválido" },
          { status: 400 },
        );
      }
      await updateCategorySheetRow({
        spreadsheetId: config.spreadsheetId,
        tabTitle: body.tabTitle,
        rowNumber: body.rowNumber,
        autor: body.autor.trim(),
        tema: body.tema.trim(),
        anio: body.anio?.trim() || "",
        enlace: body.enlace?.trim() || "",
      });
    }

    refreshSheetsCache();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: friendlyWriteError(err) },
      { status: 500 },
    );
  }
}
