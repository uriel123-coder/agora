import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

type ApiKind = "video" | "image" | "pdf" | "audio" | "document" | "unknown";

function classify(mime: string, name: string): ApiKind {
  const m = mime.toLowerCase();
  const n = name.toLowerCase();

  if (m.startsWith("video/") || /\.(mp4|mov|webm|m4v|mkv)$/i.test(n)) {
    return "video";
  }
  if (m.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(n)) {
    return "image";
  }
  if (m.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg)$/i.test(n)) {
    return "audio";
  }
  if (m === "application/pdf" || n.endsWith(".pdf")) {
    return "pdf";
  }

  // Word / PowerPoint / Excel / OpenDocument / Google Docs nativos
  if (
    m.includes("word") ||
    m.includes("officedocument.wordprocessing") ||
    m.includes("msword") ||
    m.includes("opendocument.text") ||
    m.includes("presentation") ||
    m.includes("spreadsheet") ||
    m.includes("excel") ||
    m === "application/vnd.google-apps.document" ||
    m === "application/vnd.google-apps.presentation" ||
    m === "application/vnd.google-apps.spreadsheet" ||
    /\.(docx?|pptx?|xlsx?|odt|ods|odp|rtf)$/i.test(n)
  ) {
    return "document";
  }

  if (m.includes("document") || m.includes("text/")) {
    return "document";
  }

  return "unknown";
}

/**
 * Detecta el tipo real de un archivo de Drive.
 * GET /api/media/kind?id=FILE_ID
 */
export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const key = process.env.GOOGLE_SHEETS_API_KEY?.trim();
  if (!key) {
    return NextResponse.json({ kind: "unknown" as ApiKind });
  }

  try {
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?fields=mimeType,name&key=${key}`,
      { next: { revalidate: 3600 } },
    );
    if (!metaRes.ok) {
      return NextResponse.json({ kind: "unknown" as ApiKind });
    }
    const meta = (await metaRes.json()) as {
      mimeType?: string;
      name?: string;
    };
    const mime = meta.mimeType ?? "";
    const name = meta.name ?? "";
    const kind = classify(mime, name);

    return NextResponse.json(
      { kind, mimeType: mime, name },
      {
        headers: {
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
        },
      },
    );
  } catch {
    return NextResponse.json({ kind: "unknown" as ApiKind });
  }
}
