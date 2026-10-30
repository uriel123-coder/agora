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
    <article className="surface-card group flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-gold/45">
      <Link
        href={`/publicacion/${publication.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-beige"
      >
        {publication.coverImage ? (
          <Image
            src={publication.coverImage}
            alt={publication.coverAlt || publication.title}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,var(--beige),var(--ivory))] text-sm text-muted">
            Sin portada
          </div>
        )}
        <span
          className="absolute left-0 top-0 h-full w-1"
          style={{ background: category.accent }}
          aria-hidden
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge>{category.name}</Badge>
          {publication.isDemo ? (
            <Badge tone="demo">Contenido de demostración</Badge>
          ) : null}
        </div>
        <h3 className="font-serif text-[1.35rem] leading-snug text-petrol dark:text-ivory">
          <Link
            href={`/publicacion/${publication.slug}`}
            className="transition-colors hover:text-gold"
          >
            {publication.title}
          </Link>
        </h3>
        <p className="text-sm leading-relaxed text-muted">
          {excerpt(publication.summary, 140)}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted">
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
