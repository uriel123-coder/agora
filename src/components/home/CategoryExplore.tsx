"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

const cats = CATEGORIES.filter((c) => c.slug !== "tres-mundos-una-historia");

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
            radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(142,180,255,0.38), transparent 38%),
            linear-gradient(145deg, #1a2a36 0%, #243746 38%, #2f56ad 78%, #3968cc 100%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-35" aria-hidden>
        <div className="tm-orbit tm-orbit-a" />
        <div className="tm-orbit tm-orbit-b" />
        <div className="tm-grid-fade" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl animate-rise">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/65">
            Categorías de Ágora
          </p>
          <h2 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">
            Explora el mapa
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80 sm:text-lg">
            Ocho puertas al catálogo. Pasa el cursor y entra a la que te
            interese.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map((cat, index) => {
            const active = hover === cat.slug;
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                onMouseEnter={() => setHover(cat.slug)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(cat.slug)}
                onBlur={() => setHover(null)}
                className="cat-card group relative min-h-[168px] overflow-hidden rounded-sm border border-white/15 bg-white/[0.07] p-5 backdrop-blur-[2px] transition duration-300 hover:-translate-y-2 hover:border-white/45 hover:bg-white/[0.14] hover:shadow-[0_22px_50px_rgba(0,0,0,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <span
                  className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10 blur-2xl transition duration-500 group-hover:bg-white/25"
                  aria-hidden
                />
                <p className="relative text-[11px] uppercase tracking-[0.18em] text-white/45">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="relative mt-3 font-display text-xl leading-snug sm:text-[1.35rem]">
                  {cat.name}
                </h3>
                <p className="relative mt-2 text-sm leading-relaxed text-white/70">
                  {cat.tagline}
                </p>
                <span
                  className={`relative mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#c5d8ff] transition duration-300 ${
                    active ? "translate-x-1 opacity-100" : "opacity-70"
                  }`}
                >
                  Entrar
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
