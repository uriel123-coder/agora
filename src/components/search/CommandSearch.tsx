"use client";

import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getCategory } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types/content";

const HISTORY_KEY = "agora-search-history";

type SuggestItem = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage?: string;
  primaryCategory: CategorySlug;
  author: string;
};

export function CommandSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [items, setItems] = useState<SuggestItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as string[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search/suggest?q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal },
        );
        const data = (await res.json()) as { items?: SuggestItem[] };
        setItems(data.items ?? []);
      } catch {
        if (!ctrl.signal.aborted) setItems([]);
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, q ? 180 : 0);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [open, query]);

  const persistHistory = useCallback(
    (value: string) => {
      const next = [value, ...history.filter((h) => h !== value)].slice(0, 8);
      setHistory(next);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    },
    [history],
  );

  function goSearch(value = query) {
    const q = value.trim();
    onOpenChange(false);
    if (!q) {
      window.location.assign("/buscar");
      return;
    }
    persistHistory(q);
    window.location.assign(`/buscar?q=${encodeURIComponent(q)}`);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#1a2a36]/60 p-4 pt-[10vh] backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Buscador"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-card shadow-[0_24px_80px_rgba(26,42,54,0.45)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goSearch();
            }}
            placeholder="Tema, título, autor…"
            className="min-h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
          />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-muted hover:bg-oh-stone hover:text-oh-ink"
            onClick={() => onOpenChange(false)}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto p-2">
          {!query && history.length > 0 ? (
            <div className="mb-2 px-2 py-1">
              <p className="mb-1 text-[11px] text-muted">Recientes</p>
              <div className="flex flex-wrap gap-1.5">
                {history.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => goSearch(h)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs hover:border-oh-blue hover:text-oh-blue"
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {loading ? (
            <p className="px-3 py-6 text-sm text-muted">Buscando…</p>
          ) : items.length === 0 ? (
            <p className="px-3 py-6 text-sm text-muted">
              {query.trim().length >= 2
                ? "Sin coincidencias"
                : "Escribe para buscar en el archivo"}
            </p>
          ) : (
            <ul className="space-y-0.5">
              {items.map((item) => {
                const cat = getCategory(item.primaryCategory);
                return (
                  <li key={item.id}>
                    <a
                      href={`/publicacion/${item.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="block rounded-xl px-3 py-3 transition hover:bg-oh-stone/80 dark:hover:bg-white/5"
                      style={{ touchAction: "manipulation" }}
                    >
                      <p className="text-[11px] text-muted">{cat.name}</p>
                      <p className="font-display text-[1.05rem] leading-snug text-oh-ink dark:text-foreground">
                        {item.title}
                      </p>
                      {item.author ? (
                        <p className="mt-0.5 text-xs text-muted">{item.author}</p>
                      ) : null}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted">
          <span>Enter para ver resultados</span>
          <button
            type="button"
            className="min-h-9 rounded-lg px-3 text-oh-blue hover:underline"
            onClick={() => goSearch()}
          >
            Abrir buscador completo
          </button>
        </div>
      </div>
    </div>
  );
}
