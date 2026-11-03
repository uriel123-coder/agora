import Link from "next/link";
import { Download, ExternalLink, FileText } from "lucide-react";
import { getCategory } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";
import {
  detectMediaKind,
  mediaKindLabel,
  toEmbeddablePdfUrl,
  toGoogleDownloadUrl,
} from "@/lib/utils/media-links";

/** Tarjeta compacta: zona de click completa + acciones claras. */
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
  const canPdf = primaryUrl ? Boolean(toEmbeddablePdfUrl(primaryUrl)) : false;
  const openUrl =
    primaryUrl && canPdf && (kind === "pdf" || kind === "google-doc")
      ? `/leer?url=${encodeURIComponent(primaryUrl)}&titulo=${encodeURIComponent(publication.title)}`
      : primaryUrl;
  const downloadUrl = primaryUrl ? toGoogleDownloadUrl(primaryUrl) : null;
  const authors = publication.authors
    .filter((a) => a.nameVisible)
    .map((a) => a.displayName)
    .join(", ");
  const detailHref = `/publicacion/${publication.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition duration-300 hover:-translate-y-0.5 hover:border-oh-blue/35 hover:shadow-[0_8px_22px_rgba(36,55,70,0.08)]">
      {/* Capa clickable de toda la tarjeta (debajo de botones) */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-0 rounded-2xl"
        aria-label={`Ver ${publication.title}`}
      />

      <div
        className="pointer-events-none relative z-[1] flex h-[68px] items-center gap-2.5 px-3 sm:h-[72px]"
        style={{
          background: `linear-gradient(135deg, ${category.accent}18 0%, #2437460f 55%, #3968cc14 100%)`,
        }}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/90 text-oh-blue shadow-sm dark:bg-white/10">
          <FileText className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-oh-ink/50 dark:text-white/50">
            {category.name}
            {publication.schoolYear ? ` · ${publication.schoolYear}` : ""}
            {primaryUrl ? ` · ${mediaKindLabel(kind)}` : ""}
          </p>
          <p className="mt-0.5 line-clamp-2 font-display text-[0.82rem] leading-snug text-oh-ink transition group-hover:text-oh-blue dark:text-foreground">
            {publication.title}
          </p>
        </div>
      </div>

      <div className="relative z-[1] flex flex-1 flex-col gap-1 px-3 pb-2.5 pt-2">
        {showAuthor && authors ? (
          <p className="pointer-events-none truncate text-[11px] text-muted">
            {authors}
          </p>
        ) : null}
        <p className="pointer-events-none line-clamp-2 text-[11px] leading-relaxed text-muted">
          {publication.summary}
        </p>
        <div className="relative z-10 mt-auto flex flex-wrap gap-1.5 pt-1.5">
          <Link
            href={detailHref}
            className="inline-flex min-h-8 items-center rounded-lg bg-oh-ink px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-oh-blue dark:bg-oh-blue"
          >
            Ver
          </Link>
          {openUrl ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] transition hover:border-oh-blue hover:text-oh-blue"
            >
              <ExternalLink className="h-3 w-3" />
              Abrir
            </a>
          ) : null}
          {downloadUrl && (kind === "pdf" || kind === "google-doc") ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-[11px] transition hover:border-oh-blue hover:text-oh-blue"
            >
              <Download className="h-3 w-3" />
              PDF
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
