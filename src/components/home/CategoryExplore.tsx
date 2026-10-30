"use client";

import Image from "next/image";
import Link from "next/link";
import { CATEGORIES, TIMELINE_EXTERNAL_URL } from "@/lib/categories";

/**
 * Categorías estilo recuerdo / oh.edu.mx: foto clara, barra OH, hover suave.
 * Tres mundos es un cuadrito más (abre cronología en otra pestaña).
 */
export function CategoryExplore() {
  return (
    <section id="categorias" className="relative bg-[#243746] text-white">
      <div className="mx-auto max-w-6xl px-4 pb-12 pt-2 sm:px-6 sm:pb-14">
        <div className="mb-7 max-w-xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8eb4ff]">
            Catálogo
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl">
            Explora por categoría
          </h2>
          <p className="mt-1.5 text-sm text-white/70">
            Recuerdos, ideas y trabajos de la comunidad Or Hajayim.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {CATEGORIES.map((cat) => {
            const isTimeline = cat.slug === "tres-mundos-una-historia";
            const className =
              "group flex flex-col overflow-hidden rounded-md bg-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(0,0,0,0.28)]";

            const body = (
              <>
                <div className="relative aspect-[4/3] overflow-hidden bg-[#e8ebf0]">
                  <Image
                    src={cat.coverImage}
                    alt=""
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.06]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-80"
                    aria-hidden
                  />
                </div>
                <div className="flex min-h-[3.1rem] items-center bg-[#1a2a36] px-3 py-2.5">
                  <span className="font-display text-[0.82rem] leading-snug text-white sm:text-sm">
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
