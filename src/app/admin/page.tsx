import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RefreshSheetsButton } from "@/components/admin/RefreshSheetsButton";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { canAccessAdmin, getSession, listUsers } from "@/lib/auth/session";
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
  const fromSheets = publications.filter((p) => p.source === "google-sheets").length;
  const openReports = forum.reports.filter((r) => r.status === "open").length;

  const cards = [
    {
      href: "/admin/publicaciones",
      title: "Publicaciones",
      desc: `${published} publicadas · ${fromSheets} desde Sheets`,
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
          <Link
            key={card.href}
            href={card.href}
            className="rounded-md border border-border bg-card p-5 transition duration-300 hover:-translate-y-0.5 hover:border-oh-blue/40"
          >
            <h2 className="font-display text-xl">{card.title}</h2>
            <p className="mt-2 text-sm text-muted">{card.desc}</p>
          </Link>
        ))}
      </div>

      <section className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Flujo editorial</h2>
          <p className="mt-2 text-sm text-muted">
            Borrador → En revisión → Aprobado → Publicado. Las filas de Sheets
            entran como fichas con página completa (ver / descargar).
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {[
              "draft",
              "in_review",
              "approved",
              "published",
              "rejected",
              "archived",
            ].map((status) => (
              <span
                key={status}
                className="rounded-sm bg-oh-stone px-3 py-1 dark:bg-white/10"
              >
                {status}:{" "}
                {publications.filter((p) => p.status === status).length}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-md border border-border bg-card p-6">
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
            <li>Pestañas: {diagnostic.sheetTitles.join(", ") || "—"}</li>
            <li>Eventos cronología: {diagnostic.timelineEventCount}</li>
            <li>Publicaciones convertidas: {diagnostic.convertedCount}</li>
          </ul>
          <Link
            href="/admin/diagnostico"
            className="mt-4 inline-block text-sm text-oh-blue hover:underline"
          >
            Abrir diagnóstico completo →
          </Link>
        </div>
      </section>
    </div>
  );
}
