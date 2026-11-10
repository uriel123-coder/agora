"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

type Report = {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  score: number;
  commentCount: number;
  pinned: boolean;
  locked: boolean;
  authorName: string;
};

export function ForumModerationPanel({
  reports,
  posts,
}: {
  reports: Report[];
  posts: PostRow[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function moderate(body: Record<string, unknown>, key: string) {
    setBusy(key);
    setMessage("");
    try {
      const res = await fetch("/api/forum/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setMessage(data.error || "No se pudo completar la acción");
        return;
      }
      setMessage("Listo");
      router.refresh();
    } catch {
      setMessage("Error de red");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-10">
      {message ? (
        <p className="text-sm text-oh-blue">{message}</p>
      ) : null}

      <section>
        <h2 className="font-display text-2xl">Reportes abiertos</h2>
        <p className="mt-1 text-sm text-muted">
          Si alguien escribe algo raro o ofensivo, aquí puedes borrarlo o
          descartar el reporte.
        </p>
        {reports.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No hay reportes abiertos.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {reports.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-border bg-card p-4 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge>{r.targetType}</Badge>
                  <span className="text-muted">
                    {new Date(r.createdAt).toLocaleString("es-MX")}
                  </span>
                </div>
                <p className="mt-2">{r.reason}</p>
                <p className="mt-1 text-xs text-muted">ID: {r.targetId}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={busy === r.id}
                    onClick={() =>
                      moderate(
                        { reportId: r.id, reportAction: "dismiss" },
                        r.id,
                      )
                    }
                  >
                    Descartar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={busy === r.id}
                    onClick={() => {
                      if (
                        !window.confirm(
                          "¿Borrar el contenido reportado y cerrar el reporte?",
                        )
                      ) {
                        return;
                      }
                      void moderate(
                        { reportId: r.id, reportAction: "delete" },
                        r.id,
                      );
                    }}
                  >
                    Borrar contenido
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl">Debates recientes</h2>
        <p className="mt-1 text-sm text-muted">
          Puedes eliminar cualquier publicación del foro desde aquí.
        </p>
        <ul className="mt-3 space-y-2">
          {posts.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <a
                href={`/ideas-en-dialogo/${p.slug}`}
                className="min-w-0 flex-1 font-medium text-oh-blue hover:underline"
              >
                {p.title}
              </a>
              {p.pinned ? <Badge tone="gold">Fijado</Badge> : null}
              {p.locked ? <Badge tone="muted">Cerrado</Badge> : null}
              <span className="text-muted">
                {p.authorName} · {p.score} pts · {p.commentCount} com.
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={busy === p.id}
                onClick={() => {
                  if (!window.confirm(`¿Eliminar «${p.title}»?`)) return;
                  void moderate({ deletePostId: p.id }, p.id);
                }}
              >
                Eliminar
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
