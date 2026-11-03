import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RefreshSheetsButton } from "@/components/admin/RefreshSheetsButton";
import { SheetRowEditor } from "@/components/admin/SheetRowEditor";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import { getCategory } from "@/lib/categories";
import { getAllPublications } from "@/lib/data/repository";
import { loadPublicationsFromSheets } from "@/lib/data/providers/sheets";
import { categorySlugFromTabTitle } from "@/lib/data/adapters/sheet-aliases";

export const metadata: Metadata = {
  title: "Admin · Publicaciones",
  robots: { index: false, follow: false },
};

export default async function AdminPublicacionesPage() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) redirect("/acceder");

  const [publications, sheetsLoad] = await Promise.all([
    getAllPublications(user.role),
    loadPublicationsFromSheets(),
  ]);

  const byTab = new Map<string, typeof publications>();
  for (const pub of publications) {
    const tab = pub.sheetsTab || "Sin pestaña";
    const list = byTab.get(tab) ?? [];
    list.push(pub);
    byTab.set(tab, list);
  }

  const tabsForAppend = [...byTab.keys()].filter(
    (t) => t !== "Sin pestaña" && categorySlugFromTabTitle(t),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Administración", href: "/admin" },
          { label: "Publicaciones" },
        ]}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
            Publicaciones · Sheets
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Formato del colegio: cada categoría es una pestaña con{" "}
            <strong>Autor · Tema/Género · Año · Enlace</strong>. Aquí agregas,
            editas o quitas filas. El enlace puede ser PDF, Drive público,
            imagen, video o YouTube. Para vista previa limpia, sube el archivo a
            la carpeta pública de Ágora.
          </p>
        </div>
        <RefreshSheetsButton />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Trabajos</p>
          <p className="mt-1 font-display text-2xl">{publications.length}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Pestañas</p>
          <p className="mt-1 font-display text-2xl">{byTab.size}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Fuentes</p>
          <p className="mt-1 text-sm text-muted">
            {sheetsLoad.sources?.join(", ") || "—"}
          </p>
        </div>
      </div>

      <section className="mt-6 rounded-md border border-border bg-oh-stone/40 p-4 text-sm dark:bg-white/[0.03]">
        <p className="font-medium">Estructura detectada en Google Sheets</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          <li>
            <code>Taller de letras</code>: Autor, Género, Año, Enlace
          </li>
          <li>
            Resto de categorías: Autor, Tema, Año, Enlace (Arte usa
            Clasificación)
          </li>
          <li>
            <code>Tres Mundos, una historia</code>: cronología (no se edita aquí)
          </li>
        </ul>
        <p className="mt-2 text-muted">
          Para guardar cambios, la cuenta de servicio debe tener permiso de{" "}
          <strong>editor</strong> en el spreadsheet.
        </p>
      </section>

      {publications.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border px-6 py-12 text-center">
          <h2 className="font-display text-2xl">Sin trabajos todavía</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            {sheetsLoad.error ||
              "Agrega filas en las pestañas de categoría del spreadsheet y pulsa Actualizar."}
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {[...byTab.entries()].map(([tab, pubs]) => (
            <section key={tab}>
              <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
                {tab}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {pubs.length} trabajo{pubs.length === 1 ? "" : "s"}
              </p>
              <ul className="mt-4 space-y-4">
                {pubs.map((pub) => {
                  const author =
                    pub.authors.find((a) => a.nameVisible)?.displayName || "";
                  const tema =
                    pub.subject ||
                    pub.tags[0] ||
                    pub.title.replace(/\s+de\s+.+$/, "");
                  return (
                    <li
                      key={pub.id}
                      className="rounded-md border border-border bg-card p-4"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex flex-wrap gap-2">
                            <Badge>
                              {getCategory(pub.primaryCategory).name}
                            </Badge>
                            {pub.schoolYear ? (
                              <Badge tone="muted">{pub.schoolYear}</Badge>
                            ) : null}
                          </div>
                          <h3 className="mt-2 font-display text-xl">
                            <Link
                              href={`/publicacion/${pub.slug}`}
                              className="hover:text-oh-blue"
                            >
                              {pub.title}
                            </Link>
                          </h3>
                          <p className="text-sm text-muted">
                            {author}
                            {pub.sheetsRowNumber
                              ? ` · fila ${pub.sheetsRowNumber}`
                              : ""}
                          </p>
                        </div>
                        {author ? (
                          <Link
                            href={`/alumno/${pub.authors[0]?.studentId || ""}`}
                            className="text-sm text-oh-blue hover:underline"
                          >
                            Ver portafolio →
                          </Link>
                        ) : null}
                      </div>
                      {pub.sheetsTab && pub.sheetsRowNumber ? (
                        <SheetRowEditor
                          tabTitle={pub.sheetsTab}
                          rowNumber={pub.sheetsRowNumber}
                          initial={{
                            autor: author,
                            tema,
                            anio: pub.schoolYear || "",
                            enlace: pub.media[0]?.url || "",
                          }}
                        />
                      ) : (
                        <p className="text-xs text-muted">
                          Esta entrada no tiene fila editable en Sheets.
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>

              {categorySlugFromTabTitle(tab) ? (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium">Agregar trabajo a {tab}</p>
                  <SheetRowEditor tabTitle={tab} mode="append" />
                </div>
              ) : null}
            </section>
          ))}
        </div>
      )}

      {tabsForAppend.length === 0 && publications.length === 0 ? null : null}
    </div>
  );
}
