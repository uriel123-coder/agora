import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { getCategory } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";
import { excerpt } from "@/lib/utils/text";

export function PublicationCard({ publication }: { publication: Publication }) {
  const category = getCategory(publication.primaryCategory);
  const authors = publication.authors
    .filter((a) => a.nameVisible)
    .map((a) => a.displayName)
    .join(", ");

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-border bg-card transition duration-300 hover:border-oh-blue/40">
      <Link
        href={`/publicacion/${publication.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-oh-stone"
      >
        {publication.coverImage ? (
          <Image
            src={publication.coverImage}
            alt={publication.coverAlt || publication.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.02]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Sin portada
          </div>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{category.name}</Badge>
          {publication.isDemo ? <Badge tone="demo">Demostración</Badge> : null}
        </div>
        <h3 className="font-display text-xl leading-snug text-oh-ink dark:text-foreground">
          <Link
            href={`/publicacion/${publication.slug}`}
            className="hover:text-oh-blue"
          >
            {publication.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-muted">
          {excerpt(publication.summary, 140)}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-muted">
          <span>{authors || "Autoría institucional"}</span>
          <span>
            {new Date(publication.publishedAt).toLocaleDateString("es-MX", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
        </div>
      </div>
    </article>
  );
}
