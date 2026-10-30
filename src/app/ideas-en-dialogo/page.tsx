import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { getSession } from "@/lib/auth/session";
import { listCommunities, listPosts } from "@/lib/forum/store";

export const metadata: Metadata = {
  title: "Ideas en diálogo",
  description: "Comunidad de discusión escolar de Ágora.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function IdeasEnDialogoPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sort = (param(sp.sort) as "recent" | "popular" | "commented") || "recent";
  const q = param(sp.q) ?? "";
  const communityId = param(sp.community) ?? "";
  const tag = param(sp.tag) ?? "";

  const user = await getSession();
  const [communities, posts] = await Promise.all([
    listCommunities(),
    listPosts({ sort, query: q, communityId: communityId || undefined, tag }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Ideas en diálogo" }]} />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-serif text-4xl text-petrol dark:text-ivory">
            Ideas en diálogo
          </h1>
          <p className="mt-3 text-muted">
            Comunidad interactiva con publicaciones, comentarios anidados,
            votos, espacios temáticos y moderación. Inspirada en la
            funcionalidad de foros escolares, con la identidad de Ágora.
          </p>
        </div>
        {user ? (
          <Badge>Participas como {user.role}</Badge>
        ) : (
          <Button href="/acceder" variant="secondary">
            Acceder para participar
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-medium">Espacios</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/ideas-en-dialogo" className="hover:text-gold">
                  Todos
                </Link>
              </li>
              {communities.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/ideas-en-dialogo?community=${c.id}`}
                    className="hover:text-gold"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted">
            <p className="font-medium text-foreground">Normas</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>Respeta a la comunidad escolar</li>
              <li>Cita fuentes cuando corresponda</li>
              <li>No hay mensajes privados entre alumnos por defecto</li>
              <li>Reporta abusos a moderación</li>
            </ul>
          </div>
        </aside>

        <div>
          <form className="mb-6 flex flex-wrap gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Buscar en el foro"
              className="min-w-[200px] flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="recent">Recientes</option>
              <option value="popular">Populares</option>
              <option value="commented">Más comentados</option>
            </select>
            {communityId ? (
              <input type="hidden" name="community" value={communityId} />
            ) : null}
            <Button type="submit" size="sm">
              Filtrar
            </Button>
          </form>

          {user ? (
            <NewPostForm
              communities={communities}
              defaultCommunityId={communityId || communities[0]?.id}
            />
          ) : null}

          <ul className="mt-6 space-y-3">
            {posts.map((post) => {
              const community = communities.find((c) => c.id === post.communityId);
              return (
                <li
                  key={post.id}
                  className="rounded-xl border border-border bg-card p-5 transition hover:border-gold/40"
                >
                  <div className="flex gap-4">
                    <div className="w-12 text-center text-sm">
                      <p className="font-semibold text-petrol dark:text-gold">
                        {post.score}
                      </p>
                      <p className="text-xs text-muted">pts</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap gap-2">
                        {post.pinned ? <Badge tone="gold">Fijado</Badge> : null}
                        {post.locked ? <Badge tone="muted">Cerrado</Badge> : null}
                        {post.isDemo ? <Badge tone="demo">Demo</Badge> : null}
                        {community ? (
                          <Badge tone="muted">{community.name}</Badge>
                        ) : null}
                      </div>
                      <Link
                        href={`/ideas-en-dialogo/${post.slug}`}
                        className="font-serif text-xl text-petrol hover:text-gold dark:text-ivory"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-2 line-clamp-2 text-sm text-muted">
                        {post.body}
                      </p>
                      <p className="mt-3 text-xs text-muted">
                        {post.authorName} · {post.commentCount} comentarios ·{" "}
                        {new Date(post.createdAt).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
