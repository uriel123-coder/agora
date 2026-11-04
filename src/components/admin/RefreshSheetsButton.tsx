"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RefreshSheetsButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function refresh() {
    setLoading(true);
    setMessage("");
    setIsError(false);
    try {
      const res = await fetch("/api/admin/sheets/refresh", { method: "POST" });
      const text = await res.text();
      let data: {
        error?: string;
        warning?: string | null;
        publications?: number;
        timelineEvents?: number;
        publicationSources?: string[];
      } = {};
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        setIsError(true);
        setMessage(
          res.ok
            ? "Respuesta inválida del servidor"
            : `Error del servidor (${res.status}). Intenta de nuevo.`,
        );
        return;
      }

      if (!res.ok) {
        setIsError(true);
        setMessage(data.error || "No se pudo actualizar");
        return;
      }

      const sources =
        data.publicationSources && data.publicationSources.length
          ? ` · ${data.publicationSources.join(", ")}`
          : "";
      setIsError(Boolean(data.warning));
      setMessage(
        data.warning
          ? `Parcial: ${data.publications ?? 0} trabajos · ${data.timelineEvents ?? 0} eventos. ${data.warning}`
          : `Listo: ${data.publications ?? 0} trabajos · ${data.timelineEvents ?? 0} eventos${sources}`,
      );
      window.location.reload();
    } catch {
      setIsError(true);
      setMessage("Error de red al actualizar Sheets");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:items-start">
      <Button
        type="button"
        onClick={refresh}
        disabled={loading}
        variant="secondary"
        size="sm"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Actualizando…" : "Actualizar desde Sheets"}
      </Button>
      {message ? (
        <p
          className={`max-w-xl text-sm ${isError ? "text-amber-700 dark:text-amber-300" : "text-muted"}`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
