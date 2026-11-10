import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ForumModerationPanel } from "@/components/admin/ForumModerationPanel";
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
  const openReports = forum.reports.filter((r) => r.status === "open");
  const posts = forum.posts.slice(0, 40).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    score: p.score,
    commentCount: p.commentCount,
    pinned: p.pinned,
    locked: p.locked,
    authorName: p.authorName,
  }));

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
        Si alguien escribe algo pesado o inapropiado: bórralo aquí (reportes o
        lista de debates). Para borrar trabajos del catálogo (Sheets): Admin →
        Editar por categoría → Borrar publicación.
      </p>

      {!canModerate(user.role) ? (
        <p className="mt-6 text-sm text-muted">
          Tu rol puede ver el panel, pero borrar requiere moderador o
          administrador.
        </p>
      ) : (
        <div className="mt-8">
          <ForumModerationPanel reports={openReports} posts={posts} />
        </div>
      )}
    </div>
  );
}
