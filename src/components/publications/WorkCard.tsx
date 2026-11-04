import { FileText, Play } from "lucide-react";
import { getCategory } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";
import {
  detectMediaKind,
  getMediaThumbnail,
  mediaKindLabel,
} from "@/lib/utils/media-links";

/**
 * Toda la tarjeta es un solo <a> nativo (navegación completa).
 * El soft-nav de Next se sentía como “no pica” porque tarda con Sheets.
 */
export function WorkCard({
  publication,
  showAuthor = false,
}: {
  publication: Publication;
  showAuthor?: boolean;
}) {
  const category = getCategory(publication.primaryCategory);
  const primaryUrl = publication.media[0]?.url;
  const kind = primaryUrl ? detectMediaKind(primaryUrl) : "link";
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
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt=""
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(145deg, ${category.accent}33, #24374618 55%, #3968cc22)`,
            }}
          >
            <FileText className="h-7 w-7 text-oh-blue/65" />
          </div>
        )}

        <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {isVideo ? (
            <>
              <Play className="h-3 w-3 fill-white" />
              Video
            </>
          ) : (
            mediaKindLabel(kind)
          )}
        </span>
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
          Ver trabajo
        </span>
      </div>
    </a>
  );
}
