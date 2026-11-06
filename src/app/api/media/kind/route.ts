import { NextRequest, NextResponse } from "next/server";
import {
  cacheDriveKind,
  readCachedDriveKind,
} from "@/lib/data/enrich-media";
import { getDriveFileMeta } from "@/lib/google/drive-meta";

export const runtime = "nodejs";
export const maxDuration = 20;

/**
 * Detecta el tipo real de un archivo de Drive (video/pdf/docx…).
 * GET /api/media/kind?id=FILE_ID
 */
export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  try {
    const cached = readCachedDriveKind(id);
    if (cached && cached !== "unknown") {
      return NextResponse.json(
        { kind: cached },
        {
          headers: {
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        },
      );
    }

    const meta = await getDriveFileMeta(id);
    cacheDriveKind(id, meta.kind);
    return NextResponse.json(
      {
        kind: meta.kind,
        mimeType: meta.mimeType,
        name: meta.name,
      },
      {
        headers: {
          "Cache-Control":
            meta.kind === "unknown"
              ? "public, max-age=60, s-maxage=60"
              : "public, max-age=3600, s-maxage=3600",
        },
      },
    );
  } catch {
    return NextResponse.json({ kind: "unknown" });
  }
}
