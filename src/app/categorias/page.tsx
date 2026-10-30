import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = { title: "Categorías" };

export default function CategoriasPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Categorías" }]} />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
        Categorías
      </h1>
      <p className="mt-3 max-w-2xl text-muted">
        Las nueve categorías oficiales de Ágora. No se añaden categorías
        principales adicionales.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {CATEGORIES.map((cat, index) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="rounded-2xl border border-border bg-card p-6 transition hover:border-oh-blue/40"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-muted">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h2 className="mt-2 font-display text-2xl text-oh-ink dark:text-foreground">
              {cat.name}
            </h2>
            <p className="mt-2 text-sm text-muted">{cat.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
