import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
import { getAllPublications } from "@/lib/data/repository";
import { searchPublications } from "@/lib/search";
import type { CategorySlug, ContentType } from "@/lib/types/content";
import { highlightMatch } from "@/lib/utils/text";

export const metadata: Metadata = {
  title: "Buscador global",
  robots: { index: true, follow: true },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BuscarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = param(sp.q) ?? "";
  const category = (param(sp.category) ?? "") as CategorySlug | "";
  const contentType = (param(sp.type) ?? "") as ContentType | "";
  const tag = param(sp.tag) ?? "";
  const subject = param(sp.subject) ?? "";
  const schoolYear = param(sp.year) ?? "";
  const author = param(sp.author) ?? "";
  const sort = (param(sp.sort) as "relevance" | "date" | "title") || "relevance";
  const page = Number(param(sp.page) ?? "1") || 1;

  const user = await getSession();
  const publications = await getAllPublications(user?.role ?? "visitor");
  const result = searchPublications(publications, {
    query: q,
    category,
    contentType,
    tag,
    subject,
    schoolYear,
    author,
    sort,
    page,
    pageSize: 10,
  });

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Buscar" }]} />
      <h1 className="font-serif text-4xl text-petrol dark:text-ivory">
        Buscador global
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Búsqueda sobre el catálogo autorizado: título, palabras clave, autor,
        categoría, materia, etiquetas y más. Tolerante a mayúsculas/minúsculas y
        con normalización de acentos.
      </p>

      <form className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Consulta
          </span>
          <input
            name="q"
            defaultValue={q}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="Ej. hielo, sukkot, poema…"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Categoría
          </span>
          <select
            name="category"
            defaultValue={category}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Orden
          </span>
          <select
            name="sort"
            defaultValue={sort}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="relevance">Relevancia</option>
            <option value="date">Fecha</option>
            <option value="title">Título</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Materia
          </span>
          <input
            name="subject"
            defaultValue={subject}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Ciclo escolar
          </span>
          <input
            name="year"
            defaultValue={schoolYear}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Autor
          </span>
          <input
            name="author"
            defaultValue={author}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Etiqueta
          </span>
          <input
            name="tag"
            defaultValue={tag}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="md:col-span-4">
          <Button type="submit">Buscar</Button>
        </div>
      </form>

      <p className="mt-6 text-sm text-muted">
        {result.total} resultado{result.total === 1 ? "" : "s"}
        {q ? ` para «${q}»` : ""}
      </p>

      {result.items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border p-8">
          <p className="font-medium">Sin resultados</p>
          <p className="mt-2 text-sm text-muted">
            Prueba quitar filtros, usar sinónimos o explorar categorías.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button href="/explorar" variant="secondary" size="sm">
              Explorar catálogo
            </Button>
            <Button href="/categorias" variant="ghost" size="sm">
              Ver categorías
            </Button>
          </div>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {result.items.map(({ publication, score }) => (
            <li
              key={publication.id}
              className="flex gap-4 rounded-xl border border-border bg-card p-4"
            >
              <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-beige">
                {publication.coverImage ? (
                  <Image
                    src={publication.coverImage}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge tone="muted">{publication.contentType}</Badge>
                  {publication.isDemo ? (
                    <Badge tone="demo">Demostración</Badge>
                  ) : null}
                  <span className="text-xs text-muted">
                    relevancia {(score * 100).toFixed(0)}%
                  </span>
                </div>
                <Link
                  href={`/publicacion/${publication.slug}`}
                  className="font-serif text-xl text-petrol hover:text-gold dark:text-ivory"
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(publication.title, q),
                  }}
                />
                <p
                  className="mt-1 text-sm text-muted"
                  dangerouslySetInnerHTML={{
                    __html: highlightMatch(publication.summary, q),
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="mt-8 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (category) params.set("category", category);
            if (tag) params.set("tag", tag);
            if (subject) params.set("subject", subject);
            if (schoolYear) params.set("year", schoolYear);
            if (author) params.set("author", author);
            params.set("sort", sort);
            params.set("page", String(p));
            return (
              <Link
                key={p}
                href={`/buscar?${params.toString()}`}
                className={`rounded-md px-3 py-1.5 text-sm ${
                  p === page
                    ? "bg-petrol text-ivory dark:bg-gold dark:text-deep"
                    : "border border-border"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
