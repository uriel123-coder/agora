import { NextResponse } from "next/server";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import {
  getSheetsConfig,
  refreshSheetsCache,
} from "@/lib/data/providers/sheets";
import {
  appendCategorySheetRow,
  updateCategorySheetRow,
} from "@/lib/data/providers/sheets-auth";

type Body = {
  action: "update" | "append";
  tabTitle: string;
  rowNumber?: number;
  autor: string;
  tema: string;
  anio: string;
  enlace: string;
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

  if (!body.tabTitle || !body.autor?.trim() || !body.tema?.trim()) {
    return NextResponse.json(
      { error: "Faltan tabTitle, autor o tema" },
      { status: 400 },
    );
  }

  try {
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
      {
        error:
          err instanceof Error
            ? err.message
            : "No se pudo escribir en Google Sheets",
      },
      { status: 500 },
    );
  }
}
