import { WorkCardMedia } from "@/components/publications/WorkCardMedia";
import { getCategory } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";
import {
  detectMediaKind,
  getMediaThumbnail,
} from "@/lib/utils/media-links";

/**
 * Toda la tarjeta es un solo <a> nativo.
 * Miniatura vía proxy Ágora + fallback si falla.
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
  const kind = primaryUrl
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
        <WorkCardMedia
          src={thumb}
          accent={category.accent}
          kind={kind}
          mediaUrl={primaryUrl}
        />
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
