import { Search } from "lucide-react";

/** Buscador del hero: grande, claro, click inmediato. */
export function HomeSearchPanel() {
  return (
    <form action="/buscar" method="get" className="w-full">
      <label className="block">
        <span className="sr-only">Buscar en Ágora</span>
        <div className="flex items-stretch overflow-hidden rounded-2xl bg-white/95 shadow-[0_20px_50px_rgba(26,42,54,0.35)] ring-1 ring-white/40 backdrop-blur">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-oh-ink/40" />
            <input
              name="q"
              placeholder="Busca un trabajo, tema o nombre…"
              className="h-14 w-full border-0 bg-transparent pl-12 pr-3 text-[0.95rem] text-oh-ink outline-none placeholder:text-oh-ink/45 sm:h-[3.75rem] sm:text-base"
              required
              minLength={2}
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="min-h-14 shrink-0 bg-oh-blue px-6 text-sm font-semibold text-white touch-manipulation transition hover:bg-oh-blue-deep sm:min-h-[3.75rem] sm:px-8 sm:text-base"
          >
            Buscar
          </button>
        </div>
      </label>
    </form>
  );
}
