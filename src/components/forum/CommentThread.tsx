"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { VoteButtons } from "@/components/forum/VoteButtons";
import type { ForumComment } from "@/lib/forum/store";
import type { SessionUser } from "@/lib/types/content";

export function CommentThread({
  postId,
  comments,
  locked,
  user,
}: {
  postId: string;
  comments: ForumComment[];
  locked: boolean;
  user: SessionUser | null;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [error, setError] = useState("");

  const tree = useMemo(() => {
    const byParent = new Map<string | null, ForumComment[]>();
    for (const c of comments) {
      const key = c.parentId;
      const list = byParent.get(key) ?? [];
      list.push(c);
      byParent.set(key, list);
    }
    return byParent;
  }, [comments]);

  async function submit(parentId: string | null) {
    if (!user) return;
    setError("");
    const res = await fetch("/api/forum/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, parentId, body }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "No se pudo comentar");
      return;
    }
    setBody("");
    setReplyTo(null);
    router.refresh();
  }

  function renderNodes(parentId: string | null, depth = 0): React.ReactNode {
    const nodes = tree.get(parentId) ?? [];
    return nodes.map((comment) => (
      <div
        key={comment.id}
        className="mt-4 border-l border-border pl-4"
        style={{ marginLeft: depth ? 8 : 0 }}
      >
        <div className="flex gap-3">
          <VoteButtons
            targetType="comment"
            targetId={comment.id}
            score={comment.score}
            disabled={!user}
          />
          <div>
            <p className="text-sm font-medium">{comment.authorName}</p>
            <p className="mt-1 text-sm leading-relaxed">{comment.body}</p>
            <div className="mt-2 flex gap-3 text-xs text-muted">
              <time>{new Date(comment.createdAt).toLocaleString("es-MX")}</time>
              {user && !locked ? (
                <button
                  type="button"
                  className="hover:text-oh-blue"
                  onClick={() => setReplyTo(comment.id)}
                >
                  Responder
                </button>
              ) : null}
            </div>
            {replyTo === comment.id ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => submit(comment.id)}
                >
                  Enviar respuesta
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        {renderNodes(comment.id, depth + 1)}
      </div>
    ));
  }

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
        Comentarios ({comments.length})
      </h2>
      {user && !locked ? (
        <div className="mt-4 space-y-2 rounded-xl border border-border bg-card p-4">
          <textarea
            value={replyTo ? "" : body}
            onChange={(e) => {
              setReplyTo(null);
              setBody(e.target.value);
            }}
            rows={4}
            placeholder="Escribe un comentario…"
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          <Button type="button" onClick={() => submit(null)}>
            Comentar
          </Button>
        </div>
      ) : locked ? (
        <p className="mt-4 text-sm text-muted">Este debate está cerrado.</p>
      ) : (
        <p className="mt-4 text-sm text-muted">
          <a href="/acceder" className="text-oh-blue hover:underline">
            Accede
          </a>{" "}
          para comentar.
        </p>
      )}
      <div className="mt-6">{renderNodes(null)}</div>
    </section>
  );
}
