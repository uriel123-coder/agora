import { NextRequest, NextResponse } from "next/server";
import {
  extractGoogleDocId,
  isPdfUrl,
  looksLikePdfBytes,
  toEmbeddablePdfUrl,
} from "@/lib/utils/media-links";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Sirve bytes PDF reales para el visor Ágora (sin HTML ni UI de Google). */
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

  const candidates = [
    toEmbeddablePdfUrl(target),
    isPdfUrl(target) ? target : null,
  ].filter(Boolean) as string[];

  if (!candidates.length) {
    return NextResponse.json(
      { error: "No se puede convertir a PDF" },
      { status: 422 },
    );
  }

  let lastError = "No se pudo obtener el documento";

  for (const embed of candidates) {
    try {
      const upstream = await fetch(embed, {
        redirect: "follow",
        headers: {
          Accept: "application/pdf,application/octet-stream,*/*",
          "User-Agent":
            "Mozilla/5.0 (compatible; AgoraOrHajayim/1.0; +https://agora)",
        },
      });

      if (!upstream.ok) {
        lastError = `Origen respondió ${upstream.status}`;
        continue;
      }

      const contentType = upstream.headers.get("content-type") ?? "";
      const buffer = await upstream.arrayBuffer();

      if (
        contentType.includes("text/html") ||
        contentType.includes("text/plain") ||
        !looksLikePdfBytes(buffer)
      ) {
        lastError =
          "El archivo no es un PDF público. Compártelo como «Cualquiera con el enlace» o sube el PDF directo.";
        continue;
      }

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
      lastError = "Error de red al obtener el documento";
    }
  }

  return NextResponse.json({ error: lastError }, { status: 403 });
}
