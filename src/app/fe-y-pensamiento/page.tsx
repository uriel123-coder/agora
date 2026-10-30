import type { Metadata } from "next";
import { CategoryPageView } from "@/components/publications/CategoryPage";

export const metadata: Metadata = { title: "Fe y pensamiento" };

export default function Page() {
  return <CategoryPageView slug="fe-y-pensamiento" />;
}
