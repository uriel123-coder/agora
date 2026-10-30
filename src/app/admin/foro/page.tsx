import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { canAccessAdmin, canModerate, getSession } from "@/lib/auth/session";
import { getForumData } from "@/lib/forum/store";

export const metadata: Metadata = {
  title: "Admin · Foro",
  robots: { index: false, follow: false },
};

export default async function AdminForoPage() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) redirect("/acceder");
  const forum = await getForumData();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Administración", href: "/admin" },
          { label: "Foro" },
        ]}
      />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
        Moderación · Ideas en diálogo
      </h1>
      <p className="mt-2 text-muted">
        Reportes y debates. Acciones de fijar/cerrar están disponibles en cada
        publicación para roles de moderación.
      </p>

      <section className="mt-8">
        <h2 className="font-display text-2xl">Reportes abiertos</h2>
        {forum.reports.filter((r) => r.status === "open").length === 0 ? (
          <p className="mt-3 text-sm text-muted">No hay reportes abiertos.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {forum.reports
              .filter((r) => r.status === "open")
              .map((r) => (
                <li
                  key={r.id}
                  className="rounded-xl border border-border bg-card p-4 text-sm"
                >
                  <Badge>{r.targetType}</Badge>
                  <p className="mt-2">{r.reason}</p>
                  <p className="mt-1 text-muted">
                    {r.targetId} · {new Date(r.createdAt).toLocaleString("es-MX")}
                  </p>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl">Debates recientes</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {forum.posts.slice(0, 20).map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2">
              <Link
                href={`/ideas-en-dialogo/${p.slug}`}
                className="text-oh-blue hover:underline"
              >
                {p.title}
              </Link>
              {p.pinned ? <Badge tone="gold">Fijado</Badge> : null}
              {p.locked ? <Badge tone="muted">Cerrado</Badge> : null}
              <span className="text-muted">
                {p.score} pts · {p.commentCount} comentarios
              </span>
            </li>
          ))}
        </ul>
        {!canModerate(user.role) ? (
          <p className="mt-4 text-sm text-muted">
            Tu rol puede revisar el panel, pero la moderación activa requiere
            moderador o administrador.
          </p>
        ) : null}
      </section>
    </div>
  );
}
