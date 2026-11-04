"use client";

import { useEffect, useMemo, useState } from "react";
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
  extractGoogleDocId,
  isGoogleWorkspaceUrl,
  isPdfUrl,
  mediaKindLabel,
  toAgoraPdfProxyUrl,
  toEmbeddablePdfUrl,
  toGoogleDownloadUrl,
  toGooglePreviewUrl,
  vimeoEmbedUrl,
  youtubeEmbedUrl,
  type MediaKind,
} from "@/lib/utils/media-links";

/** Panel de lectura Ágora: PDF, imagen, video (YouTube/Drive/mp4) o enlace. */
export function DocumentPanel({
  title,
  url,
  mediaType,
  mediaTitle,
}: {
  title: string;
  url: string;
  mediaType?: string;
  mediaTitle?: string;
}) {
  const baseKind = detectMediaKind(url, {
    mediaType,
    title: `${mediaTitle ?? ""} ${title}`,
  });
  const [kindOverride, setKindOverride] = useState<MediaKind | null>(null);
  const kind = kindOverride ?? baseKind;

  // Resolver mime de Drive (video vs pdf) antes de intentar PDF
  useEffect(() => {
    if (!isGoogleWorkspaceUrl(url)) return;
    if (
      baseKind === "youtube" ||
      baseKind === "vimeo" ||
      baseKind === "video" ||
      baseKind === "image" ||
      baseKind === "audio"
    ) {
      return;
    }
    const id = extractGoogleDocId(url);
    if (!id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/media/kind?id=${encodeURIComponent(id)}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { kind?: string };
        if (cancelled || !data.kind) return;
        if (data.kind === "video") setKindOverride("video");
        else if (data.kind === "image") setKindOverride("image");
        else if (data.kind === "audio") setKindOverride("audio");
        else if (data.kind === "pdf") setKindOverride("pdf");
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [baseKind, url]);

  const downloadUrl = toGoogleDownloadUrl(url) ?? url;
  const canPdf = Boolean(toEmbeddablePdfUrl(url));
  const directPublicPdf =
    isPdfUrl(url) &&
    !url.includes("drive.google.com") &&
    !url.includes("docs.google.com");
  const pdfSrc = useMemo(() => {
    if (!(kind === "pdf" || kind === "google-doc") || !canPdf) return null;
    return directPublicPdf ? url : toAgoraPdfProxyUrl(url);
  }, [canPdf, directPublicPdf, kind, url]);

  const yt = youtubeEmbedUrl(url);
  const vimeo = vimeoEmbedUrl(url);
  const driveId = extractGoogleDocId(url);
  const drivePreview = toGooglePreviewUrl(url);
  const isDriveFile = isGoogleWorkspaceUrl(url) && Boolean(driveId);
  const isDriveVideo = kind === "video" && isDriveFile;
  const isDirectVideo = kind === "video" && !yt && !vimeo && !isDriveVideo;

  const [pdfFailed, setPdfFailed] = useState(false);
  const showDriveFallback =
    pdfFailed && Boolean(drivePreview) && (baseKind === "pdf" || baseKind === "google-doc");

  const displayKind: MediaKind =
    showDriveFallback && kindOverride === "video"
      ? "video"
      : showDriveFallback
        ? "video"
        : kind;

  const Icon =
    displayKind === "image"
      ? ImageIcon
      : displayKind === "video" ||
          displayKind === "youtube" ||
          displayKind === "vimeo"
        ? Film
        : displayKind === "audio"
          ? Music
          : displayKind === "link"
            ? Link2
            : FileText;

  function handlePdfError() {
    setPdfFailed(true);
    // Si era un archivo de Drive “PDF” que no es PDF → casi seguro video/otro
    if (isDriveFile) {
      setKindOverride("video");
    }
  }

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_28px_rgba(36,55,70,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-card px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-oh-blue/10 text-oh-blue">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
              {mediaKindLabel(displayKind)}
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
          {(displayKind === "pdf" || displayKind === "google-doc") && (
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

      {/* Video YouTube / Vimeo */}
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

      {/* Video directo (mp4 / blob) */}
      {isDirectVideo ? (
        <div className="bg-black">
          <video
            src={url}
            controls
            playsInline
            preload="metadata"
            className="mx-auto max-h-[min(78vh,720px)] w-full"
          >
            Tu navegador no reproduce este video.
          </video>
        </div>
      ) : null}

      {/* Video en Google Drive (o fallback si no era PDF) */}
      {(isDriveVideo || showDriveFallback) && drivePreview ? (
        <div className="relative aspect-video bg-black">
          <iframe
            src={drivePreview}
            title={title}
            className="h-full w-full border-0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : null}

      {/* Imagen */}
      {displayKind === "image" ? (
        <div className="bg-oh-stone/40 p-4 dark:bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              isDriveFile && driveId
                ? `/api/media/thumb?id=${encodeURIComponent(driveId)}`
                : url
            }
            alt={title}
            className="mx-auto max-h-[min(78vh,720px)] w-auto max-w-full rounded-lg object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      ) : null}

      {/* PDF / Docs */}
      {pdfSrc && !pdfFailed ? (
        <AgoraPdfViewer
          src={pdfSrc}
          title={title}
          openHref={url}
          onError={handlePdfError}
        />
      ) : null}

      {displayKind === "audio" ? (
        <div className="px-5 py-8">
          <audio src={url} controls className="w-full" />
        </div>
      ) : null}

      {displayKind === "link" ||
      (!pdfSrc &&
        !yt &&
        !vimeo &&
        !isDirectVideo &&
        !isDriveVideo &&
        !showDriveFallback &&
        displayKind !== "image" &&
        displayKind !== "audio") ? (
        <EmptyOpen url={url} kind={displayKind} />
      ) : null}
    </section>
  );
}

function EmptyOpen({ url, kind }: { url: string; kind: MediaKind }) {
  return (
    <div
      className="flex flex-col items-start gap-3 px-5 py-8 sm:flex-row sm:items-center sm:justify-between"
      style={{
        background:
          "linear-gradient(120deg, rgba(57,104,204,0.1) 0%, rgba(36,55,70,0.05) 55%, rgba(57,104,204,0.08) 100%)",
      }}
    >
      <p className="max-w-md text-sm text-muted">
        {kind === "video"
          ? "No se pudo incrustar el video aquí. Ábrelo para reproducirlo."
          : "Abre el archivo original. Lo mejor: carpeta pública de Drive o subirlo en Admin."}
      </p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-oh-ink px-5 py-3 text-sm font-medium text-white transition hover:bg-oh-blue dark:bg-oh-blue"
      >
        <ExternalLink className="h-4 w-4" />
        Abrir {mediaKindLabel(kind).toLowerCase()}
      </a>
    </div>
  );
}
