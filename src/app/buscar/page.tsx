import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { WorkCard } from "@/components/publications/WorkCard";
import { getSession } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
import { enrichPublicationsMedia } from "@/lib/data/enrich-media";
import { getAllPublications, getStudents } from "@/lib/data/repository";
import { searchPublications } from "@/lib/search";
import type { CategorySlug } from "@/lib/types/content";
import { normalizeText } from "@/lib/utils/text";

export const metadata: Metadata = {
  title: "Buscar",
  robots: { index: true, follow: true },
};

export const maxDuration = 45;

function isMediaTypeQuery(q: string) {
  const n = normalizeText(q);
  return [
    "video",
    "videos",
    "pdf",
    "pdfs",
    "imagen",
    "imagenes",
    "foto",
    "fotos",
    "audio",
    "documento",
    "documentos",
    "docx",
    "word",
  ].includes(n);
}

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
  const sort =
    (param(sp.sort) as "relevance" | "date" | "title") || "relevance";
  const page = Number(param(sp.page) ?? "1") || 1;
  const hasQuery = q.trim().length >= 2;

  const user = await getSession();
  const role = user?.role ?? "visitor";
  const [rawPublications, students] = await Promise.all([
    getAllPublications(role),
    getStudents(true, role),
  ]);

  // Si buscan «video»/«pdf»/… tipar Drive con presupuesto corto
  const publications =
    hasQuery && isMediaTypeQuery(q)
      ? await enrichPublicationsMedia(rawPublications, {
          budgetMs: 14_000,
          concurrency: 5,
        })
      : rawPublications;

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
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(57,104,204,0.08) 0%, transparent 100%)",
        }}
      />
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Breadcrumbs items={[{ label: "Buscar" }]} />
        <h1 className="font-display text-4xl text-oh-ink dark:text-foreground sm:text-5xl">
          Buscar
        </h1>
        <p className="mt-2 max-w-xl text-base text-muted">
          Encuentra trabajos por tema, título, nombre o tipo (video, pdf…).
        </p>

        <form
          action="/buscar"
          method="get"
          className="mt-8 overflow-hidden rounded-2xl bg-card shadow-[0_12px_40px_rgba(36,55,70,0.08)] ring-1 ring-border"
        >
          <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch">
            <label className="relative block min-w-0 flex-1">
              <span className="sr-only">Qué buscas</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              <input
                name="q"
                defaultValue={q}
                autoFocus
                className="h-14 w-full border-0 bg-transparent pl-12 pr-4 text-base outline-none placeholder:text-muted"
                placeholder="Título, tema, autor, año…"
                required
                minLength={2}
              />
            </label>
            <label className="block border-t border-border sm:w-52 sm:border-t-0 sm:border-l">
              <span className="sr-only">Categoría</span>
              <select
                name="category"
                defaultValue={category}
                className="h-14 w-full border-0 bg-transparent px-4 text-sm outline-none"
              >
                <option value="">Todas las áreas</option>
                {CATEGORIES.filter(
                  (c) => c.slug !== "tres-mundos-una-historia",
                ).map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <input type="hidden" name="sort" value={sort} />
            <button
              type="submit"
              className="min-h-14 bg-oh-blue px-8 text-sm font-semibold text-white touch-manipulation transition hover:bg-oh-blue-deep"
            >
              Buscar
            </button>
          </div>
        </form>

        {!hasQuery ? (
          <div className="mt-14 text-center">
            <p className="font-display text-2xl text-oh-ink dark:text-foreground">
              Empieza con una palabra
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Solo mostramos coincidencias reales del archivo — nada de listar
              todo el catálogo.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-8 text-sm text-muted">
              {result.total} trabajo{result.total === 1 ? "" : "s"}
              {matchedStudents.length
                ? ` · ${matchedStudents.length} persona${matchedStudents.length === 1 ? "" : "s"}`
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
                    <a
                      key={s.id}
                      href={`/alumno/${s.id}`}
                      className="inline-flex min-h-10 items-center rounded-full border border-border bg-card px-4 text-sm touch-manipulation transition hover:border-oh-blue hover:text-oh-blue"
                    >
                      {s.displayName}
                      <span className="ml-1.5 text-muted">
                        ({s.portfolioPublicationIds.length})
                      </span>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {result.items.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
                <p className="font-display text-xl">Sin coincidencias</p>
                <p className="mt-2 text-sm text-muted">
                  Prueba otra palabra o el nombre completo.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
              <div className="mt-10 flex flex-wrap gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const params = new URLSearchParams();
                  if (q) params.set("q", q);
                  if (category) params.set("category", category);
                  params.set("sort", sort);
                  params.set("page", String(p));
                  return (
                    <a
                      key={p}
                      href={`/buscar?${params.toString()}`}
                      className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm touch-manipulation ${
                        p === page
                          ? "bg-oh-ink text-white dark:bg-oh-blue"
                          : "border border-border"
                      }`}
                    >
                      {p}
                    </a>
                  );
                })}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
