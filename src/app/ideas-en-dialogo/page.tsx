import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Flame, Clock, ArrowUpRight } from "lucide-react";
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
    <div className="bg-[#f4f6f9] dark:bg-transparent">
      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
        <Breadcrumbs items={[{ label: "Ideas en diálogo" }]} />
      </div>
      <div className="border-y border-border bg-[#243746] text-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/55">
                Foro escolar
              </p>
              <h1 className="mt-2 font-display text-4xl sm:text-5xl">
                Ideas en diálogo
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
                Discute, pregunta y comparte con respeto. Votos, comentarios y
                espacios temáticos — como un foro vivo de Or Hajayim.
              </p>
            </div>
            {user ? (
              <Badge>Participas como {user.role}</Badge>
            ) : (
              <Button href="/acceder" variant="soft" size="sm">
                Acceder para participar
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <div className="rounded-md border border-border bg-card p-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
                Espacios
              </h2>
              <ul className="mt-3 space-y-1 text-sm">
                <li>
                  <Link
                    href="/ideas-en-dialogo"
                    className={`block rounded-sm px-2 py-1.5 transition hover:bg-oh-stone dark:hover:bg-white/5 ${
                      !communityId ? "bg-oh-stone font-medium text-oh-blue dark:bg-white/10" : ""
                    }`}
                  >
                    Todos
                  </Link>
                </li>
                {communities.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/ideas-en-dialogo?community=${c.id}`}
                      className={`block rounded-sm px-2 py-1.5 transition hover:bg-oh-stone dark:hover:bg-white/5 ${
                        communityId === c.id
                          ? "bg-oh-stone font-medium text-oh-blue dark:bg-white/10"
                          : ""
                      }`}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-border bg-card p-4 text-sm text-muted">
              <p className="font-medium text-foreground">Normas rápidas</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Respeta a la comunidad</li>
                <li>Cita fuentes si aplica</li>
                <li>Reporta abusos</li>
              </ul>
            </div>
          </aside>

          <div>
            <form className="mb-4 flex flex-wrap gap-2 rounded-md border border-border bg-card p-3">
              <input
                name="q"
                defaultValue={q}
                placeholder="Buscar debates…"
                className="min-w-[180px] flex-1 rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-oh-blue"
              />
              <div className="flex gap-1">
                {(
                  [
                    ["recent", "Recientes", Clock],
                    ["popular", "Populares", Flame],
                    ["commented", "Comentados", MessageSquare],
                  ] as const
                ).map(([value, label, Icon]) => (
                  <label
                    key={value}
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-sm border px-2.5 py-2 text-xs transition ${
                      sort === value
                        ? "border-oh-blue bg-oh-blue text-white"
                        : "border-border hover:border-oh-blue/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="sort"
                      value={value}
                      defaultChecked={sort === value}
                      className="sr-only"
                    />
                    <Icon className="h-3.5 w-3.5" />
                    {label}
                  </label>
                ))}
              </div>
              {communityId ? (
                <input type="hidden" name="community" value={communityId} />
              ) : null}
              <Button type="submit" size="sm">
                Aplicar
              </Button>
            </form>

            {user ? (
              <div className="mb-5 rounded-md border border-oh-blue/25 bg-card p-4 shadow-sm">
                <p className="mb-3 text-sm font-medium text-oh-ink dark:text-foreground">
                  ¿Qué quieres discutir hoy?
                </p>
                <NewPostForm
                  communities={communities}
                  defaultCommunityId={communityId || communities[0]?.id}
                />
              </div>
            ) : null}

            <ul className="space-y-3">
              {posts.length === 0 ? (
                <li className="rounded-md border border-dashed border-border bg-card px-5 py-10 text-center text-sm text-muted">
                  No hay debates todavía. Sé el primero en abrir uno.
                </li>
              ) : (
                posts.map((post) => {
                  const community = communities.find(
                    (c) => c.id === post.communityId,
                  );
                  return (
                    <li key={post.id}>
                      <Link
                        href={`/ideas-en-dialogo/${post.slug}`}
                        className="group flex gap-4 rounded-md border border-border bg-card p-4 transition duration-300 hover:-translate-y-0.5 hover:border-oh-blue/40 hover:shadow-[0_12px_28px_rgba(36,55,70,0.08)]"
                      >
                        <div className="flex w-12 flex-col items-center justify-start rounded-sm bg-oh-stone/80 py-2 dark:bg-white/5">
                          <span className="font-display text-lg text-oh-ink dark:text-oh-blue">
                            {post.score}
                          </span>
                          <span className="text-[10px] uppercase tracking-wide text-muted">
                            pts
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex flex-wrap gap-2">
                            {post.pinned ? (
                              <Badge tone="gold">Fijado</Badge>
                            ) : null}
                            {post.locked ? (
                              <Badge tone="muted">Cerrado</Badge>
                            ) : null}
                            {community ? (
                              <Badge tone="muted">{community.name}</Badge>
                            ) : null}
                          </div>
                          <h2 className="font-display text-xl text-oh-ink transition group-hover:text-oh-blue dark:text-foreground">
                            {post.title}
                          </h2>
                          <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                            {post.body}
                          </p>
                          <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
                            <span>{post.authorName}</span>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.commentCount}
                            </span>
                            <span aria-hidden>·</span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString(
                                "es-MX",
                              )}
                            </span>
                            <span className="ml-auto inline-flex items-center gap-1 text-oh-blue opacity-0 transition group-hover:opacity-100">
                              Abrir
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </span>
                          </p>
                        </div>
                      </Link>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
