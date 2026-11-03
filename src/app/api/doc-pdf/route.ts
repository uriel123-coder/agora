import { NextRequest, NextResponse } from "next/server";
import {
  extractGoogleDocId,
  isPdfUrl,
  toEmbeddablePdfUrl,
} from "@/lib/utils/media-links";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Sirve el PDF desde Ágora para el visor nativo (sin UI ni login de Google). */
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url")?.trim();
  if (!raw) {
    return NextResponse.json({ error: "Falta url" }, { status: 400 });
  }

  let target: string;
  try {
    target = decodeURIComponent(raw);
  } catch {
    target = raw;
  }

  if (!/^https?:\/\//i.test(target)) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const embed = toEmbeddablePdfUrl(target) ?? (isPdfUrl(target) ? target : null);
  if (!embed) {
    return NextResponse.json(
      { error: "No se puede convertir a PDF" },
      { status: 422 },
    );
  }

  try {
    const upstream = await fetch(embed, {
      redirect: "follow",
      headers: {
        Accept: "application/pdf,*/*",
        "User-Agent": "AgoraOrHajayim/1.0",
      },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Origen respondió ${upstream.status}` },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "";
    if (
      contentType.includes("text/html") ||
      contentType.includes("text/plain")
    ) {
      // Login / permiso de Google → no embeber HTML de Google
      return NextResponse.json(
        { error: "El archivo no es público para vista" },
        { status: 403 },
      );
    }

    const buffer = await upstream.arrayBuffer();
    const id = extractGoogleDocId(target) ?? "documento";
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${id}.pdf"`,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo obtener el documento" },
      { status: 502 },
    );
  }
}
