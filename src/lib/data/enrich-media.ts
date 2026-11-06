import { getCached, setCached } from "@/lib/data/cache";
import { getDriveFileMeta, type DriveFileKind } from "@/lib/google/drive-meta";
import type { MediaAsset, Publication } from "@/lib/types/content";
import {
  extractGoogleDocId,
  isGoogleWorkspaceUrl,
} from "@/lib/utils/media-links";

const KIND_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_CONCURRENCY = 5;

export function cacheDriveKind(fileId: string, kind: DriveFileKind) {
  if (kind === "unknown") {
    setCached(`drive:kind:${fileId}`, kind, 10 * 60 * 1000);
  } else {
    setCached(`drive:kind:${fileId}`, kind, KIND_TTL_MS);
  }
}

export function readCachedDriveKind(fileId: string): DriveFileKind | null {
  return getCached<DriveFileKind>(`drive:kind:${fileId}`);
}

function mapKindToMediaType(
  kind: DriveFileKind,
): MediaAsset["type"] | null {
  switch (kind) {
    case "video":
      return "video";
    case "image":
      return "image";
    case "audio":
      return "audio";
    case "pdf":
      return "pdf";
    case "document":
      return "document";
    default:
      return null;
  }
}

function applyKindToPub(
  pub: Publication,
  kind: DriveFileKind,
): Publication {
  const primary = pub.media[0];
  if (!primary) return pub;
  const mediaType = mapKindToMediaType(kind);
  if (!mediaType) return pub;
  if (mediaType === primary.type && pub.contentType !== "articulo") return pub;

  const media = [{ ...primary, type: mediaType }, ...pub.media.slice(1)];
  return {
    ...pub,
    media,
    contentType:
      mediaType === "video"
        ? "video"
        : mediaType === "audio"
          ? "audio"
          : mediaType === "image" && pub.contentType === "articulo"
            ? "galeria"
            : pub.contentType,
    tags:
      mediaType === "video" && !pub.tags.some((t) => /video/i.test(t))
        ? [...pub.tags, "video"]
        : pub.tags,
  };
}

/** Aplica tipos ya conocidos en caché (sin red). */
export function applyCachedDriveKinds(
  publications: Publication[],
): Publication[] {
  return publications.map((pub) => {
    const primary = pub.media[0];
    if (!primary?.url || !isGoogleWorkspaceUrl(primary.url)) return pub;
    if (
      primary.type === "video" ||
      primary.type === "image" ||
      primary.type === "audio"
    ) {
      return pub;
    }
    const id = extractGoogleDocId(primary.url);
    if (!id) return pub;
    const kind = readCachedDriveKind(id);
    if (!kind || kind === "unknown") return pub;
    return applyKindToPub(pub, kind);
  });
}

async function resolveKind(fileId: string): Promise<DriveFileKind> {
  const cached = readCachedDriveKind(fileId);
  if (cached) return cached;
  const meta = await getDriveFileMeta(fileId);
  cacheDriveKind(fileId, meta.kind);
  return meta.kind;
}

/**
 * Consulta Drive con presupuesto de tiempo (para búsqueda «video», etc.).
 * No tumba la página: al acabarse el presupuesto devuelve lo tipado hasta entonces.
 */
export async function enrichPublicationsMedia(
  publications: Publication[],
  opts?: { budgetMs?: number; concurrency?: number },
): Promise<Publication[]> {
  const budgetMs = opts?.budgetMs ?? 12_000;
  const concurrency = opts?.concurrency ?? DEFAULT_CONCURRENCY;
  const started = Date.now();

  const indexed = publications.map((pub, index) => ({ pub, index }));
  const needs = indexed.filter(({ pub }) => {
    const primary = pub.media[0];
    if (!primary?.url) return false;
    if (
      primary.type === "video" ||
      primary.type === "image" ||
      primary.type === "audio"
    ) {
      return false;
    }
    return (
      isGoogleWorkspaceUrl(primary.url) &&
      Boolean(extractGoogleDocId(primary.url))
    );
  });

  const out = [...publications];
  let cursor = 0;

  async function worker() {
    while (cursor < needs.length) {
      if (Date.now() - started > budgetMs) return;
      const my = cursor++;
      const { pub, index } = needs[my];
      const id = extractGoogleDocId(pub.media[0]!.url)!;
      try {
        const kind = await resolveKind(id);
        out[index] = applyKindToPub(pub, kind);
      } catch {
        /* deja el original */
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, needs.length || 1) }, () =>
      worker(),
    ),
  );

  return out;
}
