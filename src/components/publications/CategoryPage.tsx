import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
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
      <div className="mb-10 max-w-3xl">
        <span
          className="mb-4 inline-block h-1.5 w-12 rounded-full"
          style={{ background: category.accent }}
          aria-hidden
        />
        <h1 className="font-serif text-4xl text-petrol dark:text-ivory">
          {category.name}
        </h1>
        <p className="mt-3 text-lg text-muted">{category.tagline}</p>
        <p className="mt-4 leading-relaxed text-foreground/90">
          {category.description}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {category.contentTypes.map((type) => (
            <Badge key={type} tone="muted">
              {type}
            </Badge>
          ))}
        </div>
      </div>
      {publications.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-muted">
          Todavía no hay publicaciones publicadas en esta categoría.
        </p>
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
