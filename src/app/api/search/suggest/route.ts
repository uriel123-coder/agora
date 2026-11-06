import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { enrichPublicationsMedia } from "@/lib/data/enrich-media";
import { getAllPublications } from "@/lib/data/repository";
import { searchPublications } from "@/lib/search";
import { normalizeText } from "@/lib/utils/text";

export const runtime = "nodejs";
export const maxDuration = 30;

function isMediaTypeQuery(q: string) {
  const n = normalizeText(q);
  return [
    "video",
    "videos",
    "pdf",
    "pdfs",
    "imagen",
    "imagenes",
    "foto",
    "fotos",
    "audio",
    "documento",
    "documentos",
    "docx",
    "word",
  ].includes(n);
}

/** Índice ligero para el buscador ⌘K (no carga el catálogo en cada página). */
export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const user = await getSession();
  const role = user?.role ?? "visitor";
  let publications = await getAllPublications(role);

  if (q.length < 2) {
    const featured = publications
      .filter((p) => p.featured)
      .slice(0, 6)
      .map(slim);
    const fallback =
      featured.length > 0
        ? featured
        : publications.slice(0, 6).map(slim);
    return NextResponse.json({ items: fallback });
  }

  if (isMediaTypeQuery(q)) {
    publications = await enrichPublicationsMedia(publications, {
      budgetMs: 10_000,
      concurrency: 5,
    });
  }

  const result = searchPublications(publications, {
    query: q,
    page: 1,
    pageSize: 8,
    sort: "relevance",
  });

  return NextResponse.json({
    items: result.items.map((i) => slim(i.publication)),
  });
}

function slim(p: {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage?: string;
  primaryCategory: string;
  authors: { displayName: string; nameVisible: boolean }[];
}) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    coverImage: p.coverImage,
    primaryCategory: p.primaryCategory,
    author:
      p.authors.find((a) => a.nameVisible)?.displayName ?? "",
  };
}
