import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TimelineExplorer } from "@/components/timeline/TimelineExplorer";
import { TIMELINE_EXTERNAL_URL } from "@/lib/categories";
import { getSession } from "@/lib/auth/session";
import { getAllPublications } from "@/lib/data/repository";
import { loadTimelineFromSheets } from "@/lib/data/providers/sheets";

export const metadata: Metadata = {
  title: "Tres mundos, una historia",
  description:
    "Tres historias. Un mismo tiempo. Infinitas conexiones. Cronología comparativa integrada en Ágora.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TresMundosPage({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await getSession();
  const pubs = await getAllPublications(user?.role ?? "visitor");
  const linked = pubs.filter((p) => p.historicalLinks.length > 0);
  const { bundle, error } = await loadTimelineFromSheets();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Tres mundos, una historia" }]} />
      <div className="max-w-3xl">
        <Badge tone="gold">Datos desde Google Sheets + sitio original</Badge>
        <h1 className="mt-4 font-serif text-4xl text-petrol dark:text-ivory sm:text-5xl">
          Tres mundos, una historia
        </h1>
        <p className="mt-4 text-xl text-muted">
          «Tres historias. Un mismo tiempo. Infinitas conexiones».
        </p>
        <p className="mt-4 leading-relaxed text-foreground/90">
          Cronología comparativa de historia hebrea y judía, historia mundial e
          historia de México. Los acontecimientos se leen desde la hoja
          autorizada; la experiencia visual completa permanece en el sitio
          original.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={TIMELINE_EXTERNAL_URL}>Abrir sitio original</Button>
          <Button href="/ecos-de-la-historia" variant="secondary">
            Ecos de la historia
          </Button>
          <Button href="/shorashim" variant="ghost">
            Shorashim
          </Button>
        </div>
      </div>

      <section className="mt-10">
        {error ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">
            No se pudo cargar la cronología desde Sheets: {error}
          </div>
        ) : (
          <TimelineExplorer
            events={bundle.events}
            etapas={bundle.etapas}
            totalRows={bundle.totalRows}
            initialLine={param(sp.line) as never}
            initialQuery={param(sp.q) ?? ""}
            initialEtapa={param(sp.etapa) ?? ""}
          />
        )}
      </section>

      <section className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm text-muted">
          Vista incrustada del sitio original{" "}
          <Link
            href={TIMELINE_EXTERNAL_URL}
            className="text-gold hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            linea-comparativa-2027.vercel.app
          </Link>
          . La lectura de datos vía Sheets es independiente de este iframe.
        </div>
        <div className="relative min-h-[70vh] w-full">
          <iframe
            title="Tres mundos, una historia — sitio original"
            src={TIMELINE_EXTERNAL_URL}
            className="absolute inset-0 h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-3xl text-petrol dark:text-ivory">
          Publicaciones vinculadas
        </h2>
        <p className="mt-2 max-w-2xl text-muted">
          Contenidos del catálogo de Ágora con referencias históricas. Son
          vínculos de metadatos, no una sincronización bidireccional automática.
        </p>
        {linked.length === 0 ? (
          <p className="mt-6 text-muted">Aún no hay vínculos registrados.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {linked.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
