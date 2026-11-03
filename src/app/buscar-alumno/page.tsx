import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { WorkCard } from "@/components/publications/WorkCard";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import {
  getAllPublications,
  getStudents,
} from "@/lib/data/repository";
import { searchPublications } from "@/lib/search";
import { normalizeText } from "@/lib/utils/text";

export const metadata: Metadata = {
  title: "Buscar alumno",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BuscarAlumnoPage({ searchParams }: Props) {
  const sp = await searchParams;
  const alumno = param(sp.alumno) ?? param(sp.q) ?? "";

  const user = await getSession();
  const role = user?.role ?? "visitor";
  const [students, publications] = await Promise.all([
    getStudents(true, role),
    getAllPublications(role),
  ]);

  const matchedStudents = alumno
    ? students.filter((s) =>
        normalizeText(s.displayName).includes(normalizeText(alumno)),
      )
    : students;

  const studentIds = new Set(matchedStudents.map((s) => s.id));
  const studentNames = new Set(
    matchedStudents.map((s) => normalizeText(s.displayName)),
  );

  const studentPubs = publications.filter((p) =>
    p.authors.some(
      (a) =>
        a.nameVisible &&
        ((a.studentId && studentIds.has(a.studentId)) ||
          studentNames.has(normalizeText(a.displayName))),
    ),
  );

  const filtered = alumno
    ? searchPublications(studentPubs, {
        query: "",
        author: alumno,
        sort: "date",
        page: 1,
        pageSize: 50,
      }).items.map((i) => i.publication)
    : studentPubs;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Buscar alumno" }]} />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
        Buscar alumno
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Encuentra portafolios y trabajos cargados desde Sheets.
      </p>

      <form className="mt-8 flex flex-wrap gap-3 rounded-md border border-border bg-card p-4">
        <input
          name="alumno"
          defaultValue={alumno}
          className="min-w-[220px] flex-1 rounded-sm border border-border bg-background px-3 py-2.5"
          placeholder="Nombre del alumno"
        />
        <Button type="submit">Buscar</Button>
      </form>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
          Alumnos
        </h2>
        {matchedStudents.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-border p-6 text-sm text-muted">
            No hay alumnos con trabajos visibles todavía.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matchedStudents.map((student) => (
              <Link
                key={student.id}
                href={`/alumno/${student.id}`}
                className="rounded-md border border-border bg-card p-4 transition hover:-translate-y-0.5 hover:border-oh-blue/40"
              >
                <p className="font-display text-lg">{student.displayName}</p>
                <p className="mt-1 text-sm text-muted">
                  {student.portfolioPublicationIds.length} trabajo
                  {student.portfolioPublicationIds.length === 1 ? "" : "s"}
                  {student.schoolYear ? ` · ${student.schoolYear}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
          Trabajos
        </h2>
        {filtered.length === 0 ? (
          <p className="mt-4 text-muted">Sin trabajos para esta búsqueda.</p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((pub) => (
              <WorkCard key={pub.id} publication={pub} showAuthor />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
