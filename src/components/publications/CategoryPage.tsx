import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { getCategory } from "@/lib/categories";
import { getPublicationsByCategory } from "@/lib/data/repository";
import { getSession } from "@/lib/auth/session";
import type { CategorySlug } from "@/lib/types/content";

export async function CategoryPageView({ slug }: { slug: CategorySlug }) {
  const category = getCategory(slug);
  const user = await getSession();
  const publications = await getPublicationsByCategory(
    slug,
    user?.role ?? "visitor",
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Categorías", href: "/categorias" },
          { label: category.name },
        ]}
      />
      <header className="mb-12 max-w-3xl border-b border-border pb-10">
        <span
          className="mb-5 inline-block h-1.5 w-14 rounded-full"
          style={{ background: category.accent }}
          aria-hidden
        />
        <h1 className="font-serif text-4xl leading-tight text-petrol dark:text-ivory sm:text-5xl">
          {category.name}
        </h1>
        <p className="mt-4 text-xl text-muted">{category.tagline}</p>
        <p className="mt-5 text-base leading-relaxed text-foreground/90">
          {category.description}
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {category.contentTypes.map((type) => (
            <Badge key={type} tone="muted">
              {type}
            </Badge>
          ))}
        </div>
      </header>
      {publications.length === 0 ? (
        <EmptyState
          title="Sin publicaciones en esta categoría"
          description="Cuando se carguen contenidos reales (por Google Sheets o administración), aparecerán aquí. No mostramos ejemplos inventados."
          actionHref="/tres-mundos-una-historia"
          actionLabel="Ver la cronología"
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
