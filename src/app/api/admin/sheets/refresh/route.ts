import { NextResponse } from "next/server";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import {
  loadPublicationsFromSheets,
  loadTimelineFromSheets,
  refreshSheetsCache,
} from "@/lib/data/providers/sheets";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Recarga el catálogo y la cronología desde Google Sheets. */
export async function POST() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    refreshSheetsCache();

    const [pubs, timeline] = await Promise.all([
      loadPublicationsFromSheets(),
      loadTimelineFromSheets(),
    ]);

    const errors = [pubs.error, timeline.error].filter(Boolean) as string[];

    return NextResponse.json({
      ok: errors.length === 0 || pubs.publications.length > 0,
      publications: pubs.publications.length,
      publicationSources: pubs.sources ?? [],
      publicationError: pubs.error ?? null,
      timelineEvents: timeline.bundle.events.length,
      timelineError: timeline.error ?? null,
      warning: errors.length
        ? errors.join(" · ")
        : null,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al actualizar desde Sheets";
    // Mensajes típicos de Google → más claros para el admin
    let friendly = message;
    if (/timeout|Timeout/i.test(message)) {
      friendly =
        "Sheets tardó demasiado. Vuelve a intentar; si se repite, revisa la conexión o el tamaño de las pestañas.";
    } else if (/permission|forbidden|403|not have access/i.test(message)) {
      friendly =
        "Sin permiso de lectura. Comparte el spreadsheet con la cuenta de servicio (como Lector o Editor).";
    }

    return NextResponse.json({ error: friendly, detail: message }, { status: 500 });
  }
}
