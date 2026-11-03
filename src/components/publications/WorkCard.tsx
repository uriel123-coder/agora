import Link from "next/link";
import { ArrowUpRight, Download, FileText } from "lucide-react";
import { getCategory } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";
import {
  isGoogleWorkspaceUrl,
  toGoogleDownloadUrl,
} from "@/lib/utils/media-links";

/** Tarjeta compacta: sin iframe de Google, forma suave y tamaño chico. */
export function WorkCard({
  publication,
  showAuthor = false,
}: {
  publication: Publication;
  showAuthor?: boolean;
}) {
  const category = getCategory(publication.primaryCategory);
  const primaryUrl = publication.media[0]?.url;
  const downloadUrl = primaryUrl ? toGoogleDownloadUrl(primaryUrl) : null;
  const authors = publication.authors
    .filter((a) => a.nameVisible)
    .map((a) => a.displayName)
    .join(", ");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition duration-300 hover:-translate-y-0.5 hover:border-oh-blue/35 hover:shadow-[0_8px_22px_rgba(36,55,70,0.08)]">
      <Link
        href={`/publicacion/${publication.slug}`}
        className="relative block overflow-hidden"
      >
        <div
          className="flex h-[68px] items-center gap-2.5 px-3 sm:h-[72px]"
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
            </p>
            <p className="mt-0.5 line-clamp-2 font-display text-[0.82rem] leading-snug text-oh-ink transition group-hover:text-oh-blue dark:text-foreground">
              {publication.title}
            </p>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-oh-blue opacity-0 transition group-hover:opacity-100" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 px-3 pb-2.5 pt-2">
        {showAuthor && authors ? (
          <p className="truncate text-[11px] text-muted">{authors}</p>
        ) : null}
        <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">
          {publication.summary}
        </p>
        <div className="mt-auto flex flex-wrap gap-1 pt-1.5">
          <Link
            href={`/publicacion/${publication.slug}`}
            className="rounded-lg bg-oh-ink px-2 py-0.5 text-[10px] font-medium text-white transition hover:bg-oh-blue dark:bg-oh-blue"
          >
            Ver
          </Link>
          {primaryUrl ? (
            <a
              href={primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-2 py-0.5 text-[10px] transition hover:border-oh-blue hover:text-oh-blue"
            >
              Abrir
            </a>
          ) : null}
          {downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 rounded-lg border border-border px-2 py-0.5 text-[10px] transition hover:border-oh-blue hover:text-oh-blue"
            >
              <Download className="h-2.5 w-2.5" />
              PDF
            </a>
          ) : primaryUrl && !isGoogleWorkspaceUrl(primaryUrl) ? (
            <a
              href={primaryUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 rounded-lg border border-border px-2 py-0.5 text-[10px] transition hover:border-oh-blue hover:text-oh-blue"
            >
              <Download className="h-2.5 w-2.5" />
              Bajar
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
