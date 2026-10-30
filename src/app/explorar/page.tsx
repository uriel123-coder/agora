import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { getSession } from "@/lib/auth/session";
import { CATEGORIES, TIMELINE_EXTERNAL_URL } from "@/lib/categories";
import { getLatestPublications } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Explorar" };
export const dynamic = "force-dynamic";

export default async function ExplorarPage() {
  const user = await getSession();
  const publications = await getLatestPublications(user?.role ?? "visitor", 48);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Explorar" }]} />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground sm:text-5xl">
        Explorar
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Catálogo y categorías de Ágora. Solo contenido autorizado de Or Hajayim.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const isTimeline = cat.slug === "tres-mundos-una-historia";
          const className =
            "group relative min-h-[180px] overflow-hidden border border-border transition duration-300 hover:-translate-y-1 hover:border-oh-blue/40";
          const body = (
            <>
              <Image
                src={cat.coverImage}
                alt=""
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-oh-ink/90 via-oh-ink/40 to-transparent" />
              <div className="relative flex h-full flex-col justify-end p-4 text-white">
                <h2 className="font-display text-xl">{cat.name}</h2>
                <p className="mt-1 text-sm text-white/75">{cat.tagline}</p>
              </div>
            </>
          );

          if (isTimeline) {
            return (
              <a
                key={cat.slug}
                href={TIMELINE_EXTERNAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {body}
              </a>
            );
          }

          return (
            <Link key={cat.slug} href={`/${cat.slug}`} className={className}>
              {body}
            </Link>
          );
        })}
      </div>

      {publications.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="El catálogo todavía está vacío"
            description="Cuando existan publicaciones reales, aparecerán aquí."
            actionHref="/buscar"
            actionLabel="Ir al buscador"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}
    </div>
  );
}
