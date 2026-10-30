import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getSession } from "@/lib/auth/session";
import { CATEGORIES } from "@/lib/categories";
import {
  getAllPublications,
  getStudents,
} from "@/lib/data/repository";
import { searchPublications } from "@/lib/search";
import { normalizeText } from "@/lib/utils/text";
import type { CategorySlug } from "@/lib/types/content";

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
  const alumno = param(sp.alumno) ?? "";
  const subject = param(sp.subject) ?? "";
  const type = param(sp.type) ?? "";
  const category = (param(sp.category) ?? "") as CategorySlug | "";
  const year = param(sp.year) ?? "";
  const tag = param(sp.tag) ?? "";

  const user = await getSession();
  const students = getStudents(true);
  const matchedStudents = alumno
    ? students.filter((s) =>
        normalizeText(s.displayName).includes(normalizeText(alumno)),
      )
    : students;

  const publications = await getAllPublications(user?.role ?? "visitor");
  const studentIds = new Set(matchedStudents.map((s) => s.id));
  const studentPubs = publications.filter((p) =>
    p.authors.some(
      (a) => a.studentId && studentIds.has(a.studentId) && a.nameVisible,
    ),
  );

  const filtered = searchPublications(studentPubs, {
    query: "",
    subject,
    contentType: type as never,
    category,
    schoolYear: year,
    tag,
    sort: "date",
    page: 1,
    pageSize: 50,
  }).items.map((i) => i.publication);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Buscar alumno" }]} />
      <h1 className="font-serif text-4xl text-petrol dark:text-ivory">
        Encuentra las producciones de nuestros alumnos.
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Solo se muestran nombres y trabajos con autorización explícita. Los
        perfiles de menores no son indexables por buscadores públicos.
      </p>

      <form className="mt-8 grid gap-4 rounded-2xl border border-border bg-card p-5 md:grid-cols-3">
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Alumno
          </span>
          <input
            name="alumno"
            defaultValue={alumno}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="Nombre autorizado"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Materia
          </span>
          <input
            name="subject"
            defaultValue={subject}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Categoría
          </span>
          <select
            name="category"
            defaultValue={category}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          >
            <option value="">Todas</option>
            {CATEGORIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Tipo de trabajo
          </span>
          <input
            name="type"
            defaultValue={type}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
            placeholder="proyecto, poema…"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Ciclo escolar
          </span>
          <input
            name="year"
            defaultValue={year}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-muted">
            Etiquetas
          </span>
          <input
            name="tag"
            defaultValue={tag}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <div className="md:col-span-3">
          <Button type="submit">Buscar producciones</Button>
        </div>
      </form>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-petrol dark:text-ivory">
          Alumnos autorizados
        </h2>
        {matchedStudents.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border p-6 text-sm text-muted">
            No hay alumnos con autorización pública para mostrar. No inventamos
            perfiles.
          </p>
        ) : (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {matchedStudents.map((student) => (
              <Link
                key={student.id}
                href={`/alumno/${student.id}`}
                className="rounded-xl border border-border bg-card p-4 hover:border-gold/40"
              >
                <p className="font-medium">{student.displayName}</p>
                <p className="text-sm text-muted">
                  {student.grade} · {student.schoolYear}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl text-petrol dark:text-ivory">
          Resultados
        </h2>
        {filtered.length === 0 ? (
          <p className="mt-4 text-muted">
            No hay producciones visibles con estos filtros.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {filtered.map((pub) => (
              <li
                key={pub.id}
                className="flex gap-4 rounded-xl border border-border bg-card p-4"
              >
                <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-beige">
                  {pub.coverImage ? (
                    <Image
                      src={pub.coverImage}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : null}
                </div>
                <div>
                  <Link
                    href={`/publicacion/${pub.slug}`}
                    className="font-serif text-xl text-petrol hover:text-gold dark:text-ivory"
                  >
                    {pub.title}
                  </Link>
                  <p className="mt-1 text-sm text-muted">
                    {pub.authors
                      .filter((a) => a.nameVisible)
                      .map((a) => a.displayName)
                      .join(", ")}{" "}
                    · {pub.subject} · {pub.contentType}
                  </p>
                  <p className="mt-2 text-sm text-muted">{pub.summary}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
