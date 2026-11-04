import Image from "next/image";
import Link from "next/link";
import { ExternalLink, FileText, Play } from "lucide-react";
import { getCategory } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";
import {
  detectMediaKind,
  getMediaThumbnail,
  mediaKindLabel,
  toEmbeddablePdfUrl,
} from "@/lib/utils/media-links";

function isRemoteThumb(src: string) {
  return /^https?:\/\//i.test(src);
}

/** Tarjeta con portada de imagen/video y zona de click completa. */
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
  const canPdf = primaryUrl ? Boolean(toEmbeddablePdfUrl(primaryUrl)) : false;
  const openUrl =
    primaryUrl && canPdf && (kind === "pdf" || kind === "google-doc")
      ? `/leer?url=${encodeURIComponent(primaryUrl)}&titulo=${encodeURIComponent(publication.title)}`
      : primaryUrl;
  const authors = publication.authors
    .filter((a) => a.nameVisible)
    .map((a) => a.displayName)
    .join(", ");
  const detailHref = `/publicacion/${publication.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_0_rgba(36,55,70,0.06)] ring-1 ring-border/70 transition hover:ring-oh-blue/35">
      <Link
        href={detailHref}
        className="relative block aspect-[16/10] overflow-hidden bg-oh-stone touch-manipulation"
      >
        {thumb ? (
          isRemoteThumb(thumb) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumb}
              alt=""
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              loading="lazy"
            />
          ) : (
            <Image
              src={thumb}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width:640px) 50vw, 25vw"
            />
          )
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(145deg, ${category.accent}33, #24374622 55%, #3968cc22)`,
            }}
          >
            <FileText className="h-8 w-8 text-oh-blue/70" />
          </div>
        )}

        {isVideo ? (
          <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            <Play className="h-3 w-3 fill-white" />
            Video
          </span>
        ) : (
          <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white/95 backdrop-blur-sm">
            {mediaKindLabel(kind)}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <Link href={detailHref} className="touch-manipulation outline-none">
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
        </Link>

        <div className="mt-auto flex gap-2 pt-3">
          <Link
            href={detailHref}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-oh-ink px-3 text-sm font-medium text-white touch-manipulation transition hover:bg-oh-blue dark:bg-oh-blue"
          >
            Ver
          </Link>
          {openUrl ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 text-sm touch-manipulation transition hover:border-oh-blue hover:text-oh-blue"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
