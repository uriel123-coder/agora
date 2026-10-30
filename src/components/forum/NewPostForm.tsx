"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ForumCommunity } from "@/lib/forum/store";

export function NewPostForm({
  communities,
  defaultCommunityId,
}: {
  communities: ForumCommunity[];
  defaultCommunityId?: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [communityId, setCommunityId] = useState(
    defaultCommunityId || communities[0]?.id || "",
  );
  const [tags, setTags] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/forum/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        body,
        communityId,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        linkUrl: linkUrl || undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "No se pudo publicar");
      return;
    }
    setTitle("");
    setBody("");
    setTags("");
    setLinkUrl("");
    router.push(`/ideas-en-dialogo/${data.post.slug}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-3 rounded-xl border border-border bg-card p-5"
    >
      <h2 className="font-display text-xl">Nueva publicación</h2>
      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
        className="w-full rounded-md border border-border bg-background px-3 py-2"
      />
      <textarea
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Texto del debate"
        rows={4}
        className="w-full rounded-md border border-border bg-background px-3 py-2"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2"
        >
          {communities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Etiquetas (separadas por coma)"
          className="rounded-md border border-border bg-background px-3 py-2"
        />
      </div>
      <input
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        placeholder="Enlace opcional"
        className="w-full rounded-md border border-border bg-background px-3 py-2"
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button type="submit" disabled={loading}>
        {loading ? "Publicando…" : "Publicar"}
      </Button>
    </form>
  );
}
