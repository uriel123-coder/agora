"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { MediaThumb } from "@/components/publications/MediaThumb";
import { getCategory } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";
import {
  detectMediaKind,
  getMediaThumbnail,
  mediaKindLabel,
  type MediaKind,
} from "@/lib/utils/media-links";

/**
 * Tarjeta clicable (cliente): miniatura + etiqueta Video/PDF/Documento.
 * Todo vive en el cliente para poder actualizar el tipo sin romper RSC.
 */
export function WorkCard({
  publication,
  showAuthor = false,
}: {
  publication: Publication;
  showAuthor?: boolean;
}) {
  const category = getCategory(publication.primaryCategory);
  const primary = publication.media[0];
  const primaryUrl = primary?.url;
  const initialKind: MediaKind = primaryUrl
    ? detectMediaKind(primaryUrl, {
        mediaType:
          primary?.type === "document" && publication.contentType === "video"
            ? "video"
            : primary?.type === "document" && publication.contentType === "audio"
              ? "audio"
              : primary?.type === "document" &&
                  publication.contentType === "galeria"
                ? "image"
                : primary?.type,
        title: `${primary?.title ?? ""} ${publication.title} ${publication.contentType}`,
      })
    : "link";

  const [kind, setKind] = useState<MediaKind>(initialKind);
  const thumb = getMediaThumbnail(primaryUrl, publication.coverImage);
  const isVideo =
    kind === "youtube" || kind === "vimeo" || kind === "video";
  const authors = publication.authors
    .filter((a) => a.nameVisible)
    .map((a) => a.displayName)
    .join(", ");
  const detailHref = `/publicacion/${publication.slug}`;

  return (
    <a
      href={detailHref}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_0_rgba(36,55,70,0.06)] ring-1 ring-border/70 transition hover:ring-oh-blue/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-oh-blue"
      style={{ touchAction: "manipulation" }}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-oh-stone">
        <MediaThumb
          src={thumb}
          accent={category.accent}
          kind={initialKind}
          mediaUrl={primaryUrl}
          onKindResolved={setKind}
        />
        <span className="absolute bottom-2 left-2 z-[2] inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {isVideo ? (
            <>
              <Play className="h-3 w-3 fill-white" />
              Video
            </>
          ) : (
            mediaKindLabel(kind)
          )}
        </span>
        {isVideo ? (
          <span
            className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
            aria-hidden
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm">
              <Play className="h-5 w-5 fill-white pl-0.5" />
            </span>
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3.5 py-3">
        <p className="text-[11px] text-muted">
          {category.name}
          {publication.schoolYear ? ` · ${publication.schoolYear}` : ""}
        </p>
        <h3 className="mt-1 line-clamp-2 font-display text-[1.02rem] leading-snug text-oh-ink group-hover:text-oh-blue dark:text-foreground">
          {publication.title}
        </h3>
        {showAuthor && authors ? (
          <p className="mt-1 truncate text-xs text-muted">{authors}</p>
        ) : null}
        <span className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-oh-ink text-sm font-medium text-white group-hover:bg-oh-blue dark:bg-oh-blue">
          {isVideo ? "Ver video" : "Ver trabajo"}
        </span>
      </div>
    </a>
  );
}
