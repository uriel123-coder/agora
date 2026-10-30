import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CATEGORIES } from "@/lib/categories";

/** Buscador completo con filtros → /buscar (catálogo + alumno/autor). */
export function HomeSearchPanel() {
  return (
    <div className="flex h-full flex-col justify-center px-5 py-10 sm:px-8 lg:px-10 lg:py-12">
      <div className="animate-rise">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-oh-blue">
          Colegio Or Hajayim · Ágora
        </p>
        <h1 className="mt-3 font-display text-3xl leading-tight text-oh-ink dark:text-foreground sm:text-4xl lg:text-[2.65rem]">
          Busca en Ágora
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
          Un solo buscador: títulos, temas, etiquetas, materia, ciclo y nombre de
          alumno (cuando esté autorizado).
        </p>
      </div>

      <form
        action="/buscar"
        method="get"
        className="mt-8 space-y-3 animate-rise-delay"
      >
        <label className="block">
          <span className="sr-only">Consulta</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              placeholder="Palabra, tema, título o alumno…"
              className="w-full rounded-sm border border-border bg-background py-3.5 pl-11 pr-3 text-base outline-none transition duration-300 focus:border-oh-blue focus:shadow-[0_0_0_4px_rgba(57,104,204,0.14)]"
            />
          </div>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Categoría
            </span>
            <select
              name="category"
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-oh-blue"
              defaultValue=""
            >
              <option value="">Todas</option>
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Orden
            </span>
            <select
              name="sort"
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-oh-blue"
              defaultValue="relevance"
            >
              <option value="relevance">Relevancia</option>
              <option value="date">Fecha</option>
              <option value="title">Título</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Autor / alumno
            </span>
            <input
              name="author"
              placeholder="Nombre autorizado"
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-oh-blue"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Materia
            </span>
            <input
              name="subject"
              placeholder="Ej. historia, hebreo…"
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-oh-blue"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Ciclo escolar
            </span>
            <input
              name="year"
              placeholder="Ej. 2025-2026"
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-oh-blue"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
              Etiqueta
            </span>
            <input
              name="tag"
              placeholder="Palabra clave"
              className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm outline-none transition focus:border-oh-blue"
            />
          </label>
        </div>

        <Button type="submit" size="lg" className="mt-2 w-full sm:w-auto">
          Buscar en el catálogo
        </Button>
      </form>
    </div>
  );
}
