import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { getSession } from "@/lib/auth/session";
import { getLatestPublications } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Explorar" };
export const dynamic = "force-dynamic";

export default async function ExplorarPage() {
  const user = await getSession();
  const publications = await getLatestPublications(user?.role ?? "visitor", 48);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Explorar" }]} />
      <h1 className="font-serif text-4xl text-petrol dark:text-ivory sm:text-5xl">
        Explorar
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Catálogo de publicaciones autorizadas. Solo contenido real.
      </p>
      {publications.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="El catálogo todavía está vacío"
            description="Aún no hay publicaciones cargadas. La cronología comparativa sí está conectada con Google Sheets."
            actionHref="/tres-mundos-una-historia"
            actionLabel="Ir a Tres mundos, una historia"
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}
    </div>
  );
}
