import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { canAccessAdmin, getSession, listUsers } from "@/lib/auth/session";
import { getAllPublications } from "@/lib/data/repository";
import { getForumData } from "@/lib/forum/store";
import { getSheetsConfig } from "@/lib/data/providers/sheets";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) redirect("/acceder");

  const [publications, forum] = await Promise.all([
    getAllPublications(user.role),
    getForumData(),
  ]);
  const sheets = getSheetsConfig();
  const users = listUsers();
  const published = publications.filter((p) => p.status === "published").length;
  const demos = publications.filter((p) => p.isDemo).length;
  const openReports = forum.reports.filter((r) => r.status === "open").length;

  const cards = [
    {
      href: "/admin/publicaciones",
      title: "Publicaciones",
      desc: `${published} publicadas · ${demos} demo`,
    },
    {
      href: "/admin/foro",
      title: "Moderación del foro",
      desc: `${openReports} reportes abiertos · ${forum.posts.length} debates`,
    },
    {
      href: "/admin/usuarios",
      title: "Usuarios",
      desc: `${users.length} cuentas demo registradas`,
    },
    {
      href: "/admin/diagnostico",
      title: "Diagnóstico Google Sheets",
      desc: sheets.enabled ? "Integración habilitada" : "Pendiente de credenciales",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Administración" }]} />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
        Panel de administración
      </h1>
      <p className="mt-2 text-muted">
        Hola, {user.name}. Rol: {user.role}. Las operaciones sensibles se
        validan en servidor.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-border bg-card p-5 transition hover:border-oh-blue/40"
          >
            <h2 className="font-display text-xl">{card.title}</h2>
            <p className="mt-2 text-sm text-muted">{card.desc}</p>
          </Link>
        ))}
      </div>
      <section className="mt-10 rounded-2xl border border-border bg-card p-6">
        <h2 className="font-display text-2xl">Flujo editorial</h2>
        <p className="mt-2 text-sm text-muted">
          Borrador → En revisión → Aprobado → Publicado. Los contenidos demo
          pueden retirarse desde el listado de publicaciones.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {["draft", "in_review", "approved", "published", "rejected", "archived"].map(
            (status) => (
              <span
                key={status}
                className="rounded-full bg-oh-stone px-3 py-1 dark:bg-white/10"
              >
                {status}:{" "}
                {publications.filter((p) => p.status === status).length}
              </span>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
