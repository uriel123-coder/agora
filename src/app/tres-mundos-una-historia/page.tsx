import type { Metadata } from "next";
import Link from "next/link";
import { TresMundosExperience } from "@/components/tres-mundos/TresMundosExperience";
import { TIMELINE_EXTERNAL_URL } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Tres mundos, una historia",
  description:
    "Tres historias. Un mismo tiempo. Infinitas conexiones. Cronología comparativa de Or Hajayim.",
};

export default function TresMundosPage() {
  return (
    <div>
      <TresMundosExperience variant="page" />

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-oh-blue">
                Cronología externa
              </p>
              <h2 className="mt-2 font-display text-2xl text-oh-ink dark:text-foreground sm:text-3xl">
                Las tres líneas ya viven en su propia página
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Ágora no reconstruye esa línea desde Sheets. Cada clic abre{" "}
                <a
                  href={TIMELINE_EXTERNAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-oh-blue underline-offset-2 hover:underline"
                >
                  linea-comparativa-2027.vercel.app
                </a>{" "}
                en otra pestaña.
              </p>
            </div>
            <Link
              href="/ecos-de-la-historia"
              className="text-sm text-oh-blue transition hover:underline"
            >
              Ir a Ecos de la historia →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
