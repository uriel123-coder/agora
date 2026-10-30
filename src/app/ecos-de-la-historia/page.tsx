import type { Metadata } from "next";
import { CategoryPageView } from "@/components/publications/CategoryPage";

export const metadata: Metadata = { title: "Ecos de la historia" };

export default function Page() {
  return <CategoryPageView slug="ecos-de-la-historia" />;
}
