"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { SessionUser } from "@/lib/types/content";
import { canModerate } from "@/lib/auth/client-roles";

export function PostActions({
  postId,
  slug,
  authorId,
  pinned,
  locked,
  saved,
  user,
}: {
  postId: string;
  slug: string;
  authorId: string;
  pinned: boolean;
  locked: boolean;
  saved: boolean;
  user: SessionUser | null;
}) {
  const router = useRouter();
  if (!user) {
    return (
      <div className="mt-6">
        <Button href="/acceder" size="sm" variant="secondary">
          Acceder para guardar, votar o reportar
        </Button>
      </div>
    );
  }

  async function save() {
    await fetch("/api/forum/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    router.refresh();
  }

  async function report() {
    const reason = window.prompt("Motivo del reporte");
    if (!reason) return;
    await fetch("/api/forum/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetType: "post",
        targetId: postId,
        reason,
      }),
    });
    alert("Reporte enviado a moderación.");
  }

  async function moderate(patch: { pinned?: boolean; locked?: boolean }) {
    await fetch("/api/forum/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, ...patch }),
    });
    router.refresh();
  }

  async function remove() {
    if (!window.confirm("¿Eliminar esta publicación?")) return;
    await fetch("/api/forum/posts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    router.push("/ideas-en-dialogo");
    router.refresh();
  }

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/ideas-en-dialogo/${slug}`
      : `/ideas-en-dialogo/${slug}`;

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <Button type="button" size="sm" variant="secondary" onClick={save}>
        {saved ? "Quitar de guardados" : "Guardar"}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        onClick={() => navigator.clipboard.writeText(shareUrl)}
      >
        Copiar enlace
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={report}>
        Reportar
      </Button>
      {(user.id === authorId || canModerate(user.role)) && (
        <Button type="button" size="sm" variant="ghost" onClick={remove}>
          Eliminar
        </Button>
      )}
      {canModerate(user.role) ? (
        <>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => moderate({ pinned: !pinned })}
          >
            {pinned ? "Desfijar" : "Fijar"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => moderate({ locked: !locked })}
          >
            {locked ? "Reabrir" : "Cerrar debate"}
          </Button>
        </>
      ) : null}
    </div>
  );
}
