"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function RefreshSheetsButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function refresh() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/sheets/refresh", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "No se pudo actualizar");
        return;
      }
      setMessage(
        `Listo: ${data.publications} publicaciones · ${data.timelineEvents} eventos de cronología`,
      );
      router.refresh();
    } catch {
      setMessage("Error de red al actualizar Sheets");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
