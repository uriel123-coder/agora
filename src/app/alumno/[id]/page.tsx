import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { Badge } from "@/components/ui/Badge";
import { getSession } from "@/lib/auth/session";
import { getStudentPortfolio } from "@/lib/data/repository";

type Props = { params: Promise<{ id: string }> };

export const metadata: Metadata = {
  title: "Portafolio de alumno",
  robots: { index: false, follow: false },
};

export default async function AlumnoPage({ params }: Props) {
  const { id } = await params;
  const user = await getSession();
  const portfolio = await getStudentPortfolio(id, user?.role ?? "visitor");
  if (!portfolio) notFound();

  const { student, publications } = portfolio;
  const bySubject = [...new Set(publications.map((p) => p.subject).filter(Boolean))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Buscar alumno", href: "/buscar-alumno" },
          { label: student.displayName },
        ]}
      />
      <div className="max-w-3xl">
        <Badge tone="muted">Portafolio autorizado</Badge>
        {student.isDemo ? (
          <Badge tone="demo" className="ml-2">
            Contenido de demostración
          </Badge>
        ) : null}
        <h1 className="mt-4 font-display text-4xl text-oh-ink dark:text-foreground">
          {student.displayName}
        </h1>
        <p className="mt-2 text-muted">
          {student.grade} · {student.schoolYear}
        </p>
        <p className="mt-4 text-sm text-muted">
          Este portafolio solo incluye trabajos con nivel de acceso permitido y
          autorización de difusión del nombre.
        </p>
      </div>

      {bySubject.length > 0 ? (
        <p className="mt-6 text-sm text-muted">
          Materias: {bySubject.join(" · ")}
        </p>
      ) : null}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {publications.map((pub) => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
      </div>
    </div>
  );
}
