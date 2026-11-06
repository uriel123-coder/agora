import { getCached, setCached } from "@/lib/data/cache";
import { getDriveFileMeta, type DriveFileKind } from "@/lib/google/drive-meta";
import type { MediaAsset, Publication } from "@/lib/types/content";
import {
  extractGoogleDocId,
  isGoogleWorkspaceUrl,
} from "@/lib/utils/media-links";

const KIND_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const CONCURRENCY = 6;

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

async function resolveKind(fileId: string): Promise<DriveFileKind> {
  const cacheKey = `drive:kind:${fileId}`;
  const cached = getCached<DriveFileKind>(cacheKey);
  if (cached) return cached;

  const meta = await getDriveFileMeta(fileId);
  const kind = meta.kind;
  if (kind !== "unknown") {
    setCached(cacheKey, kind, KIND_TTL_MS);
  } else {
    // Evitar martillar Drive si falla: cache corto
    setCached(cacheKey, kind, 10 * 60 * 1000);
  }
  return kind;
}

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return out;
}

/**
 * Corrige media.type (y contentType video) consultando Drive una vez por archivo.
 * Así las tarjetas y el buscador saben que es Video sin esperar al cliente.
 */
export async function enrichPublicationsMedia(
  publications: Publication[],
): Promise<Publication[]> {
  return mapPool(publications, CONCURRENCY, async (pub) => {
    const primary = pub.media[0];
    if (!primary?.url) return pub;
    if (
      primary.type === "video" ||
      primary.type === "image" ||
      primary.type === "audio"
    ) {
      return pub;
    }
    if (!isGoogleWorkspaceUrl(primary.url)) return pub;
    const id = extractGoogleDocId(primary.url);
    if (!id) return pub;

    try {
      const kind = await resolveKind(id);
      const mediaType = mapKindToMediaType(kind);
      if (!mediaType || mediaType === primary.type) {
        // Aun si es document, ya lo sabíamos
        if (mediaType === "pdf" && primary.type !== "pdf") {
          return {
            ...pub,
            media: [{ ...primary, type: "pdf" }, ...pub.media.slice(1)],
          };
        }
        return pub;
      }

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
          mediaType === "video" &&
          !pub.tags.some((t) => /video/i.test(t))
            ? [...pub.tags, "video"]
            : pub.tags,
      };
    } catch {
      return pub;
    }
  });
}
