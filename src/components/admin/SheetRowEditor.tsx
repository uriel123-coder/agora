"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { detectMediaKind, mediaKindLabel } from "@/lib/utils/media-links";

export function SheetRowEditor({
  tabTitle,
  rowNumber,
  initial,
  mode = "update",
  temaLabel = "Tema",
  compact = false,
}: {
  tabTitle: string;
  rowNumber?: number;
  initial?: { autor: string; tema: string; anio: string; enlace: string };
  mode?: "update" | "append";
  temaLabel?: string;
  compact?: boolean;
}) {
  const [autor, setAutor] = useState(initial?.autor ?? "");
  const [tema, setTema] = useState(initial?.tema ?? "");
  const [anio, setAnio] = useState(initial?.anio ?? "");
  const [enlace, setEnlace] = useState(initial?.enlace ?? "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(mode === "append" || !compact);

  const kindHint = useMemo(
    () =>
      enlace.trim()
        ? mediaKindLabel(
            detectMediaKind(enlace.trim(), {
              title: tema,
            }),
          )
        : null,
    [enlace, tema],
  );

  const dirty =
    mode === "append" ||
    autor !== (initial?.autor ?? "") ||
    tema !== (initial?.tema ?? "") ||
    anio !== (initial?.anio ?? "") ||
    enlace !== (initial?.enlace ?? "");

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
      const text = await res.text();
      let data: { error?: string } = {};
      try {
        data = JSON.parse(text) as { error?: string };
      } catch {
        setStatus(`Error del servidor (${res.status})`);
        return;
      }
      if (!res.ok) {
        setStatus(data.error || "Error al guardar");
        return;
      }
      setStatus("Guardado");
      if (mode === "append") {
        setAutor("");
        setTema("");
        setAnio("");
        setEnlace("");
      }
      window.location.reload();
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
        `¿Quitar la fila ${rowNumber} de «${tabTitle}»? No se puede deshacer.`,
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
      const text = await res.text();
      let data: { error?: string } = {};
      try {
        data = JSON.parse(text) as { error?: string };
      } catch {
        setStatus(`Error del servidor (${res.status})`);
        return;
      }
      if (!res.ok) {
        setStatus(data.error || "Error al borrar");
        return;
      }
      window.location.reload();
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
            "No se pudo subir. Configura Blob o pega un enlace público.",
        );
        return;
      }
      setEnlace(data.url as string);
      setStatus("Archivo listo — pulsa Guardar");
      setOpen(true);
    } catch {
      setStatus("Error al subir");
    } finally {
      setUploading(false);
    }
  }

  const fieldClass =
    "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-oh-blue";

  return (
    <div
      className={`space-y-3 rounded-2xl border border-border/80 bg-card ${compact ? "p-3" : "p-4"}`}
    >
      {compact && mode === "update" ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-sm font-medium text-oh-blue hover:underline"
            style={{ touchAction: "manipulation" }}
          >
            {open ? "Ocultar edición" : "Editar / corregir"}
          </button>
          {dirty && open ? (
            <span className="text-[11px] text-amber-700 dark:text-amber-300">
              Cambios sin guardar
            </span>
          ) : null}
        </div>
      ) : null}

      {open ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-muted">
              Autor
              <input
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                className={fieldClass}
                placeholder="Nombre del alumno o docente"
              />
            </label>
            <label className="text-xs font-medium text-muted">
              {temaLabel}
              <input
                value={tema}
                onChange={(e) => setTema(e.target.value)}
                className={fieldClass}
                placeholder={`Corrige el ${temaLabel.toLowerCase()} si hace falta`}
              />
            </label>
            <label className="text-xs font-medium text-muted">
              Año
              <input
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                className={fieldClass}
                placeholder="2026"
              />
            </label>
            <label className="text-xs font-medium text-muted">
              Enlace (PDF, Drive, imagen, video, YouTube…)
              <input
                value={enlace}
                onChange={(e) => setEnlace(e.target.value)}
                className={fieldClass}
                placeholder="https://…"
              />
              {kindHint ? (
                <span className="mt-1 inline-block text-[10px] uppercase tracking-wide text-oh-blue">
                  Tipo: {kindHint}
                </span>
              ) : null}
              <span className="mt-1 block text-[11px] font-normal text-muted">
                Ideal: PDF o Google Doc. También vale Word (docx), PowerPoint,
                etc. (vista Drive). Si es video, pon «video» en{" "}
                {temaLabel.toLowerCase()} o `video::https://…`.
              </span>
            </label>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-oh-stone/30 px-3 py-2.5 text-xs text-muted dark:bg-white/[0.03]">
            <p className="font-medium text-oh-ink dark:text-foreground">
              Archivo público (opcional)
            </p>
            <p className="mt-1">
              Sube PDF/imagen/video para vista limpia, o pega un enlace de Drive
              público.
            </p>
            <label className="mt-2 inline-flex min-h-10 cursor-pointer items-center rounded-xl border border-border bg-card px-3 py-2 text-xs font-medium transition hover:border-oh-blue hover:text-oh-blue">
              {uploading ? "Subiendo…" : "Subir archivo"}
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
            <Button
              type="button"
              size="sm"
              onClick={save}
              disabled={loading || uploading || !autor.trim() || !tema.trim()}
            >
              {loading
                ? "Guardando…"
                : mode === "append"
                  ? "Agregar trabajo"
                  : "Guardar cambios"}
            </Button>
            {mode === "update" && rowNumber ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={removeRow}
                disabled={loading}
              >
                Quitar
              </Button>
            ) : null}
            {status ? (
              <span
                className={`text-xs ${status.toLowerCase().includes("error") || status.toLowerCase().includes("sin permiso") ? "text-amber-700 dark:text-amber-300" : "text-muted"}`}
              >
                {status}
              </span>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}
