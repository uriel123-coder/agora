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
  kindCanTryPdf,
  mapApiKindToMediaKind,
  mediaKindLabel,
  toAgoraPdfProxyUrl,
  toEmbeddablePdfUrl,
  toGoogleDownloadUrl,
  toGooglePreviewUrl,
  vimeoEmbedUrl,
  youtubeEmbedUrl,
  type MediaKind,
} from "@/lib/utils/media-links";

/** Panel de lectura: PDF, docx/Docs, imagen, video o enlace. */
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
  const isDriveFile = isGoogleWorkspaceUrl(url);
  const driveId = extractGoogleDocId(url);
  const drivePreview = toGooglePreviewUrl(url);

  const [kind, setKind] = useState<MediaKind>(baseKind);
  const [probed, setProbed] = useState(
    !(isDriveFile && driveId && (baseKind === "document" || baseKind === "pdf" || baseKind === "google-doc" || baseKind === "link")),
  );
  const [pdfFailed, setPdfFailed] = useState(false);

  useEffect(() => {
    setKind(baseKind);
    setPdfFailed(false);
    const needs =
      isDriveFile &&
      Boolean(driveId) &&
      (baseKind === "document" ||
        baseKind === "pdf" ||
        baseKind === "google-doc" ||
        baseKind === "link");
    setProbed(!needs);
  }, [baseKind, driveId, isDriveFile, url]);

  useEffect(() => {
    if (!isDriveFile || !driveId) return;
    if (
      baseKind === "youtube" ||
      baseKind === "vimeo" ||
      baseKind === "video" ||
      baseKind === "image" ||
      baseKind === "audio"
    ) {
      return;
    }
    let cancelled = false;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    (async () => {
      try {
        const res = await fetch(
          `/api/media/kind?id=${encodeURIComponent(driveId)}`,
          { signal: ctrl.signal },
        );
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { kind?: string };
        if (cancelled) return;
        const mapped = mapApiKindToMediaKind(data.kind);
        if (mapped) setKind(mapped);
      } catch {
        /* timeout / red: dejamos vista Drive */
      } finally {
        clearTimeout(timer);
        if (!cancelled) setProbed(true);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [baseKind, driveId, isDriveFile, url]);

  const downloadUrl = toGoogleDownloadUrl(url) ?? url;
  const canPdf = Boolean(toEmbeddablePdfUrl(url));
  const directPublicPdf =
    isPdfUrl(url) &&
    !url.includes("drive.google.com") &&
    !url.includes("docs.google.com");

  const tryPdf = probed && kindCanTryPdf(kind) && canPdf && !pdfFailed;
  const pdfSrc = useMemo(() => {
    if (!tryPdf) return null;
    return directPublicPdf ? url : toAgoraPdfProxyUrl(url);
  }, [directPublicPdf, tryPdf, url]);

  const yt = youtubeEmbedUrl(url);
  const vimeo = vimeoEmbedUrl(url);
  const isDriveVideo = kind === "video" && isDriveFile;
  const isDirectVideo = kind === "video" && !yt && !vimeo && !isDriveVideo;

  // Vista Drive para documentos / Office / mientras tipamos / si falló el PDF
  const showDocPreview =
    Boolean(drivePreview) &&
    !yt &&
    !vimeo &&
    !isDirectVideo &&
    !isDriveVideo &&
    kind !== "image" &&
    kind !== "audio" &&
    (kind === "document" ||
      kind === "google-doc" ||
      kind === "link" ||
      (pdfFailed && kindCanTryPdf(kind)) ||
      (!probed && isDriveFile));

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

  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_8px_28px_rgba(36,55,70,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 bg-card px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-oh-blue/10 text-oh-blue">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted">
              {!probed && isDriveFile ? "Archivo" : mediaKindLabel(kind)}
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
          {(kind === "pdf" ||
            kind === "google-doc" ||
            kind === "document" ||
            (!probed && isDriveFile)) && (
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

      {isDriveVideo && drivePreview ? (
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

      {kind === "image" ? (
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

      {pdfSrc ? (
        <AgoraPdfViewer
          src={pdfSrc}
          title={title}
          openHref={url}
          onError={() => setPdfFailed(true)}
        />
      ) : null}

      {showDocPreview && drivePreview && !pdfSrc ? (
        <div className="min-h-[50vh] bg-oh-stone/30">
          <iframe
            src={drivePreview}
            title={title}
            className="h-[min(72vh,720px)] w-full border-0"
            allow="autoplay"
          />
          <p className="border-t border-border px-4 py-2 text-center text-xs text-muted">
            Vista del documento. Si no carga, usa Abrir o Descargar (el archivo
            debe ser público en Drive).
          </p>
        </div>
      ) : null}

      {kind === "audio" ? (
        <div className="px-5 py-8">
          <audio src={url} controls className="w-full" />
        </div>
      ) : null}

      {!yt &&
      !vimeo &&
      !isDirectVideo &&
      !isDriveVideo &&
      !pdfSrc &&
      !showDocPreview &&
      kind !== "image" &&
      kind !== "audio" ? (
        <EmptyOpen url={url} kind={kind} />
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
          : "No hay vista previa. Abre el archivo (mejor si está en una carpeta pública de Drive)."}
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
