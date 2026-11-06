import { NextRequest, NextResponse } from "next/server";
import { getDriveFileMeta } from "@/lib/google/drive-meta";

export const runtime = "nodejs";
export const maxDuration = 20;

/**
 * Miniatura estable de un archivo de Drive.
 * GET /api/media/thumb?id=FILE_ID
 */
export async function GET(req: NextRequest) {
  const id = (req.nextUrl.searchParams.get("id") ?? "").trim();
  if (!/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  const candidates: string[] = [];

  try {
    const meta = await getDriveFileMeta(id);
    if (meta.thumbnailLink) {
      candidates.push(meta.thumbnailLink.replace(/=s\d+/, "=s640"));
      candidates.push(meta.thumbnailLink);
    }
  } catch {
    /* candidatos públicos */
  }

  candidates.push(
    `https://lh3.googleusercontent.com/d/${id}=w640`,
    `https://lh3.googleusercontent.com/d/${id}=s640`,
    `https://drive.google.com/thumbnail?id=${id}&sz=w640`,
  );

  for (const url of candidates) {
    try {
      const upstream = await fetch(url, {
        redirect: "follow",
        headers: {
          Accept: "image/*,*/*",
          "User-Agent":
            "Mozilla/5.0 (compatible; AgoraOrHajayim/1.0; +https://agora)",
        },
      });
      if (!upstream.ok) continue;
      const type = upstream.headers.get("content-type") ?? "";
      if (type.includes("text/html")) continue;
      const buffer = await upstream.arrayBuffer();
      if (buffer.byteLength < 80) continue;

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": type.includes("image") ? type : "image/jpeg",
          "Cache-Control": "public, max-age=86400, s-maxage=86400",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // siguiente
    }
  }

  return NextResponse.json(
    { error: "No hay miniatura pública para este archivo" },
    { status: 404 },
  );
}
