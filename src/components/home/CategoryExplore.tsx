"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, TIMELINE_EXTERNAL_URL } from "@/lib/categories";

/** Cuadrícula compacta de categorías (incluye Tres mundos como un cuadrito más). */
export function CategoryExplore() {
  return (
    <section id="categorias" className="bg-[#243746] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6">
          <h2 className="font-display text-2xl sm:text-3xl">
            Explora por categoría
          </h2>
          <p className="mt-1.5 text-sm text-white/70">
            Elige una puerta al catálogo de Ágora.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {CATEGORIES.map((cat) => {
            const isTimeline = cat.slug === "tres-mundos-una-historia";
            const className =
              "group flex flex-col overflow-hidden rounded-sm bg-[#1a2a36] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.35)]";

            const body = (
              <>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={cat.coverImage}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="flex min-h-[3.25rem] items-center gap-2 px-3 py-2.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: cat.accent }}
                    aria-hidden
                  />
                  <span className="font-display text-sm leading-snug sm:text-[0.95rem]">
                    {cat.name}
                  </span>
                </div>
              </>
            );

            if (isTimeline) {
              return (
                <a
                  key={cat.slug}
                  href={TIMELINE_EXTERNAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  title="Abre la cronología en otra pestaña"
                >
                  {body}
                </a>
              );
            }

            return (
              <Link key={cat.slug} href={`/${cat.slug}`} className={className}>
                {body}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
