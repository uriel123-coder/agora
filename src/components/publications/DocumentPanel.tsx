"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink, FileText } from "lucide-react";
import {
  isGoogleWorkspaceUrl,
  toEmbeddablePdfUrl,
  toGoogleDownloadUrl,
} from "@/lib/utils/media-links";

/** Visor propio de Ágora: PDF embebido sin UI ni login de Google. */
export function DocumentPanel({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const downloadUrl = toGoogleDownloadUrl(url) ?? url;
  const canEmbed = Boolean(toEmbeddablePdfUrl(url));
  const viewerSrc = useMemo(
    () => (canEmbed ? `/api/doc-pdf?url=${encodeURIComponent(url)}` : null),
    [canEmbed, url],
  );
  const [failed, setFailed] = useState(false);

  const kind = isGoogleWorkspaceUrl(url)
    ? "Documento"
    : url.match(/\.pdf(\?|$)/i)
      ? "PDF"
      : "Archivo";

  const showViewer = Boolean(viewerSrc) && !failed;

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_28px_rgba(36,55,70,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-oh-blue/10 text-oh-blue">
            <FileText className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
              {kind}
            </p>
            <h2 className="truncate font-display text-base text-oh-ink dark:text-foreground sm:text-lg">
              {title}
            </h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-oh-blue px-3 py-1.5 text-xs font-medium text-white transition hover:bg-oh-blue-deep"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir
          </a>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 text-xs font-medium transition hover:border-oh-blue hover:text-oh-blue sm:py-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            PDF
          </a>
        </div>
      </div>

      {showViewer ? (
        <div className="relative bg-oh-stone/40 dark:bg-black/20">
          <iframe
            src={`${viewerSrc}#toolbar=1&navpanes=0`}
            title={title}
            className="h-[min(72vh,640px)] w-full border-0"
            onError={() => setFailed(true)}
          />
          <div className="absolute bottom-3 right-3">
            <button
              type="button"
              onClick={() => setFailed(true)}
              className="rounded-lg bg-white/90 px-2.5 py-1 text-[10px] text-muted shadow-sm backdrop-blur hover:text-oh-ink dark:bg-black/50"
            >
              ¿No se ve? Abrir afuera
            </button>
          </div>
        </div>
      ) : (
        <div
          className="flex flex-col items-start gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background:
              "linear-gradient(120deg, rgba(57,104,204,0.1) 0%, rgba(36,55,70,0.05) 55%, rgba(57,104,204,0.08) 100%)",
          }}
        >
          <p className="max-w-md text-sm text-muted">
            Lee el trabajo en el archivo original. Aquí no pedimos cuenta de
            Google ni permisos.
          </p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-oh-ink px-4 py-2.5 text-sm font-medium text-white transition hover:bg-oh-blue dark:bg-oh-blue"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir documento
          </a>
        </div>
      )}
    </section>
  );
}
