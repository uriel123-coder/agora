import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { getSession } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
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

      <div className="mt-8 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="border border-border bg-card px-3 py-2 text-sm transition hover:border-oh-blue hover:text-oh-blue"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {publications.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="El catálogo todavía está vacío"
            description="Cuando existan publicaciones reales, aparecerán aquí."
            actionHref="/buscar-alumno"
            actionLabel="Buscar alumno"
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
