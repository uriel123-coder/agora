"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";

type Props = {
  /** URL del PDF (proxy Ágora o archivo público). */
  src: string;
  title: string;
  className?: string;
};

/**
 * Visor PDF propio con PDF.js: páginas como canvas, sin barra de Chrome/Google.
 */
export function AgoraPdfViewer({ src, title, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.15);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef<import("pdfjs-dist").PDFDocumentProxy | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPage(1);

    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        // Worker desde CDN con la misma versión (evita líos de bundler en Next)
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const loadingTask = pdfjs.getDocument({
          url: src,
          withCredentials: false,
        });
        const pdf = await loadingTask.promise;
        if (cancelled) {
          pdf.destroy();
          return;
        }
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch {
        if (!cancelled) {
          setError("No se pudo cargar el PDF. Ábrelo o descarga el archivo.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      pdfRef.current?.destroy();
      pdfRef.current = null;
    };
  }, [src]);

  useEffect(() => {
    const pdf = pdfRef.current;
    const canvas = canvasRef.current;
    if (!pdf || !canvas || loading || error) return;

    let cancelled = false;

    (async () => {
      try {
        const pdfPage = await pdf.getPage(page);
        if (cancelled) return;
        const viewport = pdfPage.getViewport({ scale });
        const context = canvas.getContext("2d");
        if (!context) return;

        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const transform =
          outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

        await pdfPage.render({
          canvasContext: context,
          viewport,
          canvas,
          transform,
        }).promise;
      } catch {
        if (!cancelled) setError("Error al dibujar la página.");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, scale, loading, error, numPages]);

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
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition hover:border-oh-blue hover:text-oh-blue disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Página siguiente"
            disabled={page >= numPages || loading}
            onClick={() => setPage((p) => Math.min(numPages, p + 1))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition hover:border-oh-blue hover:text-oh-blue disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Alejar"
            disabled={loading || scale <= 0.7}
            onClick={() => setScale((s) => Math.max(0.7, +(s - 0.15).toFixed(2)))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition hover:border-oh-blue hover:text-oh-blue disabled:opacity-40"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Acercar"
            disabled={loading || scale >= 2}
            onClick={() => setScale((s) => Math.min(2, +(s + 0.15).toFixed(2)))}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card transition hover:border-oh-blue hover:text-oh-blue disabled:opacity-40"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative flex max-h-[min(78vh,720px)] min-h-[320px] justify-center overflow-auto p-4 sm:p-6"
      >
        {loading ? (
          <div className="flex items-center gap-2 self-center text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Preparando vista…
          </div>
        ) : null}
        {error ? (
          <p className="self-center max-w-md text-center text-sm text-muted">
            {error}
          </p>
        ) : null}
        {!loading && !error ? (
          <canvas
            ref={canvasRef}
            className="max-w-full rounded-sm bg-white shadow-[0_8px_28px_rgba(36,55,70,0.12)]"
          />
        ) : null}
      </div>
    </div>
  );
}
