import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { getSession } from "@/lib/auth/session";
import { getLatestPublications } from "@/lib/data/repository";

export const metadata: Metadata = { title: "Explorar" };

export default async function ExplorarPage() {
  const user = await getSession();
  const publications = await getLatestPublications(user?.role ?? "visitor", 24);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Explorar" }]} />
      <h1 className="font-serif text-4xl text-petrol dark:text-ivory">Explorar</h1>
      <p className="mt-3 max-w-2xl text-muted">
        Catálogo navegable de publicaciones autorizadas. Usa el buscador global
        para filtrar con precisión.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {publications.map((pub) => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
      </div>
    </div>
  );
}
