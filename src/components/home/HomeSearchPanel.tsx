import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/categories";

/** Buscador del hero: catálogo completo (tema, título, alumno, filtros). */
export function HomeSearchPanel({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action="/buscar"
      method="get"
      className={
        compact
          ? "w-full space-y-2.5"
          : "mt-6 w-full max-w-2xl space-y-3"
      }
    >
      <label className="block">
        <span className="sr-only">Buscar en Ágora</span>
        <div className="flex overflow-hidden rounded-sm bg-white shadow-lg">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              placeholder="Tema, título, palabra clave, alumno…"
              className="w-full border-0 bg-transparent py-3 pl-10 pr-3 text-sm text-oh-ink outline-none placeholder:text-muted sm:text-base"
            />
          </div>
          <Button
            type="submit"
            className="shrink-0 rounded-none px-5"
            size="md"
          >
            Buscar
          </Button>
        </div>
      </label>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="block">
          <span className="sr-only">Categoría</span>
          <select
            name="category"
            defaultValue=""
            className="w-full rounded-sm border-0 bg-white/95 px-2.5 py-2 text-xs text-oh-ink shadow outline-none"
          >
            <option value="">Todas las categorías</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="sr-only">Autor</span>
          <input
            name="author"
            placeholder="Autor / alumno"
            className="w-full rounded-sm border-0 bg-white/95 px-2.5 py-2 text-xs text-oh-ink shadow outline-none placeholder:text-muted"
          />
        </label>
        <label className="block">
          <span className="sr-only">Materia</span>
          <input
            name="subject"
            placeholder="Materia"
            className="w-full rounded-sm border-0 bg-white/95 px-2.5 py-2 text-xs text-oh-ink shadow outline-none placeholder:text-muted"
          />
        </label>
        <label className="block">
          <span className="sr-only">Orden</span>
          <select
            name="sort"
            defaultValue="relevance"
            className="w-full rounded-sm border-0 bg-white/95 px-2.5 py-2 text-xs text-oh-ink shadow outline-none"
          >
            <option value="relevance">Relevancia</option>
            <option value="date">Fecha</option>
            <option value="title">Título</option>
          </select>
        </label>
      </div>
    </form>
  );
}
