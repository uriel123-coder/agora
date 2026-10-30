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
import { listPosts } from "@/lib/forum/store";

export default async function HomePage() {
  const user = await getSession();
  const role = user?.role ?? "visitor";
  const [featured, latest, art, voices, debates] = await Promise.all([
    getFeaturedPublications(role, 3),
    getLatestPublications(role, 3),
    getArtGallery(role).then((items) => items.slice(0, 3)),
    getStudentVoices(role).then((items) => items.slice(0, 3)),
    listPosts({ sort: "popular" }).then((items) => items.slice(0, 3)),
  ]);

  return (
    <>
      <HomeHero />
      <HomeSearchBand />
      <CategoryGrid />
      <PublicationStrip
        title="Publicaciones destacadas"
        subtitle="Selección editorial a partir del catálogo actual (incluye contenidos de demostración etiquetados)."
        publications={featured}
        href="/explorar"
      />
      <PublicationStrip
        title="Últimas publicaciones"
        subtitle="Lo más reciente del catálogo autorizado."
        publications={latest}
        href="/explorar"
      />
      <TimelineSpotlight />
      <StudentSearchCta />
      <ForumHighlights posts={debates} />
      <PublicationStrip
        title="Galería de Expresiones del arte"
        subtitle="Obras y series disponibles en el catálogo."
        publications={art}
        href="/expresiones-del-arte"
      />
      <PublicationStrip
        title="Selección de Voces creadoras"
        subtitle="Producciones estudiantiles con autorización de difusión."
        publications={voices}
        href="/voces-creadoras"
      />
    </>
  );
}
