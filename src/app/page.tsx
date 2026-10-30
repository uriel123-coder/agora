import {
  CatalogBlock,
  CategoryGrid,
  HomeHero,
} from "@/components/home/HomeSections";
import { getSession } from "@/lib/auth/session";
import { getLatestPublications } from "@/lib/data/repository";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSession();
  const publications = await getLatestPublications(user?.role ?? "visitor", 6);

  return (
    <>
      <HomeHero />
      <CategoryGrid />
      <CatalogBlock publications={publications} />
    </>
  );
}
