import Link from "next/link";
import { Download, ExternalLink, FileText, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getCategory } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";
import {
  isGoogleWorkspaceUrl,
  toGoogleDownloadUrl,
  toGooglePreviewUrl,
} from "@/lib/utils/media-links";

export function WorkCard({
  publication,
  showAuthor = false,
}: {
  publication: Publication;
  showAuthor?: boolean;
}) {
  const category = getCategory(publication.primaryCategory);
  const primaryUrl = publication.media[0]?.url;
  const previewUrl = primaryUrl ? toGooglePreviewUrl(primaryUrl) : null;
  const downloadUrl = primaryUrl ? toGoogleDownloadUrl(primaryUrl) : null;
  const authors = publication.authors
    .filter((a) => a.nameVisible)
    .map((a) => a.displayName)
    .join(", ");

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-border bg-card shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-oh-blue/35 hover:shadow-md">
      <div className="relative aspect-[16/10] bg-[#e8ebf0] dark:bg-white/5">
        {previewUrl ? (
          <iframe
            title={`Vista previa: ${publication.title}`}
            src={previewUrl}
            className="absolute inset-0 h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : primaryUrl ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <Link2 className="h-8 w-8 text-oh-blue" />
            <p className="text-sm text-muted">Enlace externo</p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
            <FileText className="h-8 w-8 text-muted" />
            <p className="text-sm text-muted">Sin archivo</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{category.name}</Badge>
          {publication.schoolYear ? (
            <Badge tone="muted">{publication.schoolYear}</Badge>
          ) : null}
        </div>
        <h3 className="font-display text-lg leading-snug text-oh-ink dark:text-foreground">
          <Link
            href={`/publicacion/${publication.slug}`}
            className="hover:text-oh-blue"
          >
            {publication.title}
          </Link>
        </h3>
        {showAuthor && authors ? (
          <p className="text-sm text-muted">{authors}</p>
        ) : null}
        <p className="line-clamp-2 text-sm text-muted">{publication.summary}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-3 text-sm">
          <Link
            href={`/publicacion/${publication.slug}`}
            className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 hover:border-oh-blue hover:text-oh-blue"
          >
            Ver ficha
          </Link>
          {primaryUrl ? (
            <a
              href={primaryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm border border-border px-2.5 py-1.5 hover:border-oh-blue hover:text-oh-blue"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir
            </a>
          ) : null}
          {downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm bg-oh-blue px-2.5 py-1.5 text-white hover:bg-oh-blue-deep"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </a>
          ) : primaryUrl && !isGoogleWorkspaceUrl(primaryUrl) ? (
            <a
              href={primaryUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-sm bg-oh-blue px-2.5 py-1.5 text-white hover:bg-oh-blue-deep"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
