import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { CommentThread } from "@/components/forum/CommentThread";
import { VoteButtons } from "@/components/forum/VoteButtons";
import { PostActions } from "@/components/forum/PostActions";
import { getSession } from "@/lib/auth/session";
import {
  getCommentsForPost,
  getForumData,
  getPostBySlug,
  listCommunities,
} from "@/lib/forum/store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return {
    title: post?.title ?? "Debate",
    robots: { index: true, follow: true },
  };
}

export default async function ForumPostPage({ params }: Props) {
  const { slug } = await params;
  const user = await getSession();
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [comments, communities, forum] = await Promise.all([
    getCommentsForPost(post.id),
    listCommunities(),
    getForumData(),
  ]);
  const community = communities.find((c) => c.id === post.communityId);
  const saved = (forum.savedPostIdsByUser[user?.id ?? ""] ?? []).includes(
    post.id,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Ideas en diálogo", href: "/ideas-en-dialogo" },
          { label: post.title },
        ]}
      />
      <article className="rounded-2xl border border-border bg-card p-6">
        <div className="flex gap-4">
          <VoteButtons
            targetType="post"
            targetId={post.id}
            score={post.score}
            disabled={!user || Boolean(user.suspended)}
          />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap gap-2">
              {post.pinned ? <Badge tone="gold">Fijado</Badge> : null}
              {post.locked ? <Badge tone="muted">Debate cerrado</Badge> : null}
              {community ? <Badge tone="muted">{community.name}</Badge> : null}
              {post.isDemo ? <Badge tone="demo">Demo</Badge> : null}
            </div>
            <h1 className="font-display text-3xl text-oh-ink dark:text-foreground">
              {post.title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {post.authorName} ·{" "}
              {new Date(post.createdAt).toLocaleString("es-MX")}
            </p>
            <div className="mt-6 whitespace-pre-wrap leading-relaxed">
              {post.body}
            </div>
            {post.linkUrl ? (
              <p className="mt-4 text-sm">
                Enlace:{" "}
                <Link href={post.linkUrl} className="text-oh-blue hover:underline">
                  {post.linkUrl}
                </Link>
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/ideas-en-dialogo?tag=${encodeURIComponent(tag)}`}
                >
                  <Badge tone="muted">#{tag}</Badge>
                </Link>
              ))}
            </div>
            <PostActions
              postId={post.id}
              slug={post.slug}
              authorId={post.authorId}
              pinned={post.pinned}
              locked={post.locked}
              saved={saved}
              user={user}
            />
          </div>
        </div>
      </article>

      <CommentThread
        postId={post.id}
        comments={comments}
        locked={post.locked}
        user={user}
      />
    </div>
  );
}
