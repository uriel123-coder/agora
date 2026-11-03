"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { detectMediaKind, mediaKindLabel } from "@/lib/utils/media-links";

export function SheetRowEditor({
  tabTitle,
  rowNumber,
  initial,
  mode = "update",
}: {
  tabTitle: string;
  rowNumber?: number;
  initial?: { autor: string; tema: string; anio: string; enlace: string };
  mode?: "update" | "append";
}) {
  const router = useRouter();
  const [autor, setAutor] = useState(initial?.autor ?? "");
  const [tema, setTema] = useState(initial?.tema ?? "");
  const [anio, setAnio] = useState(initial?.anio ?? "");
  const [enlace, setEnlace] = useState(initial?.enlace ?? "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const kindHint = useMemo(
    () => (enlace.trim() ? mediaKindLabel(detectMediaKind(enlace.trim())) : null),
    [enlace],
  );

  async function save() {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/sheets/row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: mode,
          tabTitle,
          rowNumber,
          autor,
          tema,
          anio,
          enlace,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Error al guardar");
        return;
      }
      setStatus("Guardado en Sheets");
      if (mode === "append") {
        setAutor("");
        setTema("");
        setAnio("");
        setEnlace("");
      }
      router.refresh();
    } catch {
      setStatus("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function removeRow() {
    if (!rowNumber || mode !== "update") return;
    if (
      !window.confirm(
        `¿Quitar la fila ${rowNumber} de «${tabTitle}» en Sheets? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/admin/sheets/row", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          tabTitle,
          rowNumber,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Error al borrar");
        return;
      }
      setStatus("Fila eliminada");
      router.refresh();
    } catch {
      setStatus("Error de red");
    } finally {
      setLoading(false);
    }
  }

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setStatus("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(
          data.error ||
            "No se pudo subir. Configura Vercel Blob (BLOB_READ_WRITE_TOKEN) o pega un enlace público.",
        );
        return;
      }
      setEnlace(data.url as string);
      setStatus("Archivo subido a carpeta pública de Ágora");
    } catch {
      setStatus("Error al subir");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs">
          Autor
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
          />
        </label>
        <label className="text-xs">
          Tema / Género
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
          />
        </label>
        <label className="text-xs">
          Año
          <input
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
          />
        </label>
        <label className="text-xs">
          Enlace (PDF, Drive público, imagen, video, YouTube…)
          <input
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-2 py-2 text-sm"
            placeholder="https://…"
          />
          {kindHint ? (
            <span className="mt-1 inline-block text-[10px] uppercase tracking-wide text-oh-blue">
              Detectado: {kindHint}
            </span>
          ) : null}
        </label>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-oh-stone/30 px-3 py-2 text-xs text-muted dark:bg-white/[0.03]">
        <p className="font-medium text-oh-ink dark:text-foreground">
          Carpeta pública (recomendado para vista previa limpia)
        </p>
        <p className="mt-1">
          Sube PDF/imagen/video aquí y Ágora guarda un enlace público. Si usas
          Drive, el archivo debe estar en «Cualquiera con el enlace».
        </p>
        <label className="mt-2 inline-flex min-h-9 cursor-pointer items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium transition hover:border-oh-blue hover:text-oh-blue">
          {uploading ? "Subiendo…" : "Subir archivo a Ágora"}
          <input
            type="file"
            className="sr-only"
            accept="application/pdf,image/*,video/*,audio/*"
            disabled={uploading || loading}
            onChange={(e) => onUpload(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={save} disabled={loading || uploading}>
          {loading
            ? "Guardando…"
            : mode === "append"
              ? "Agregar a Sheets"
              : "Actualizar en Sheets"}
        </Button>
        {mode === "update" && rowNumber ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={removeRow}
            disabled={loading}
          >
            Quitar de Sheets
          </Button>
        ) : null}
        {status ? <span className="text-xs text-muted">{status}</span> : null}
      </div>
    </div>
  );
}
