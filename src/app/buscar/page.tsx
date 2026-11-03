import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { WorkCard } from "@/components/publications/WorkCard";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
import { getAllPublications, getStudents } from "@/lib/data/repository";
import { searchPublications } from "@/lib/search";
import type { CategorySlug } from "@/lib/types/content";
import { normalizeText } from "@/lib/utils/text";

export const metadata: Metadata = {
  title: "Buscar",
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
  const q = (param(sp.q) ?? "").trim();
  const category = (param(sp.category) ?? "") as CategorySlug | "";
  const sort = (param(sp.sort) as "relevance" | "date" | "title") || "relevance";
  const page = Number(param(sp.page) ?? "1") || 1;
  const hasQuery = q.trim().length >= 2;

  const user = await getSession();
  const role = user?.role ?? "visitor";
  const [publications, students] = await Promise.all([
    getAllPublications(role),
    getStudents(true, role),
  ]);

  const result = hasQuery
    ? searchPublications(publications, {
        query: q,
        category,
        sort,
        page,
        pageSize: 24,
      })
    : { items: [], total: 0, page: 1, pageSize: 24, query: "" };

  const matchedStudents = q
    ? students
        .filter((s) =>
          normalizeText(s.displayName).includes(normalizeText(q)),
        )
        .slice(0, 8)
    : [];

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Buscar" }]} />
      <h1 className="font-display text-3xl text-oh-ink dark:text-foreground sm:text-4xl">
        Buscar trabajos
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Escribe un tema, título o nombre. Solo aparecen coincidencias.
      </p>

      <form
        action="/buscar"
        method="get"
        className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-end"
      >
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Qué buscas
          </span>
          <input
            name="q"
            defaultValue={q}
            autoFocus
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-oh-blue"
            placeholder="Título, tema, autor, año…"
            required
            minLength={2}
          />
        </label>
        <label className="block sm:w-52">
          <span className="mb-1 block text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            Categoría
          </span>
          <select
            name="category"
            defaultValue={category}
            className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-oh-blue"
          >
            <option value="">Cualquiera</option>
            {CATEGORIES.filter((c) => c.slug !== "tres-mundos-una-historia").map(
              (c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ),
            )}
          </select>
        </label>
        <input type="hidden" name="sort" value={sort} />
        <Button type="submit" className="sm:mb-0.5">
          Buscar
        </Button>
      </form>

      {!hasQuery ? (
        <p className="mt-10 rounded-xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted">
          Empieza escribiendo arriba. No listamos el catálogo completo aquí.
        </p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {result.total} trabajo{result.total === 1 ? "" : "s"}
            {matchedStudents.length
              ? ` · ${matchedStudents.length} alumno${matchedStudents.length === 1 ? "" : "s"}`
              : ""}
            {q ? ` para «${q}»` : ""}
          </p>

          {matchedStudents.length > 0 ? (
            <section className="mt-5">
              <h2 className="text-sm font-medium text-oh-ink dark:text-foreground">
                Personas
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {matchedStudents.map((s) => (
                  <Link
                    key={s.id}
                    href={`/alumno/${s.id}`}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-sm transition hover:border-oh-blue hover:text-oh-blue"
                  >
                    {s.displayName}
                    <span className="ml-1 text-muted">
                      ({s.portfolioPublicationIds.length})
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {result.items.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-border p-8 text-center">
              <p className="font-medium">Sin coincidencias</p>
              <p className="mt-2 text-sm text-muted">
                Prueba otra palabra o el nombre completo del alumno.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
            <div className="mt-8 flex flex-wrap gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (category) params.set("category", category);
                params.set("sort", sort);
                params.set("page", String(p));
                return (
                  <Link
                    key={p}
                    href={`/buscar?${params.toString()}`}
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      p === page
                        ? "bg-oh-ink text-white dark:bg-oh-blue"
                        : "border border-border"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
