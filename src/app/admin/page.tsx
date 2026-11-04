import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RefreshSheetsButton } from "@/components/admin/RefreshSheetsButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { canAccessAdmin, getSession, listUsers } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
import { getAllPublications } from "@/lib/data/repository";
import { getForumData } from "@/lib/forum/store";
import {
  diagnoseSheetsConnection,
  getSheetsConfig,
} from "@/lib/data/providers/sheets";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) redirect("/acceder");

  const [publications, forum, diagnostic] = await Promise.all([
    getAllPublications(user.role),
    getForumData(),
    diagnoseSheetsConnection(),
  ]);
  const sheets = getSheetsConfig();
  const users = listUsers();
  const published = publications.filter((p) => p.status === "published").length;
  const fromSheets = publications.filter(
    (p) => p.source === "google-sheets",
  ).length;
  const openReports = forum.reports.filter((r) => r.status === "open").length;

  const catalogCategories = CATEGORIES.filter(
    (c) => c.slug !== "tres-mundos-una-historia",
  );

  const cards = [
    {
      href: "/admin/publicaciones",
      title: "Editar por categoría",
      desc: `${published} publicadas · ${fromSheets} desde Sheets`,
      primary: true,
    },
    {
      href: "/admin/foro",
      title: "Moderación del foro",
      desc: `${openReports} reportes · ${forum.posts.length} debates`,
    },
    {
      href: "/admin/usuarios",
      title: "Usuarios",
      desc: `${users.length} cuentas`,
    },
    {
      href: "/admin/diagnostico",
      title: "Diagnóstico Sheets",
      desc: diagnostic.canReadSheet
        ? `OK · ${diagnostic.timelineEventCount} eventos · ${diagnostic.convertedCount} pubs`
        : sheets.enabled
          ? "Requiere atención"
          : "Deshabilitado",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Administración" }]} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
            Panel de administración
          </h1>
          <p className="mt-2 text-muted">
            Hola, {user.name}. Rol: {user.role}.
          </p>
        </div>
        <RefreshSheetsButton />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className={`rounded-2xl border p-5 transition hover:border-oh-blue/40 ${
              card.primary
                ? "border-oh-blue/30 bg-oh-blue/5 dark:bg-oh-blue/10"
                : "border-border bg-card"
            }`}
            style={{ touchAction: "manipulation" }}
          >
            <h2 className="font-display text-xl">{card.title}</h2>
            <p className="mt-2 text-sm text-muted">{card.desc}</p>
          </a>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
              Ir a una categoría
            </h2>
            <p className="mt-1 text-sm text-muted">
              Abre el apartado para corregir o agregar trabajos.
            </p>
          </div>
          <a
            href="/admin/publicaciones"
            className="text-sm text-oh-blue hover:underline"
          >
            Ver todo el editor →
          </a>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {catalogCategories.map((cat) => {
            const count = publications.filter(
              (p) => p.primaryCategory === cat.slug,
            ).length;
            return (
              <a
                key={cat.slug}
                href={`/admin/publicaciones#cat-${cat.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition hover:border-oh-blue/40"
                style={{ touchAction: "manipulation" }}
              >
                <span
                  className="h-8 w-1.5 shrink-0 rounded-full"
                  style={{ background: cat.accent }}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base leading-snug">
                    {cat.name}
                  </span>
                  <span className="text-xs text-muted">
                    {count} trabajo{count === 1 ? "" : "s"}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Cómo editar</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted">
            <li>Elige una categoría.</li>
            <li>Pulsa «Editar / corregir» en el trabajo.</li>
            <li>Arregla autor, tema, año o enlace y guarda.</li>
            <li>
              Si no aparece, usa «Actualizar desde Sheets» arriba.
            </li>
          </ol>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Google Sheets</h2>
          <ul className="mt-3 space-y-1 text-sm text-muted">
            <li>
              Estado:{" "}
              {diagnostic.canReadSheet ? (
                <span className="text-emerald-700 dark:text-emerald-300">
                  conectado
                </span>
              ) : (
                <span className="text-amber-700">revisar</span>
              )}
            </li>
            <li>Auth: {diagnostic.authMode}</li>
            <li>
              Pestañas: {diagnostic.sheetTitles.slice(0, 6).join(", ") || "—"}
              {diagnostic.sheetTitles.length > 6 ? "…" : ""}
            </li>
            <li>Eventos cronología: {diagnostic.timelineEventCount}</li>
            <li>Publicaciones convertidas: {diagnostic.convertedCount}</li>
          </ul>
          <a
            href="/admin/diagnostico"
            className="mt-4 inline-block text-sm text-oh-blue hover:underline"
          >
            Abrir diagnóstico completo →
          </a>
        </div>
      </section>
    </div>
  );
}
