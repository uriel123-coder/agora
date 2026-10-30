import type { Metadata } from "next";
import { CategoryPageView } from "@/components/publications/CategoryPage";

export const metadata: Metadata = { title: "Taller de letras" };

export default function Page() {
  return <CategoryPageView slug="taller-de-letras" />;
}
