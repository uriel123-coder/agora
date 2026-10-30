"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Publication } from "@/lib/types/content";
import { getCategory } from "@/lib/categories";

const HISTORY_KEY = "agora-search-history";

export function CommandSearch({
  open,
  onOpenChange,
  initialPublications,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialPublications: Publication[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<string[]>([]);

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

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialPublications.filter((p) => p.featured).slice(0, 6);
    return initialPublications
      .filter((p) => {
        const hay = `${p.title} ${p.summary} ${p.tags.join(" ")} ${p.authors
          .filter((a) => a.nameVisible)
          .map((a) => a.displayName)
          .join(" ")}`.toLowerCase();
        return hay.includes(q) || q.split(/\s+/).every((t) => hay.includes(t));
      })
      .slice(0, 8);
  }, [query, initialPublications]);

  const persistHistory = useCallback((value: string) => {
    const next = [value, ...history.filter((h) => h !== value)].slice(0, 8);
    setHistory(next);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }, [history]);

  function goSearch(value = query) {
    const q = value.trim();
    if (!q) {
      router.push("/buscar");
      onOpenChange(false);
      return;
    }
    persistHistory(q);
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-deep/50 p-4 pt-[12vh] backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Buscador global"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-5 w-5 text-muted" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") goSearch();
            }}
            placeholder="Buscar por título, autor, etiqueta, materia…"
            className="h-14 w-full bg-transparent text-base outline-none placeholder:text-muted"
            aria-label="Consulta de búsqueda"
          />
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => onOpenChange(false)}
            className="rounded-md p-2 hover:bg-beige/60 dark:hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!query && history.length ? (
            <div className="mb-2 px-2">
              <p className="px-2 py-1 text-xs uppercase tracking-wider text-muted">
                Historial local
              </p>
              {history.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-beige/50 dark:hover:bg-white/5"
                  onClick={() => goSearch(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          ) : null}
          {suggestions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">
              Sin sugerencias. Prueba otras palabras o ve al buscador avanzado.
            </p>
          ) : (
            suggestions.map((pub) => {
              const cat = getCategory(pub.primaryCategory);
              return (
                <Link
                  key={pub.id}
                  href={`/publicacion/${pub.slug}`}
                  onClick={() => {
                    if (query.trim()) persistHistory(query.trim());
                    onOpenChange(false);
                  }}
                  className="flex gap-3 rounded-xl p-3 hover:bg-beige/50 dark:hover:bg-white/5"
                >
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-beige">
                    {pub.coverImage ? (
                      <Image
                        src={pub.coverImage}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{pub.title}</p>
                    <p className="text-xs text-muted">
                      {cat.name} · {pub.contentType}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted">
          <span>Enter para buscar · Esc para cerrar</span>
          <button
            type="button"
            className="text-gold hover:underline"
            onClick={() => goSearch()}
          >
            Buscador avanzado
          </button>
        </div>
      </div>
    </div>
  );
}
