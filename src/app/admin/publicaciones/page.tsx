import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import { getAllPublications } from "@/lib/data/repository";

export const metadata: Metadata = {
  title: "Admin · Publicaciones",
  robots: { index: false, follow: false },
};

export default async function AdminPublicacionesPage() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) redirect("/acceder");
  const publications = await getAllPublications(user.role);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Administración", href: "/admin" },
          { label: "Publicaciones" },
        ]}
      />
      <h1 className="font-serif text-4xl text-petrol dark:text-ivory">
        Publicaciones
      </h1>
      <p className="mt-2 text-muted">
        Catálogo actual. Los ítems marcados como demostración pueden sustituirse
        cuando exista la hoja Publicaciones en Google Sheets.
      </p>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-beige/50 dark:bg-white/5">
            <tr>
              <th className="px-4 py-3">Título</th>
              <th className="px-4 py-3">Categoría</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Fuente</th>
            </tr>
          </thead>
          <tbody>
            {publications.map((pub) => (
              <tr key={pub.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <Link
                    href={`/publicacion/${pub.slug}`}
                    className="text-gold hover:underline"
                  >
                    {pub.title}
                  </Link>
                  {pub.isDemo ? (
                    <Badge tone="demo" className="ml-2">
                      Demo
                    </Badge>
                  ) : null}
                </td>
                <td className="px-4 py-3">{pub.primaryCategory}</td>
                <td className="px-4 py-3">{pub.status}</td>
                <td className="px-4 py-3">{pub.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
