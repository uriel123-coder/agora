import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import { resolveSheetTabTitle } from "@/lib/data/adapters/sheet-aliases";
import {
  getSheetsConfig,
  refreshSheetsCache,
} from "@/lib/data/providers/sheets";
import {
  appendCategorySheetRow,
  deleteCategorySheetRow,
  listSheetTitles,
  updateCategorySheetRow,
} from "@/lib/data/providers/sheets-auth";

export const runtime = "nodejs";
export const maxDuration = 30;

async function resolveTab(spreadsheetId: string, tabTitle: string) {
  const tabs = await listSheetTitles(spreadsheetId);
  const resolved = resolveSheetTabTitle(
    tabs.map((t) => t.title),
    tabTitle,
  );
  return resolved || tabTitle;
}

function revalidateAfterWrite() {
  refreshSheetsCache();
  revalidatePath("/", "layout");
  revalidatePath("/explorar");
  revalidatePath("/admin/publicaciones");
  revalidatePath("/buscar-alumno");
}

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
    const tabTitle = await resolveTab(config.spreadsheetId, body.tabTitle);

    if (body.action === "delete") {
      if (!body.rowNumber || body.rowNumber < 2) {
        return NextResponse.json(
          { error: "rowNumber inválido" },
          { status: 400 },
        );
      }
      await deleteCategorySheetRow({
        spreadsheetId: config.spreadsheetId,
        tabTitle,
        rowNumber: body.rowNumber,
      });
      revalidateAfterWrite();
      return NextResponse.json({ ok: true, tabTitle });
    }

    if (!body.autor?.trim() || !body.tema?.trim()) {
      return NextResponse.json(
        { error: "Faltan autor o título/tema" },
        { status: 400 },
      );
    }

    if (body.action === "append") {
      await appendCategorySheetRow({
        spreadsheetId: config.spreadsheetId,
        tabTitle,
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
        tabTitle,
        rowNumber: body.rowNumber,
        autor: body.autor.trim(),
        tema: body.tema.trim(),
        anio: body.anio?.trim() || "",
        enlace: body.enlace?.trim() || "",
      });
    }

    revalidateAfterWrite();
    return NextResponse.json({ ok: true, tabTitle });
  } catch (err) {
    return NextResponse.json(
      { error: friendlyWriteError(err) },
      { status: 500 },
    );
  }
}
