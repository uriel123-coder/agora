import type { Metadata } from "next";
import Link from "next/link";
import { TresMundosExperience } from "@/components/tres-mundos/TresMundosExperience";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { TIMELINE_EXTERNAL_URL } from "@/lib/categories";
import { getSession } from "@/lib/auth/session";
import { getAllPublications } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "Tres mundos, una historia",
  description:
    "Tres historias. Un mismo tiempo. Infinitas conexiones. Cronología comparativa de Or Hajayim.",
};

export const dynamic = "force-dynamic";

export default async function TresMundosPage() {
  const user = await getSession();
  const pubs = await getAllPublications(user?.role ?? "visitor");
  const linked = pubs.filter((p) => p.historicalLinks.length > 0);

  return (
    <div>
      <TresMundosExperience variant="page" />

      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-oh-blue">
                Puente oficial
              </p>
              <h2 className="mt-2 font-display text-2xl text-oh-ink dark:text-foreground sm:text-3xl">
                La cronología no se rehace aquí
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                Cada clic en las tres líneas abre{" "}
                <a
                  href={TIMELINE_EXTERNAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-oh-blue underline-offset-2 hover:underline"
                >
                  linea-comparativa-2027.vercel.app
                </a>{" "}
                en otra pestaña. Ágora se queda donde estabas.
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

      {linked.length > 0 ? (
        <section className="border-t border-border bg-oh-stone/30 dark:bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
            <h2 className="font-display text-3xl text-oh-ink dark:text-foreground">
              Publicaciones vinculadas
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {linked.map((pub) => (
                <PublicationCard key={pub.id} publication={pub} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
