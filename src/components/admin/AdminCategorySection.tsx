"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, Plus } from "lucide-react";
import { SheetRowEditor } from "@/components/admin/SheetRowEditor";
import { Badge } from "@/components/ui/Badge";
import type { Publication } from "@/lib/types/content";

type Row = {
  publication: Publication;
  autor: string;
  tema: string;
  anio: string;
  enlace: string;
  editable: boolean;
};

export function AdminCategorySection({
  id,
  name,
  accent,
  tabTitle,
  temaLabel,
  rows,
  defaultOpen = false,
}: {
  id: string;
  name: string;
  accent: string;
  tabTitle: string;
  temaLabel: string;
  rows: Row[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [showAdd, setShowAdd] = useState(rows.length === 0);

  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_0_rgba(36,55,70,0.04)]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left transition hover:bg-oh-stone/40 sm:px-5 dark:hover:bg-white/[0.03]"
        style={{ touchAction: "manipulation" }}
      >
        <span
          className="h-10 w-1.5 shrink-0 rounded-full"
          style={{ background: accent }}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-oh-ink dark:text-foreground sm:text-2xl">
            {name}
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {rows.length} trabajo{rows.length === 1 ? "" : "s"}
            {tabTitle ? ` · pestaña «${tabTitle}»` : ""}
          </p>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="space-y-4 border-t border-border px-4 py-4 sm:px-5 sm:py-5">
          {rows.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
              Aún no hay trabajos en esta categoría. Agrégalos abajo.
            </p>
          ) : (
            <ul className="space-y-3">
              {rows.map((row) => (
                <li
                  key={row.publication.id}
                  className="rounded-2xl border border-border/80 bg-background/60 p-3 sm:p-4"
                >
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2">
                        {row.anio ? <Badge tone="muted">{row.anio}</Badge> : null}
                        {row.publication.sheetsRowNumber ? (
                          <Badge tone="muted">
                            fila {row.publication.sheetsRowNumber}
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="mt-2 font-display text-lg leading-snug text-oh-ink dark:text-foreground">
                        {row.tema || row.publication.title}
                      </h3>
                      <p className="mt-1 text-sm text-muted">
                        {row.autor || "Sin autor visible"}
                      </p>
                    </div>
                    <a
                      href={`/publicacion/${row.publication.slug}`}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border px-3 text-sm text-oh-blue transition hover:border-oh-blue"
                      style={{ touchAction: "manipulation" }}
                    >
                      Ver ficha
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>

                  {row.editable ? (
                    <SheetRowEditor
                      compact
                      tabTitle={tabTitle}
                      rowNumber={row.publication.sheetsRowNumber}
                      temaLabel={temaLabel}
                      initial={{
                        autor: row.autor,
                        tema: row.tema,
                        anio: row.anio,
                        enlace: row.enlace,
                      }}
                    />
                  ) : (
                    <p className="text-xs text-muted">
                      Esta entrada no tiene fila editable en Sheets.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border pt-4">
            <button
              type="button"
              onClick={() => setShowAdd((v) => !v)}
              className="mb-3 inline-flex min-h-10 items-center gap-2 text-sm font-medium text-oh-blue hover:underline"
              style={{ touchAction: "manipulation" }}
            >
              <Plus className="h-4 w-4" />
              {showAdd ? "Ocultar formulario" : `Agregar a ${name}`}
            </button>
            {showAdd ? (
              <div>
                <p className="mb-2 text-sm text-muted">
                  Nuevo trabajo en «{tabTitle}». Corrige ortografía aquí mismo
                  antes de guardar.
                </p>
                <SheetRowEditor
                  tabTitle={tabTitle}
                  mode="append"
                  temaLabel={temaLabel}
                />
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
