import type { Metadata } from "next";
import { CategoryPageView } from "@/components/publications/CategoryPage";

export const metadata: Metadata = { title: "Mentes curiosas" };

export default function Page() {
  return <CategoryPageView slug="mentes-curiosas" />;
}
