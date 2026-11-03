import { NextRequest, NextResponse } from "next/server";
import {
  extractGoogleDocId,
  isGoogleWorkspaceUrl,
  isPdfUrl,
  looksLikePdfBytes,
  toEmbeddablePdfUrl,
} from "@/lib/utils/media-links";

export const runtime = "nodejs";
export const maxDuration = 60;

function driveCandidates(url: string): string[] {
  const id = extractGoogleDocId(url);
  const list: string[] = [];
  const embed = toEmbeddablePdfUrl(url);
  if (embed) list.push(embed);

  if (id) {
    const key = process.env.GOOGLE_SHEETS_API_KEY?.trim();
    if (key) {
      list.push(
        `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${key}`,
      );
    }
    list.push(`https://drive.google.com/uc?export=download&confirm=t&id=${id}`);
    list.push(`https://drive.google.com/uc?export=download&id=${id}`);
    list.push(`https://drive.google.com/uc?id=${id}&export=download`);
  }

  if (isPdfUrl(url) && !isGoogleWorkspaceUrl(url)) {
    list.push(url);
  }

  return [...new Set(list)];
}

function confirmFromHtml(html: string): string | null {
  const patterns = [
    /confirm=([0-9A-Za-z_-]+)/,
    /name="confirm"\s+value="([^"]+)"/,
    /&amp;confirm=([0-9A-Za-z_-]+)/,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1] && m[1] !== "t") return m[1];
  }
  return null;
}

async function fetchPdfBytes(url: string): Promise<ArrayBuffer | null> {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      Accept: "application/pdf,application/octet-stream,*/*",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") ?? "";
  const buffer = await res.arrayBuffer();

  if (looksLikePdfBytes(buffer)) return buffer;

  // Página intermedia de Drive (antivirus) → reintentar con confirm
  if (
    contentType.includes("text/html") ||
    contentType.includes("text/plain")
  ) {
    const html = new TextDecoder().decode(buffer.slice(0, 8000));
    const id = extractGoogleDocId(url);
    const confirm = confirmFromHtml(html);
    if (id && confirm) {
      const retry = await fetch(
        `https://drive.google.com/uc?export=download&confirm=${confirm}&id=${id}`,
        {
          redirect: "follow",
          headers: {
            Accept: "application/pdf,application/octet-stream,*/*",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        },
      );
      if (retry.ok) {
        const again = await retry.arrayBuffer();
        if (looksLikePdfBytes(again)) return again;
      }
    }
  }

  return null;
}

/** Sirve bytes PDF reales para el visor Ágora. */
export async function GET(req: NextRequest) {
  // searchParams ya decodifica una vez; no volver a decodeURIComponent
  const target = req.nextUrl.searchParams.get("url")?.trim() ?? "";
  if (!target) {
    return NextResponse.json({ error: "Falta url" }, { status: 400 });
  }
  if (!/^https?:\/\//i.test(target)) {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  const candidates = driveCandidates(target);
  if (!candidates.length) {
    return NextResponse.json(
      { error: "No se puede convertir a PDF" },
      { status: 422 },
    );
  }

  for (const candidate of candidates) {
    try {
      const buffer = await fetchPdfBytes(candidate);
      if (!buffer) continue;
      const id = extractGoogleDocId(target) ?? "documento";
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `inline; filename="${id}.pdf"`,
          "Cache-Control": "public, max-age=1800, s-maxage=1800",
          "X-Content-Type-Options": "nosniff",
        },
      });
    } catch {
      // probar siguiente candidato
    }
  }

  return NextResponse.json(
    {
      error:
        "No se pudo leer el PDF. Ponlo en una carpeta pública de Drive (cualquiera con el enlace) o sube el archivo en Admin.",
    },
    { status: 403 },
  );
}
