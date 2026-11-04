import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

/**
 * Detecta si un archivo de Drive es video/imagen/pdf.
 * GET /api/media/kind?id=FILE_ID
 */
export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const key = process.env.GOOGLE_SHEETS_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ kind: "unknown" });
  }

  try {
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?fields=mimeType,name&key=${key}`,
      { next: { revalidate: 3600 } },
    );
    if (!metaRes.ok) {
      return NextResponse.json({ kind: "unknown" });
    }
    const meta = (await metaRes.json()) as {
      mimeType?: string;
      name?: string;
    };
    const mime = (meta.mimeType ?? "").toLowerCase();
    const name = meta.name ?? "";

    let kind: "video" | "image" | "pdf" | "audio" | "document" | "unknown" =
      "unknown";
    if (mime.startsWith("video/") || /\.(mp4|mov|webm|m4v)$/i.test(name)) {
      kind = "video";
    } else if (mime.startsWith("image/") || /\.(png|jpe?g|gif|webp)$/i.test(name)) {
      kind = "image";
    } else if (mime === "application/pdf" || /\.pdf$/i.test(name)) {
      kind = "pdf";
    } else if (mime.startsWith("audio/")) {
      kind = "audio";
    } else if (mime.includes("document") || mime.includes("presentation")) {
      kind = "document";
    }

    return NextResponse.json(
      { kind, mimeType: mime, name },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      },
    );
  } catch {
    return NextResponse.json({ kind: "unknown" });
  }
}
