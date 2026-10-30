import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RefreshSheetsButton } from "@/components/admin/RefreshSheetsButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import { getAllPublications } from "@/lib/data/repository";
import { loadPublicationsFromSheets } from "@/lib/data/providers/sheets";
import { getCategory } from "@/lib/categories";

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

  const published = publications.filter((p) => p.status === "published");
  const fromSheets = publications.filter((p) => p.source === "google-sheets");

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
            Publicaciones
          </h1>
          <p className="mt-2 max-w-2xl text-muted">
            Biblioteca editorial: cada fila de Sheets se convierte en un
            cuadrito y una página completa (texto, imagen, documento,
            descarga).
          </p>
        </div>
        <RefreshSheetsButton />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">En catálogo</p>
          <p className="mt-1 font-display text-2xl">{publications.length}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Publicadas</p>
          <p className="mt-1 font-display text-2xl">{published.length}</p>
        </div>
        <div className="rounded-md border border-border bg-card p-4">
          <p className="text-xs uppercase tracking-wide text-muted">Desde Sheets</p>
          <p className="mt-1 font-display text-2xl">{fromSheets.length}</p>
        </div>
      </div>

      <section className="mt-6 rounded-md border border-border bg-oh-stone/40 p-4 text-sm dark:bg-white/[0.03]">
        <p className="font-medium text-oh-ink dark:text-foreground">
          Cómo cargar contenido (formato flexible)
        </p>
        <p className="mt-2 text-muted">
          Crea la pestaña <strong>Publicaciones</strong> o una pestaña con el
          nombre de la categoría (ej. «Taller de letras»). Columnas mínimas
          recomendadas: <code>nombre</code> o <code>titulo</code>,{" "}
          <code>descripcion</code>, <code>archivo</code> o <code>imagen</code>{" "}
          (URL), <code>alumno</code>, <code>categoria</code> (slug). Cuando
          definan el formato final lo afinamos; Ágora ya entiende alias en
          español.
        </p>
        {sheetsLoad.error ? (
          <p className="mt-2 text-amber-800 dark:text-amber-200">
            Sheets: {sheetsLoad.error}
          </p>
        ) : (
          <p className="mt-2 text-muted">
            Fuentes leídas:{" "}
            {sheetsLoad.sources?.length
              ? sheetsLoad.sources.join(", ")
              : "ninguna aún"}
            .
          </p>
        )}
      </section>

      {publications.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-border px-6 py-12 text-center">
          <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
            Todavía no hay publicaciones
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
            La conexión a Sheets funciona (cronología OK). Cuando carguen filas
            en Publicaciones o en pestañas por categoría, aparecerán aquí como
            fichas.
          </p>
          <Link
            href="/admin/diagnostico"
            className="mt-4 inline-block text-sm text-oh-blue hover:underline"
          >
            Ver diagnóstico de Sheets →
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publications.map((pub) => {
            const category = getCategory(pub.primaryCategory);
            return (
              <article
                key={pub.id}
                className="overflow-hidden rounded-md border border-border bg-card"
              >
                <div className="relative aspect-[16/10] bg-oh-stone">
                  {pub.coverImage ? (
                    <Image
                      src={pub.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="320px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted">
                      Sin portada · {pub.media.length} recurso
                      {pub.media.length === 1 ? "" : "s"}
                    </div>
                  )}
                </div>
                <div className="space-y-2 p-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge>{category.name}</Badge>
                    <Badge tone="muted">{pub.status}</Badge>
                    <Badge tone="muted">{pub.source}</Badge>
                  </div>
                  <h2 className="font-display text-lg leading-snug">
                    <Link
                      href={`/publicacion/${pub.slug}`}
                      className="hover:text-oh-blue"
                    >
                      {pub.title}
                    </Link>
                  </h2>
                  <p className="line-clamp-2 text-sm text-muted">{pub.summary}</p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
