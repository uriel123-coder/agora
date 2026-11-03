"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

type Props = {
  /** URL del PDF (proxy Ágora o archivo público directo). */
  src: string;
  title: string;
  openHref?: string;
  className?: string;
};

/**
 * Visor PDF propio con PDF.js: sin barra de Chrome/Google.
 */
export function AgoraPdfViewer({ src, title, openHref, className }: Props) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(0); // fuerza re-render al montar canvas

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);
    setNumPages(0);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        // Traer bytes nosotros: más fiable que pasar la URL al worker
        const res = await fetch(src);
        if (!res.ok) {
          const msg = await res.json().catch(() => null);
          throw new Error(
            (msg && typeof msg.error === "string" && msg.error) ||
              `No disponible (${res.status})`,
          );
        }
        const data = new Uint8Array(await res.arrayBuffer());
        if (data.byteLength < 5 || String.fromCharCode(...data.slice(0, 4)) !== "%PDF") {
          throw new Error(
            "El archivo no es un PDF público. Compártelo o súbelo en Admin.",
          );
        }

        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled) {
          void pdf.cleanup();
          return;
        }
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
        setReady((n) => n + 1);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el PDF.",
          );
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      void pdfRef.current?.cleanup();
      pdfRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas || loading || error) return;

    let cancelled = false;
    let renderTask: { cancel: () => void } | null = null;

    (async () => {
      try {
        const pdfPage = await pdf.getPage(page);
        if (cancelled) return;
        const viewport = pdfPage.getViewport({ scale });
        const context = canvas.getContext("2d");
        if (!context) return;

        const outputScale = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        const task = pdfPage.render({
          canvasContext: context,
          viewport,
          canvas,
          transform,
        });
        renderTask = task;
        await task.promise;
      } catch {
        if (!cancelled) {
          // cancelación normal al cambiar página
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        renderTask?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [page, scale, loading, error, numPages, ready]);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-b-2xl bg-[#eef1f5] dark:bg-black/30 ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-card/90 px-3 py-2">
        <p className="truncate text-xs text-muted" title={title}>
          {loading
            ? "Cargando…"
            : numPages
              ? `Página ${page} de ${numPages}`
              : "Documento"}
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition hover:border-oh-blue hover:text-oh-blue disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={page >= numPages || loading}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition hover:border-oh-blue hover:text-oh-blue disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Alejar"
            disabled={loading || scale <= 0.7}
            onClick={() => setScale((s) => Math.max(0.7, +(s - 0.15).toFixed(2)))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition hover:border-oh-blue hover:text-oh-blue disabled:opacity-40"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Acercar"
            disabled={loading || scale >= 2}
            onClick={() => setScale((s) => Math.min(2, +(s + 0.15).toFixed(2)))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition hover:border-oh-blue hover:text-oh-blue disabled:opacity-40"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative flex max-h-[min(78vh,720px)] min-h-[320px] justify-center overflow-auto p-4 sm:p-6">
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-[#eef1f5]/80 text-sm text-muted dark:bg-black/40">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparando vista…
          </div>
        ) : null}
        {error ? (
          <div className="flex max-w-md flex-col items-center gap-3 self-center text-center">
            <p className="text-sm text-muted">{error}</p>
            {openHref ? (
              <a
                href={openHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-oh-blue px-4 py-2.5 text-sm font-medium text-white"
              >
                <ExternalLink className="h-4 w-4" />
                Abrir archivo
              </a>
            ) : null}
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            className={`max-w-full rounded-sm bg-white shadow-[0_8px_28px_rgba(36,55,70,0.12)] ${loading ? "opacity-0" : ""}`}
          />
        )}
      </div>
    </div>
  );
}
