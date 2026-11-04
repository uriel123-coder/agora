import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminCategorySection } from "@/components/admin/AdminCategorySection";
import { RefreshSheetsButton } from "@/components/admin/RefreshSheetsButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import {
  sheetTabTitleForCategorySlug,
  titleColumnLabelForTab,
} from "@/lib/data/adapters/sheet-aliases";
import { loadPublicationsFromSheets } from "@/lib/data/providers/sheets";
import { getAllPublications } from "@/lib/data/repository";
import { CATEGORIES } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";

export const metadata: Metadata = {
  title: "Admin · Publicaciones",
  robots: { index: false, follow: false },
};

function rowFromPublication(pub: Publication) {
  const autor =
    pub.authors.find((a) => a.nameVisible)?.displayName ||
    pub.authors[0]?.displayName ||
    "";
  // El campo editable es el título real de la fila (Título/Tema), no un recorte.
  const tema = pub.title || pub.subject || "";
  return {
    publication: pub,
    autor,
    tema,
    anio: pub.schoolYear || "",
    enlace: pub.media[0]?.url || "",
    editable: Boolean(pub.sheetsTab && pub.sheetsRowNumber),
  };
}

export default async function AdminPublicacionesPage() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) redirect("/acceder");

  const [publications, sheetsLoad] = await Promise.all([
    getAllPublications(user.role),
    loadPublicationsFromSheets(),
  ]);

  const catalogCategories = CATEGORIES.filter(
    (c) => c.slug !== "tres-mundos-una-historia",
  );

  const sections = catalogCategories.map((cat) => {
    const pubs = publications.filter((p) => p.primaryCategory === cat.slug);
    // Usa el nombre real de la pestaña si ya hay filas; si no, el nombre de categoría
    const tabTitle =
      pubs.find((p) => p.sheetsTab)?.sheetsTab ||
      sheetTabTitleForCategorySlug(cat.slug) ||
      cat.name;
    return {
      cat,
      tabTitle,
      temaLabel: titleColumnLabelForTab(tabTitle),
      rows: pubs
        .slice()
        .sort((a, b) =>
          (a.title || "").localeCompare(b.title || "", "es", {
            sensitivity: "base",
          }),
        )
        .map(rowFromPublication),
    };
  });

  const firstWithContent = sections.findIndex((s) => s.rows.length > 0);

  const otherPubs = publications.filter(
    (p) =>
      p.primaryCategory === "tres-mundos-una-historia" ||
      !catalogCategories.some((c) => c.slug === p.primaryCategory),
  );

  const totalEditable = publications.filter(
    (p) => p.sheetsTab && p.sheetsRowNumber,
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Administración", href: "/admin" },
          { label: "Publicaciones" },
        ]}
      />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-oh-blue">
            Catálogo por categoría
          </p>
          <h1 className="mt-2 font-display text-4xl text-oh-ink dark:text-foreground">
            Editar trabajos
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Cada apartado es una categoría. Abre uno, corrige autor, tema, año o
            enlace (errores chiquitos incluidos) y guarda. También puedes agregar
            o quitar filas.
          </p>
        </div>
        <RefreshSheetsButton />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted">
            Trabajos
          </p>
          <p className="mt-1 font-display text-3xl">{publications.length}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted">
            Editables en Sheets
          </p>
          <p className="mt-1 font-display text-3xl">{totalEditable}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-[11px] uppercase tracking-wide text-muted">
            Fuentes
          </p>
          <p className="mt-2 line-clamp-3 text-sm text-muted">
            {sheetsLoad.sources?.join(", ") || "—"}
          </p>
        </div>
      </div>

      <nav
        aria-label="Ir a categoría"
        className="mt-6 flex flex-wrap gap-2 rounded-2xl border border-border bg-oh-stone/40 p-3 dark:bg-white/[0.03]"
      >
        {sections.map(({ cat, rows }) => (
          <a
            key={cat.slug}
            href={`#cat-${cat.slug}`}
            className="inline-flex min-h-10 items-center rounded-full border border-border bg-card px-3.5 text-sm transition hover:border-oh-blue hover:text-oh-blue"
            style={{ touchAction: "manipulation" }}
          >
            {cat.name}
            <span className="ml-1.5 text-muted">({rows.length})</span>
          </a>
        ))}
      </nav>

      <p className="mt-4 text-xs text-muted">
        Para guardar, la cuenta de servicio necesita permiso de{" "}
        <strong>Editor</strong> en el Google Sheet. Tres mundos (cronología) no
        se edita aquí.
      </p>

      {sheetsLoad.error && publications.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
          <h2 className="font-display text-2xl">Sin datos de Sheets</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            {sheetsLoad.error}
          </p>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {sections.map(({ cat, tabTitle, temaLabel, rows }, index) => (
          <AdminCategorySection
            key={cat.slug}
            id={`cat-${cat.slug}`}
            name={cat.name}
            accent={cat.accent}
            tabTitle={tabTitle}
            temaLabel={temaLabel}
            rows={rows}
            defaultOpen={index === firstWithContent || firstWithContent < 0}
          />
        ))}
      </div>

      {otherPubs.length > 0 ? (
        <section className="mt-10 rounded-2xl border border-dashed border-border p-5">
          <h2 className="font-display text-xl">Otras entradas</h2>
          <p className="mt-1 text-sm text-muted">
            No pertenecen a las categorías editables del catálogo.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {otherPubs.map((p) => (
              <li key={p.id}>
                <a
                  href={`/publicacion/${p.slug}`}
                  className="text-oh-blue hover:underline"
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
