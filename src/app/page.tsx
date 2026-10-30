import {
  CategoryGrid,
  ForumHighlights,
  HomeHero,
  HomeSearchBand,
  PublicationStrip,
  StudentSearchCta,
  TimelineSpotlight,
} from "@/components/home/HomeSections";
import { getSession } from "@/lib/auth/session";
import {
  getArtGallery,
  getFeaturedPublications,
  getLatestPublications,
  getStudentVoices,
} from "@/lib/data/repository";
import { loadTimelineFromSheets } from "@/lib/data/providers/sheets";
import { listPosts } from "@/lib/forum/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSession();
  const role = user?.role ?? "visitor";
  const [featured, latest, art, voices, debates, timeline] = await Promise.all([
    getFeaturedPublications(role, 3),
    getLatestPublications(role, 3),
    getArtGallery(role).then((items) => items.slice(0, 3)),
    getStudentVoices(role).then((items) => items.slice(0, 3)),
    listPosts({ sort: "popular" }).then((items) => items.slice(0, 3)),
    loadTimelineFromSheets(),
  ]);

  const eventCount = timeline.bundle.events.length;

  return (
    <>
      <HomeHero timelineEvents={eventCount} />
      <HomeSearchBand />
      <CategoryGrid />
      <PublicationStrip
        title="Publicaciones destacadas"
        subtitle="Selección editorial del catálogo real."
        publications={featured}
        href="/explorar"
      />
      <PublicationStrip
        title="Últimas publicaciones"
        subtitle="Lo más reciente autorizado."
        publications={latest}
        href="/explorar"
      />
      <TimelineSpotlight eventCount={eventCount} />
      <StudentSearchCta />
      <ForumHighlights posts={debates} />
      <PublicationStrip
        title="Galería de Expresiones del arte"
        subtitle="Obras disponibles en el catálogo."
        publications={art}
        href="/expresiones-del-arte"
      />
      <PublicationStrip
        title="Selección de Voces creadoras"
        subtitle="Producciones estudiantiles autorizadas."
        publications={voices}
        href="/voces-creadoras"
      />
    </>
  );
}
