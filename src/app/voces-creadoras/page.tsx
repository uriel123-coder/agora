import type { Metadata } from "next";
import { CategoryPageView } from "@/components/publications/CategoryPage";

export const metadata: Metadata = { title: "Voces creadoras" };

export default function Page() {
  return <CategoryPageView slug="voces-creadoras" />;
}
