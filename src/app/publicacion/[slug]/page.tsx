import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { getCategory } from "@/lib/categories";
import {
  getPublicationBySlug,
  getRelatedPublications,
} from "@/lib/data/repository";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pub = await getPublicationBySlug(slug, "visitor");
  if (!pub || pub.accessLevel !== "public") {
    return { title: "Publicación", robots: { index: false, follow: false } };
  }
  return {
    title: pub.title,
    description: pub.summary,
    openGraph: {
      title: pub.title,
      description: pub.summary,
      images: pub.coverImage ? [pub.coverImage] : undefined,
    },
    robots:
      pub.accessLevel === "public"
        ? { index: true, follow: true }
        : { index: false, follow: false },
  };
}

export default async function PublicationPage({ params }: Props) {
  const { slug } = await params;
  const user = await getSession();
  const role = user?.role ?? "visitor";
  const publication = await getPublicationBySlug(slug, role);
  if (!publication) notFound();

  const category = getCategory(publication.primaryCategory);
  const related = await getRelatedPublications(publication, role, 3);
  const authors = publication.authors
    .filter((a) => a.nameVisible)
    .map((a) => a.displayName)
    .join(", ");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: category.name, href: `/${category.slug}` },
          { label: publication.title },
        ]}
      />
      <article className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{category.name}</Badge>
            <Badge tone="muted">{publication.contentType}</Badge>
            {publication.isDemo ? (
              <Badge tone="demo">Contenido de demostración</Badge>
            ) : null}
          </div>
          <h1 className="font-serif text-4xl leading-tight text-petrol dark:text-ivory sm:text-5xl">
            {publication.title}
          </h1>
          {publication.subtitle ? (
            <p className="mt-3 text-xl text-muted">{publication.subtitle}</p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted">
            <span>{authors || "Autoría institucional"}</span>
            <span aria-hidden>·</span>
            <time dateTime={publication.publishedAt}>
              {new Date(publication.publishedAt).toLocaleDateString("es-MX", {
                dateStyle: "long",
              })}
            </time>
            {publication.subject ? (
              <>
                <span aria-hidden>·</span>
                <span>{publication.subject}</span>
              </>
            ) : null}
            {publication.schoolYear ? (
              <>
                <span aria-hidden>·</span>
                <span>{publication.schoolYear}</span>
              </>
            ) : null}
          </div>

          {publication.coverImage ? (
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-border">
              <Image
                src={publication.coverImage}
                alt={publication.coverAlt || publication.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width:1024px) 100vw, 70vw"
              />
            </div>
          ) : null}

          <div
            className="prose-agora mt-10"
            dangerouslySetInnerHTML={{ __html: publication.body }}
          />

          {publication.media.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-serif text-2xl text-petrol dark:text-ivory">
                Recursos
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {publication.media.map((asset) =>
                  asset.type === "image" ? (
                    <div
                      key={asset.id}
                      className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border"
                    >
                      <Image
                        src={asset.url}
                        alt={asset.alt || asset.title || "Recurso"}
                        fill
                        className="object-cover"
                        sizes="400px"
                      />
                    </div>
                  ) : (
                    <a
                      key={asset.id}
                      href={asset.url}
                      className="rounded-xl border border-border p-4 text-sm hover:border-gold"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {asset.type.toUpperCase()}: {asset.title || asset.url}
                    </a>
                  ),
                )}
              </div>
            </section>
          ) : null}

          {publication.bibliography && publication.bibliography.length > 0 ? (
            <section className="mt-10">
              <h2 className="font-serif text-2xl text-petrol dark:text-ivory">
                Bibliografía
              </h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
                {publication.bibliography.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {publication.credits ? (
            <p className="mt-8 text-sm text-muted">Créditos: {publication.credits}</p>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg">Compartir y guardar</h2>
            <div className="mt-3 flex flex-col gap-2">
              <Button
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/publicacion/${publication.slug}`)}`}
                variant="secondary"
                size="sm"
              >
                Compartir
              </Button>
              <Button href={user ? "/mi-agora" : "/acceder"} variant="ghost" size="sm">
                {user ? "Guardar en Mi Ágora" : "Acceder para guardar"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg">Etiquetas</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {publication.tags.map((tag) => (
                <Link key={tag} href={`/buscar?tag=${encodeURIComponent(tag)}`}>
                  <Badge tone="muted">#{tag}</Badge>
                </Link>
              ))}
            </div>
          </div>

          {publication.historicalLinks.length > 0 ? (
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="font-serif text-lg">Vínculos históricos</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {publication.historicalLinks.map((link, i) => (
                  <li key={i}>
                    <p className="text-muted">
                      {link.label || "Acontecimiento relacionado"}
                      {link.year ? ` · ${link.year}` : ""}
                      {link.yearEnd ? `–${link.yearEnd}` : ""}
                      {link.historicalLine ? ` · ${link.historicalLine}` : ""}
                    </p>
                    {link.deepUrl ? (
                      <Link
                        href={link.deepUrl}
                        className="text-gold hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Abrir en la línea del tiempo
                      </Link>
                    ) : (
                      <Link
                        href="/tres-mundos-una-historia"
                        className="text-gold hover:underline"
                      >
                        Ver Tres mundos, una historia
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                Vínculos de referencia. No implica sincronización bidireccional
                automática con la cronología.
              </p>
            </div>
          ) : null}

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg">También en</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {publication.categorySlugs.map((slug) => (
                <li key={slug}>
                  <Link href={`/${slug}`} className="text-gold hover:underline">
                    {getCategory(slug).name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </article>

      {related.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 font-serif text-3xl text-petrol dark:text-ivory">
            También te puede interesar
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
