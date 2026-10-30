"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES, TIMELINE_EXTERNAL_URL } from "@/lib/categories";

export function CategoryExplore() {
  const stageRef = useRef<HTMLElement>(null);
  const [pointer, setPointer] = useState({ x: 42, y: 35 });
  const [hover, setHover] = useState<string | null>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      setPointer({
        x: ((event.clientX - rect.left) / rect.width) * 100,
        y: ((event.clientY - rect.top) / rect.height) * 100,
      });
    };

    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      id="categorias"
      ref={stageRef}
      className="relative overflow-hidden text-white"
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(142,180,255,0.4), transparent 36%),
            linear-gradient(145deg, #1a2a36 0%, #243746 36%, #2f56ad 76%, #3968cc 100%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
        <div className="tm-orbit tm-orbit-a" />
        <div className="tm-orbit tm-orbit-b" />
        <div className="tm-grid-fade" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="mb-9 max-w-2xl animate-rise">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/65">
            Nueve categorías
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Explora Ágora
          </h2>
          <p className="mt-3 text-base leading-relaxed text-white/80">
            Cada puerta tiene su imagen. Entra y descubre — Tres mundos abre la
            cronología en otra pestaña.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat, index) => {
            const isTimeline = cat.slug === "tres-mundos-una-historia";
            const active = hover === cat.slug;
            const className =
              "cat-card group relative flex min-h-[240px] flex-col overflow-hidden rounded-sm border border-white/15 text-left transition duration-300 hover:-translate-y-2 hover:border-white/50 hover:shadow-[0_24px_55px_rgba(0,0,0,0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

            const inner = (
              <>
                <Image
                  src={cat.coverImage}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-110"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#121a22]/via-[#1a2a36]/55 to-transparent transition duration-300 group-hover:via-[#1a2a36]/40"
                  aria-hidden
                />
                <div className="relative mt-auto flex flex-1 flex-col justify-end p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                    {String(index + 1).padStart(2, "0")}
                    {isTimeline ? " · cronología" : ""}
                  </p>
                  <h3 className="mt-2 font-display text-2xl leading-snug">
                    {cat.name}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-white/75">
                    {isTimeline
                      ? "«Tres historias. Un mismo tiempo. Infinitas conexiones»."
                      : cat.tagline}
                  </p>
                  <span
                    className={`mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#c5d8ff] transition duration-300 ${
                      active ? "translate-x-1 opacity-100" : "opacity-80"
                    }`}
                  >
                    {isTimeline ? "Abrir cronología" : "Entrar"}
                    <ArrowUpRight className="h-3.5 w-3.5" />
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
                  onMouseEnter={() => setHover(cat.slug)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(cat.slug)}
                  onBlur={() => setHover(null)}
                  className={className}
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  {inner}
                </a>
              );
            }

            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onMouseEnter={() => setHover(cat.slug)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(cat.slug)}
                onBlur={() => setHover(null)}
                className={className}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
