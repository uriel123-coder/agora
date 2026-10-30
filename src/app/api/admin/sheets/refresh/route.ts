import { NextResponse } from "next/server";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import {
  diagnoseSheetsConnection,
  loadPublicationsFromSheets,
  loadTimelineFromSheets,
  refreshSheetsCache,
} from "@/lib/data/providers/sheets";

export async function POST() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  refreshSheetsCache();
  const [pubs, timeline, diagnostic] = await Promise.all([
    loadPublicationsFromSheets(),
    loadTimelineFromSheets(),
    diagnoseSheetsConnection(),
  ]);

  return NextResponse.json({
    ok: true,
    publications: pubs.publications.length,
    publicationSources: pubs.sources ?? [],
    publicationError: pubs.error ?? null,
    timelineEvents: timeline.bundle.events.length,
    timelineError: timeline.error ?? null,
    diagnostic: {
      enabled: diagnostic.enabled,
      canReadSheet: diagnostic.canReadSheet,
      sheetKind: diagnostic.sheetKind,
      sheetTitles: diagnostic.sheetTitles,
      messages: diagnostic.messages,
    },
  });
}
