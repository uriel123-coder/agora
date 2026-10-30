import { ArrowUpRight } from "lucide-react";
import { TIMELINE_EXTERNAL_URL } from "@/lib/categories";

/** Franja discreta: la cronología no compite con las categorías. */
export function TresMundosQuietBand() {
  return (
    <section
      id="tres-mundos"
      className="border-y border-border bg-oh-stone/50 dark:bg-white/[0.03]"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted">
            También en Ágora
          </p>
          <p className="mt-1 font-display text-lg text-oh-ink dark:text-foreground sm:text-xl">
            Tres mundos, una historia
          </p>
          <p className="mt-1 text-sm text-muted">
            Cronología comparativa oficial — se abre en otra pestaña.
          </p>
        </div>
        <a
          href={TIMELINE_EXTERNAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 self-start border border-oh-ink/20 px-4 py-2.5 text-sm font-medium text-oh-ink transition duration-300 hover:-translate-y-0.5 hover:border-oh-blue hover:text-oh-blue dark:border-white/20 dark:text-foreground"
        >
          Abrir cronología
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
