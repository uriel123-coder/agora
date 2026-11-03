import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { WorkCard } from "@/components/publications/WorkCard";
import { Badge } from "@/components/ui/Badge";
import { getSession } from "@/lib/auth/session";
import { getCategory } from "@/lib/categories";
import {
  getAllPublications,
  getStudentPortfolio,
} from "@/lib/data/repository";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Portafolio de alumno",
  robots: { index: false, follow: false },
};

export default async function AlumnoPage({ params }: Props) {
  const { id } = await params;
  const user = await getSession();
  const role = user?.role ?? "visitor";
  const portfolio = await getStudentPortfolio(id, role);
  if (!portfolio) notFound();

  const { student, publications } = portfolio;
  const all = await getAllPublications(role);

  // Conexiones: otros trabajos de la misma categoría o mismo año (no del mismo alumno).
  const categorySet = new Set(publications.map((p) => p.primaryCategory));
  const yearSet = new Set(publications.map((p) => p.schoolYear).filter(Boolean));
  const connections = all
    .filter(
      (p) =>
        !publications.some((mine) => mine.id === p.id) &&
        (categorySet.has(p.primaryCategory) ||
          (p.schoolYear && yearSet.has(p.schoolYear))),
    )
    .slice(0, 6);

  const byCategory = [...categorySet].map((slug) => getCategory(slug).name);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Buscar", href: "/buscar" },
          { label: student.displayName },
        ]}
      />
      <div className="max-w-3xl">
        <Badge tone="muted">Portafolio</Badge>
        <h1 className="mt-4 font-display text-4xl text-oh-ink dark:text-foreground">
          {student.displayName}
        </h1>
        <p className="mt-2 text-muted">
          {publications.length} trabajo
          {publications.length === 1 ? "" : "s"}
          {student.schoolYear ? ` · ${student.schoolYear}` : ""}
          {byCategory.length ? ` · ${byCategory.join(", ")}` : ""}
        </p>
        <p className="mt-4 text-sm text-muted">
          Vista previa de documentos y enlaces. Desde cada cuadrito puedes abrir,
          descargar o ir a la ficha completa.
        </p>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
          Trabajos
        </h2>
        {publications.length === 0 ? (
          <p className="mt-4 text-sm text-muted">Sin trabajos visibles.</p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publications.map((pub) => (
              <WorkCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}
      </section>

      {connections.length > 0 ? (
        <section className="mt-14 border-t border-border pt-10">
          <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
            Conexiones
          </h2>
          <p className="mt-2 text-sm text-muted">
            Otros trabajos relacionados por categoría o año.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {connections.map((pub) => (
              <WorkCard key={pub.id} publication={pub} showAuthor />
            ))}
          </div>
        </section>
      ) : null}

      <p className="mt-10 text-sm">
        <Link href="/buscar" className="text-oh-blue hover:underline">
          ← Volver al buscador
        </Link>
      </p>
    </div>
  );
}
