"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

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

  return (
    <div className="space-y-2 rounded-md border border-border bg-card p-3">
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs">
          Autor
          <input
            value={autor}
            onChange={(e) => setAutor(e.target.value)}
            className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          Tema / Género
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          Año
          <input
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
        <label className="text-xs">
          Enlace
          <input
            value={enlace}
            onChange={(e) => setEnlace(e.target.value)}
            className="mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm"
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={save} disabled={loading}>
          {loading
            ? "Guardando…"
            : mode === "append"
              ? "Agregar a Sheets"
              : "Actualizar en Sheets"}
        </Button>
        {status ? <span className="text-xs text-muted">{status}</span> : null}
      </div>
    </div>
  );
}
