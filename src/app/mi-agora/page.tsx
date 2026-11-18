import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getSession, canAccessAdmin } from "@/lib/auth/session";
import { getForumData, listPosts } from "@/lib/forum/store";

export const metadata: Metadata = {
  title: "Mi Ágora",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function MiAgoraPage() {
  const user = await getSession();
  if (!user) redirect("/acceder");

  const [forum, posts] = await Promise.all([
    getForumData(),
    listPosts({ sort: "recent" }),
  ]);

  const myPosts = posts.filter((p) => p.authorId === user.id);
  const savedIds = forum.savedPostIdsByUser[user.id] ?? [];
  const saved = posts.filter((p) => savedIds.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Mi Ágora" }]} />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
            Mi Ágora
          </h1>
          <p className="mt-2 text-muted">
            {user.name} · {user.role}
          </p>
        </div>
        <div className="flex gap-2">
          {canAccessAdmin(user.role) ? (
            <Button href="/admin" variant="secondary">
              Administración
            </Button>
          ) : null}
          <LogoutButton />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Debates en los que participas</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {myPosts.length === 0 ? (
              <li className="text-muted">Aún no has publicado en el foro.</li>
            ) : (
              myPosts.map((p) => (
                <li key={p.id}>
                  <a
                    href={`/ideas-en-dialogo/${p.slug}`}
                    className="text-oh-blue hover:underline"
                  >
                    {p.title}
                  </a>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Publicaciones guardadas</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {saved.length === 0 ? (
              <li className="text-muted">No hay debates guardados.</li>
            ) : (
              saved.map((p) => (
                <li key={p.id}>
                  <a
                    href={`/ideas-en-dialogo/${p.slug}`}
                    className="text-oh-blue hover:underline"
                  >
                    {p.title}
                  </a>
                </li>
              ))
            )}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-6 lg:col-span-2">
          <h2 className="font-display text-2xl">Preferencias</h2>
          <p className="mt-3 text-sm text-muted">
            Usa el interruptor de tema en el encabezado para modo claro/oscuro.
          </p>
          <Button href="/ideas-en-dialogo" className="mt-4" variant="secondary">
            Ir a Ideas en diálogo
          </Button>
        </section>
      </div>
    </div>
  );
}
