import type { Metadata } from "next";
import { CategoryPageView } from "@/components/publications/CategoryPage";

export const metadata: Metadata = { title: "Expresiones del arte" };

export default function Page() {
  return <CategoryPageView slug="expresiones-del-arte" />;
}
