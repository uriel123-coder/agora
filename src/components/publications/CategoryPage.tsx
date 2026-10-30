import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { getCategory, TIMELINE_EXTERNAL_URL } from "@/lib/categories";
import { getPublicationsByCategory } from "@/lib/data/repository";
import { getSession } from "@/lib/auth/session";
import type { CategorySlug } from "@/lib/types/content";
import { Button } from "@/components/ui/Button";

export async function CategoryPageView({ slug }: { slug: CategorySlug }) {
  const category = getCategory(slug);
  const user = await getSession();
  const publications = await getPublicationsByCategory(
    slug,
    user?.role ?? "visitor",
  );
  const isTimeline = slug === "tres-mundos-una-historia";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Explorar", href: "/explorar" },
          { label: category.name },
        ]}
      />
      <header className="mb-12 max-w-3xl border-b border-border pb-10">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-oh-blue">
          Or Hajayim · Ágora
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight text-oh-ink dark:text-foreground sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 text-xl text-muted">
          {isTimeline
            ? "«Tres historias. Un mismo tiempo. Infinitas conexiones»."
            : category.tagline}
        </p>
        <p className="mt-5 text-base leading-relaxed text-foreground/90">
          {category.description}
        </p>
        {!isTimeline ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {category.contentTypes.map((type) => (
              <Badge key={type} tone="muted">
                {type}
              </Badge>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/tres-mundos-una-historia">Ver portal en Ágora</Button>
            <Button href={TIMELINE_EXTERNAL_URL} variant="secondary" external>
              Abrir cronología (nueva pestaña)
            </Button>
          </div>
        )}
      </header>
      {publications.length === 0 ? (
        <EmptyState
          title="Sin publicaciones en esta categoría"
          description="Cuando haya contenidos reales autorizados, se listarán aquí."
          actionHref={isTimeline ? TIMELINE_EXTERNAL_URL : "/buscar-alumno"}
          actionLabel={
            isTimeline ? "Abrir cronología (nueva pestaña)" : "Buscar alumno"
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}
    </div>
  );
}
