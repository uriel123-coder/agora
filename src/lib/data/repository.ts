import demoPublications from "@/data/demo/publications.json";
import demoStudents from "@/data/demo/students.json";
import {
  getSheetsConfig,
  loadPublicationsFromSheets,
  mergeContentSources,
} from "@/lib/data/providers/sheets";
import type {
  AccessLevel,
  CategorySlug,
  Publication,
  StudentProfile,
  UserRole,
} from "@/lib/types/content";

/** Por defecto NO se muestran inventos. Solo con AGORA_USE_DEMO=true. */
function demoEnabled(): boolean {
  return process.env.AGORA_USE_DEMO === "true";
}

function canView(pub: Publication, role: UserRole = "visitor"): boolean {
  if (pub.status !== "published" && role === "visitor") return false;
  if (pub.status !== "published" && role === "alumno") {
    return pub.accessLevel !== "private";
  }
  if (pub.accessLevel === "public" && pub.status === "published") return true;
  if (pub.accessLevel === "restricted") {
    return ["alumno", "docente", "editor", "moderador", "administrador"].includes(
      role,
    );
  }
  if (pub.accessLevel === "private") {
    return ["editor", "moderador", "administrador"].includes(role);
  }
  return ["editor", "moderador", "administrador"].includes(role);
}

export async function getAllPublications(
  role: UserRole = "visitor",
): Promise<Publication[]> {
  const demo = demoEnabled() ? (demoPublications as Publication[]) : [];
  const config = getSheetsConfig();
  const skipRemote =
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.AGORA_SKIP_SHEETS === "true";

  let sheets: Publication[] = [];
  if (config.enabled && !skipRemote) {
    try {
      const loaded = await loadPublicationsFromSheets();
      sheets = loaded.publications;
    } catch {
      sheets = [];
    }
  }

  const merged =
    sheets.length > 0 ? mergeContentSources(demo, sheets) : demo;
  const visible = merged.filter((p) => canView(p, role));
  // Tipos ya descubiertos (p. ej. tras visitar tarjetas) sin llamar a Drive
  try {
    const { applyCachedDriveKinds } = await import("@/lib/data/enrich-media");
    return applyCachedDriveKinds(visible);
  } catch {
    return visible;
  }
}

export async function getPublicationBySlug(
  slug: string,
  role: UserRole = "visitor",
): Promise<Publication | null> {
  const all = await getAllPublications(role);
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getPublicationById(
  id: string,
  role: UserRole = "visitor",
): Promise<Publication | null> {
  const all = await getAllPublications(role);
  return all.find((p) => p.id === id) ?? null;
}

export async function getPublicationsByCategory(
  slug: CategorySlug,
  role: UserRole = "visitor",
): Promise<Publication[]> {
  const all = await getAllPublications(role);
  return all
    .filter((p) => p.categorySlugs.includes(slug))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

export async function getFeaturedPublications(
  role: UserRole = "visitor",
  limit = 6,
): Promise<Publication[]> {
  const all = await getAllPublications(role);
  const featured = all.filter((p) => p.featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getLatestPublications(
  role: UserRole = "visitor",
  limit = 8,
): Promise<Publication[]> {
  const all = await getAllPublications(role);
  return [...all]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}

export async function getRelatedPublications(
  publication: Publication,
  role: UserRole = "visitor",
  limit = 4,
): Promise<Publication[]> {
  const all = await getAllPublications(role);
  const byId = publication.relatedIds
    .map((id) => all.find((p) => p.id === id))
    .filter(Boolean) as Publication[];
  if (byId.length >= limit) return byId.slice(0, limit);

  const tagSet = new Set(publication.tags);
  const scored = all
    .filter((p) => p.id !== publication.id)
    .map((p) => {
      let score = 0;
      if (p.primaryCategory === publication.primaryCategory) score += 3;
      score += p.categorySlugs.filter((c) =>
        publication.categorySlugs.includes(c),
      ).length;
      score += p.tags.filter((t) => tagSet.has(t)).length * 2;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);

  const merged = [...byId];
  for (const p of scored) {
    if (!merged.find((m) => m.id === p.id)) merged.push(p);
    if (merged.length >= limit) break;
  }
  return merged;
}

export async function getArtGallery(
  role: UserRole = "visitor",
): Promise<Publication[]> {
  return getPublicationsByCategory("expresiones-del-arte", role);
}

export async function getStudentVoices(
  role: UserRole = "visitor",
): Promise<Publication[]> {
  return getPublicationsByCategory("voces-creadoras", role);
}

function studentsFromPublications(publications: Publication[]): StudentProfile[] {
  const map = new Map<string, StudentProfile>();
  for (const pub of publications) {
    for (const author of pub.authors) {
      if (!author.nameVisible || !author.displayName.trim()) continue;
      const id = author.studentId || `alumno-${author.displayName}`;
      const existing = map.get(id);
      if (existing) {
        if (!existing.portfolioPublicationIds.includes(pub.id)) {
          existing.portfolioPublicationIds.push(pub.id);
        }
        if (pub.schoolYear) existing.schoolYear = pub.schoolYear;
      } else {
        map.set(id, {
          id,
          displayName: author.displayName,
          searchable: true,
          authorizationStatus: "approved",
          schoolYear: pub.schoolYear,
          portfolioPublicationIds: [pub.id],
          isDemo: pub.isDemo,
        });
      }
    }
  }
  return [...map.values()].sort((a, b) =>
    a.displayName.localeCompare(b.displayName, "es"),
  );
}

export async function getStudents(
  onlySearchable = true,
  role: UserRole = "visitor",
): Promise<StudentProfile[]> {
  const publications = await getAllPublications(role);
  const fromSheets = studentsFromPublications(publications);
  const demo = demoEnabled()
    ? (demoStudents as StudentProfile[]).filter((s) =>
        onlySearchable
          ? s.searchable && s.authorizationStatus === "approved"
          : true,
      )
    : [];

  const byId = new Map<string, StudentProfile>();
  for (const s of [...demo, ...fromSheets]) byId.set(s.id, s);
  const all = [...byId.values()];
  if (!onlySearchable) return all;
  return all.filter(
    (s) => s.searchable && s.authorizationStatus === "approved",
  );
}

export async function getStudentById(
  id: string,
  role: UserRole = "visitor",
): Promise<StudentProfile | null> {
  const students = await getStudents(false, role);
  return (
    students.find((s) => s.id === id) ||
    students.find(
      (s) =>
        s.displayName.toLowerCase() === id.toLowerCase() ||
        s.id === `alumno-${id}`,
    ) ||
    null
  );
}

export async function getStudentPortfolio(
  studentId: string,
  role: UserRole = "visitor",
): Promise<{ student: StudentProfile; publications: Publication[] } | null> {
  const student = await getStudentById(studentId, role);
  if (!student) return null;
  if (
    (!student.searchable || student.authorizationStatus !== "approved") &&
    !["editor", "moderador", "administrador"].includes(role)
  ) {
    return null;
  }
  const all = await getAllPublications(role);
  const publications = all.filter(
    (p) =>
      student.portfolioPublicationIds.includes(p.id) ||
      p.authors.some(
        (a) =>
          a.nameVisible &&
          (a.studentId === student.id ||
            a.displayName.toLowerCase() === student.displayName.toLowerCase()),
      ),
  );
  return { student, publications };
}

export function accessLabel(level: AccessLevel): string {
  switch (level) {
    case "public":
      return "Público";
    case "restricted":
      return "Restringido";
    case "private":
      return "Privado";
  }
}
