"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { filterTimelineEvents } from "@/lib/data/adapters/timeline";
import type { TimelineEvent, TimelineLine } from "@/lib/types/timeline";

const LINE_LABEL: Record<TimelineLine | "todas", string> = {
  todas: "Las tres líneas",
  "hebrea-judia": "Historia hebrea y judía",
  mundial: "Historia mundial",
  mexico: "Historia de México",
};

export function TimelineExplorer({
  events,
  etapas,
  totalRows,
  initialLine,
  initialQuery,
  initialEtapa,
}: {
  events: TimelineEvent[];
  etapas: string[];
  totalRows: number;
  initialLine?: TimelineLine | "todas" | "";
  initialQuery?: string;
  initialEtapa?: string;
}) {
  const [line, setLine] = useState<TimelineLine | "todas">(
    initialLine && initialLine in LINE_LABEL ? initialLine : "todas",
  );
  const [query, setQuery] = useState(initialQuery ?? "");
  const [etapa, setEtapa] = useState(initialEtapa ?? "");
  const [limit, setLimit] = useState(40);

  const filtered = useMemo(
    () =>
      filterTimelineEvents(events, {
        line,
        etapa: etapa || undefined,
        query,
        limit,
      }),
    [events, line, etapa, query, limit],
  );

  const counts = useMemo(() => {
    return {
      hebrea: events.filter((e) => e.line === "hebrea-judia").length,
      mundial: events.filter((e) => e.line === "mundial").length,
      mexico: events.filter((e) => e.line === "mexico").length,
    };
  }, [events]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-petrol dark:text-ivory">
            Cronología desde Google Sheets
          </h2>
          <p className="mt-1 text-sm text-muted">
            {totalRows} filas fuente · {events.length} acontecimientos
            normalizados · hebrea {counts.hebrea} · mundial {counts.mundial} ·
            México {counts.mexico}
          </p>
        </div>
        <Badge tone="gold">Fuente oficial de la línea del tiempo</Badge>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Buscar acontecimiento
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="Ej. Éxodo, Independencia, Roma…"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Línea
          </span>
          <select
            value={line}
            onChange={(e) => setLine(e.target.value as TimelineLine | "todas")}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            {Object.entries(LINE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Etapa
          </span>
          <select
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="">Todas</option>
            {etapas.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className="mt-6 space-y-3">
        {filtered.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border p-6 text-sm text-muted">
            No hay acontecimientos con estos filtros.
          </li>
        ) : (
          filtered.map((event) => (
            <li
              key={event.id}
              id={event.id}
              className="rounded-xl border border-border bg-background/60 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="muted">{LINE_LABEL[event.line]}</Badge>
                {event.etapa ? <Badge>{event.etapa}</Badge> : null}
                {typeof event.yearGregorian === "number" ? (
                  <span className="text-sm font-medium text-gold">
                    {event.yearGregorian}
                  </span>
                ) : null}
                {event.yearHebrew ? (
                  <span className="text-xs text-muted">
                    Año hebreo {event.yearHebrew}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 leading-relaxed text-foreground">
                {event.title}
              </p>
              <p className="mt-2 text-xs text-muted">
                {[event.source, event.author, event.period]
                  .filter(Boolean)
                  .join(" · ") || "Sin metadatos adicionales"}
                {" · "}
                id estable: {event.id}
              </p>
            </li>
          ))
        )}
      </ul>

      {filtered.length >= limit ? (
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setLimit((n) => n + 40)}
          >
            Cargar más
          </Button>
        </div>
      ) : null}
    </div>
  );
}
