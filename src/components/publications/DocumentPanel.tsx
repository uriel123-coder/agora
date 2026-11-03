"use client";

import { useMemo } from "react";
import {
  Download,
  ExternalLink,
  FileText,
  Film,
  ImageIcon,
  Link2,
  Music,
} from "lucide-react";
import { AgoraPdfViewer } from "@/components/publications/AgoraPdfViewer";
import {
  detectMediaKind,
  isPdfUrl,
  mediaKindLabel,
  toAgoraPdfProxyUrl,
  toEmbeddablePdfUrl,
  toGoogleDownloadUrl,
  vimeoEmbedUrl,
  youtubeEmbedUrl,
} from "@/lib/utils/media-links";

/** Panel de lectura Ágora: PDF propio, imagen, video o enlace. */
export function DocumentPanel({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const kind = detectMediaKind(url);
  const downloadUrl = toGoogleDownloadUrl(url) ?? url;
  const canPdf = Boolean(toEmbeddablePdfUrl(url));
  const directPublicPdf = isPdfUrl(url) && !url.includes("drive.google.com") && !url.includes("docs.google.com");
  const pdfSrc = useMemo(() => {
    if (!(kind === "pdf" || kind === "google-doc") || !canPdf) return null;
    // PDFs ya públicos (Blob, CDN) se cargan directo; Drive pasa por proxy
    return directPublicPdf ? url : toAgoraPdfProxyUrl(url);
  }, [canPdf, directPublicPdf, kind, url]);

  const yt = youtubeEmbedUrl(url);
  const vimeo = vimeoEmbedUrl(url);

  const Icon =
    kind === "image"
      ? ImageIcon
      : kind === "video" || kind === "youtube" || kind === "vimeo"
        ? Film
        : kind === "audio"
          ? Music
          : kind === "link"
            ? Link2
            : FileText;

  const openHref =
    kind === "pdf" || kind === "google-doc"
      ? `/leer?url=${encodeURIComponent(url)}&titulo=${encodeURIComponent(title)}`
      : url;

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_28px_rgba(36,55,70,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-card px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-oh-blue/10 text-oh-blue">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
              {mediaKindLabel(kind)}
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
            className="inline-flex min-h-11 min-w-[6rem] items-center justify-center gap-1.5 rounded-lg bg-oh-blue px-4 py-2.5 text-sm font-medium text-white transition hover:bg-oh-blue-deep"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Abrir
          </a>
          {(kind === "pdf" || kind === "google-doc") && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 min-w-[6rem] items-center justify-center gap-1.5 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition hover:border-oh-blue hover:text-oh-blue"
            >
              <Download className="h-3.5 w-3.5" />
              Descargar
            </a>
          )}
        </div>
      </div>

      {pdfSrc ? (
        <AgoraPdfViewer src={pdfSrc} title={title} openHref={url} />
      ) : null}

      {kind === "image" ? (
        <div className="bg-oh-stone/40 p-4 dark:bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={title}
            className="mx-auto max-h-[min(78vh,720px)] w-auto max-w-full rounded-lg object-contain"
          />
        </div>
      ) : null}

      {kind === "video" ? (
        <div className="bg-black">
          <video src={url} controls className="mx-auto max-h-[min(78vh,720px)] w-full">
            Tu navegador no reproduce este video.
          </video>
        </div>
      ) : null}

      {yt || vimeo ? (
        <div className="aspect-video bg-black">
          <iframe
            src={yt || vimeo || ""}
            title={title}
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {kind === "audio" ? (
        <div className="px-5 py-8">
          <audio src={url} controls className="w-full" />
        </div>
      ) : null}

      {kind === "link" || (!pdfSrc && (kind === "google-doc" || kind === "pdf")) ? (
        <div
          className="flex flex-col items-start gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between"
          style={{
            background:
              "linear-gradient(120deg, rgba(57,104,204,0.1) 0%, rgba(36,55,70,0.05) 55%, rgba(57,104,204,0.08) 100%)",
          }}
        >
          <p className="max-w-md text-sm text-muted">
            Si el PDF no carga aquí, ábrelo con el botón. Lo mejor es una carpeta
            pública de Drive o subir el archivo en Admin.
          </p>
          <a
            href={openHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-oh-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-oh-blue dark:bg-oh-blue"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir recurso
          </a>
        </div>
      ) : null}
    </section>
  );
}
