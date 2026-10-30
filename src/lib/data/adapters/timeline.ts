import type { TimelineBundle, TimelineEvent, TimelineLine } from "@/lib/types/timeline";

function parseYear(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const cleaned = raw.replace(/[^\d\-]/g, "");
  if (!cleaned) return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

function pushEvent(
  events: TimelineEvent[],
  rowIndex: number,
  line: TimelineLine,
  title: string,
  meta: {
    etapa?: string;
    yearGregorian?: number;
    yearHebrew?: string;
    period?: string;
    source?: string;
    author?: string;
  },
) {
  const text = title.trim();
  if (!text) return;
  events.push({
    id: `tl-${line}-${rowIndex}`,
    rowIndex,
    line,
    title: text,
    ...meta,
  });
}

/**
 * Adapta la estructura real de «Línea comparativa 2027» (Hoja1).
 * Columnas observadas:
 * 0 Etapa | 1 Fuente | 2 Autor | 3 Eventos hebrea | 4 Año hebreo | 5 Año gregoriano |
 * 6 (vacío) | 7 Eventos mundo | 8 Fuente | 9 Autor | 10 Periodo |
 * 11 Eventos México | 12 Fuente | 13 Autor
 */
export function rowsToTimelineEvents(values: string[][]): TimelineBundle {
  const events: TimelineEvent[] = [];
  if (values.length < 2) {
    return {
      events: [],
      etapas: [],
      totalRows: 0,
      source: "empty",
      sheetTitle: "Hoja1",
    };
  }

  for (let i = 1; i < values.length; i++) {
    const row = values[i] ?? [];
    const etapa = row[0]?.trim() || undefined;
    const yearHebrew = row[4]?.trim() || undefined;
    const yearGregorian = parseYear(row[5]);
    const period = row[10]?.trim() || undefined;

    pushEvent(events, i + 1, "hebrea-judia", row[3] ?? "", {
      etapa,
      yearGregorian,
      yearHebrew,
      source: row[1]?.trim() || undefined,
      author: row[2]?.trim() || undefined,
    });
    pushEvent(events, i + 1, "mundial", row[7] ?? "", {
      etapa,
      yearGregorian,
      yearHebrew,
      period,
      source: row[8]?.trim() || undefined,
      author: row[9]?.trim() || undefined,
    });
    pushEvent(events, i + 1, "mexico", row[11] ?? "", {
      etapa,
      yearGregorian,
      yearHebrew,
      period,
      source: row[12]?.trim() || undefined,
      author: row[13]?.trim() || undefined,
    });
  }

  const etapas = [...new Set(events.map((e) => e.etapa).filter(Boolean))] as string[];

  return {
    events,
    etapas,
    totalRows: values.length - 1,
    source: "google-sheets",
    sheetTitle: "Hoja1",
  };
}

export function filterTimelineEvents(
  events: TimelineEvent[],
  opts: {
    line?: TimelineLine | "todas";
    etapa?: string;
    query?: string;
    yearFrom?: number;
    yearTo?: number;
    limit?: number;
  },
): TimelineEvent[] {
  let pool = [...events];
  if (opts.line && opts.line !== "todas") {
    pool = pool.filter((e) => e.line === opts.line);
  }
  if (opts.etapa) {
    pool = pool.filter((e) => e.etapa === opts.etapa);
  }
  if (opts.query?.trim()) {
    const q = opts.query.trim().toLowerCase();
    pool = pool.filter((e) => e.title.toLowerCase().includes(q));
  }
  if (typeof opts.yearFrom === "number") {
    pool = pool.filter(
      (e) => typeof e.yearGregorian === "number" && e.yearGregorian >= opts.yearFrom!,
    );
  }
  if (typeof opts.yearTo === "number") {
    pool = pool.filter(
      (e) => typeof e.yearGregorian === "number" && e.yearGregorian <= opts.yearTo!,
    );
  }
  pool.sort((a, b) => {
    const ay = a.yearGregorian ?? Number.POSITIVE_INFINITY;
    const by = b.yearGregorian ?? Number.POSITIVE_INFINITY;
    return ay - by;
  });
  if (opts.limit) return pool.slice(0, opts.limit);
  return pool;
}
