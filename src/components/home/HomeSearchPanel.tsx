import { Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

/** Solo el buscador. Los filtros viven en /buscar (resultados). */
export function HomeSearchPanel() {
  return (
    <form action="/buscar" method="get" className="w-full">
      <label className="block">
        <span className="sr-only">Buscar en Ágora</span>
        <div className="flex overflow-hidden rounded-md bg-white shadow-[0_16px_40px_rgba(26,42,54,0.28)] ring-1 ring-black/5">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              name="q"
              placeholder="Buscar por tema, título, palabra clave o alumno…"
              className="w-full border-0 bg-transparent py-3.5 pl-11 pr-3 text-sm text-oh-ink outline-none placeholder:text-muted sm:text-[0.95rem]"
            />
          </div>
          <Button type="submit" className="shrink-0 rounded-none px-6" size="md">
            Buscar
          </Button>
        </div>
      </label>
    </form>
  );
}
