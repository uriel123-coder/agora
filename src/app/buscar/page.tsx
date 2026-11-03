import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { WorkCard } from "@/components/publications/WorkCard";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
import { getAllPublications, getStudents } from "@/lib/data/repository";
import { searchPublications } from "@/lib/search";
import type { CategorySlug, ContentType } from "@/lib/types/content";
import { normalizeText } from "@/lib/utils/text";

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
  const role = user?.role ?? "visitor";
  const [publications, students] = await Promise.all([
    getAllPublications(role),
    getStudents(true, role),
  ]);
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
    pageSize: 12,
  });

  const matchedStudents = q
    ? students.filter((s) =>
        normalizeText(s.displayName).includes(normalizeText(q)),
      )
    : [];

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Buscar" }]} />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
        Buscar en Ágora
      </h1>
      <p className="mt-2 max-w-2xl text-muted">
        Temas, títulos, alumnos y categorías del catálogo cargado desde Sheets.
      </p>

      <form className="mt-8 grid gap-4 rounded-md border border-border bg-card p-5 md:grid-cols-4">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Consulta
          </span>
          <input
            name="q"
            defaultValue={q}
            className="w-full rounded-sm border border-border bg-background px-3 py-2"
            placeholder="Tema, título o nombre de alumno…"
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
        {result.total} trabajo{result.total === 1 ? "" : "s"}
        {matchedStudents.length
          ? ` · ${matchedStudents.length} alumno${matchedStudents.length === 1 ? "" : "s"}`
          : ""}
        {q ? ` para «${q}»` : ""}
      </p>

      {matchedStudents.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-display text-xl">Alumnos</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matchedStudents.map((s) => (
              <Link
                key={s.id}
                href={`/alumno/${s.id}`}
                className="rounded-md border border-border bg-card p-4 hover:border-oh-blue/40"
              >
                <p className="font-display text-lg">{s.displayName}</p>
                <p className="text-sm text-muted">
                  {s.portfolioPublicationIds.length} trabajos
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {result.items.length === 0 ? (
        <div className="mt-8 rounded-md border border-dashed border-border p-8">
          <p className="font-medium">Sin resultados</p>
          <p className="mt-2 text-sm text-muted">
            Prueba otro término o explora categorías.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button href="/explorar" variant="secondary" size="sm">
              Explorar catálogo
            </Button>
            <Button href="/#categorias" variant="ghost" size="sm">
              Ver categorías
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.items.map(({ publication }) => (
            <WorkCard
              key={publication.id}
              publication={publication}
              showAuthor
            />
          ))}
        </div>
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
                    ? "bg-oh-ink text-white dark:bg-oh-blue dark:text-oh-ink-deep"
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
