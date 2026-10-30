"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { TIMELINE_EXTERNAL_URL } from "@/lib/categories";
import { cn } from "@/lib/utils/cn";

const WORLDS = [
  {
    id: "hebrea",
    title: "Historia hebrea y judía",
    hint: "Memoria, fe y pueblo",
    tone: "from-[#1a2a36] via-[#243746] to-[#3968cc]",
    accent: "#8eb4ff",
    delay: "0ms",
  },
  {
    id: "mundial",
    title: "Historia mundial",
    hint: "Civilizaciones y giros",
    tone: "from-[#243746] via-[#2f56ad] to-[#5b8aef]",
    accent: "#b8d0ff",
    delay: "80ms",
  },
  {
    id: "mexico",
    title: "Historia de México",
    hint: "Raíces y nación",
    tone: "from-[#1f3344] via-[#3968cc] to-[#6a9cff]",
    accent: "#d4e4ff",
    delay: "160ms",
  },
] as const;

function openTimeline() {
  window.open(TIMELINE_EXTERNAL_URL, "_blank", "noopener,noreferrer");
}

export function TresMundosExperience({
  variant = "page",
}: {
  variant?: "home" | "page";
}) {
  const [active, setActive] = useState<string | null>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 40 });
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      setPointer({ x, y });
    };

    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <section
      id="tres-mundos"
      ref={stageRef}
      className={cn(
        "relative overflow-hidden text-white",
        variant === "home" ? "my-2" : "min-h-[calc(100vh-4rem)]",
      )}
    >
      <div
        className="absolute inset-0 bg-oh-ink-deep"
        style={{
          backgroundImage: `
            radial-gradient(circle at ${pointer.x}% ${pointer.y}%, rgba(57,104,204,0.45), transparent 42%),
            linear-gradient(160deg, #121a22 0%, #1a2a36 45%, #243746 100%)
          `,
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-40" aria-hidden>
        <div className="tm-orbit tm-orbit-a" />
        <div className="tm-orbit tm-orbit-b" />
        <div className="tm-orbit tm-orbit-c" />
        <div className="tm-grid-fade" />
      </div>

      <div
        className={cn(
          "relative mx-auto max-w-7xl px-4 sm:px-6",
          variant === "home" ? "py-16 sm:py-20" : "py-16 sm:py-24",
        )}
      >
        <div className="mb-10 max-w-3xl animate-rise">
          <p className="inline-flex items-center gap-2 rounded-sm border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/80 backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#8eb4ff]" />
            Apartado especial · no es una categoría más
          </p>
          <h2
            className={cn(
              "mt-5 font-display leading-[1.05] tracking-tight",
              variant === "home"
                ? "text-4xl sm:text-5xl"
                : "text-5xl sm:text-6xl lg:text-7xl",
            )}
          >
            Tres mundos,
            <span className="tm-shimmer block text-transparent">una historia</span>
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            «Tres historias. Un mismo tiempo. Infinitas conexiones». Toca una
            línea y salta a la cronología oficial — Ágora se queda abierta.
          </p>
          <button
            type="button"
            onClick={openTimeline}
            className="group mt-7 inline-flex items-center gap-2 rounded-sm bg-[#3968cc] px-5 py-3 text-base font-medium text-white shadow-[0_12px_40px_rgba(57,104,204,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2f56ad] hover:shadow-[0_18px_50px_rgba(57,104,204,0.45)]"
          >
            Abrir cronología completa
            <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {WORLDS.map((world, index) => (
            <button
              key={world.id}
              type="button"
              onClick={openTimeline}
              onMouseEnter={() => setActive(world.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(world.id)}
              onBlur={() => setActive(null)}
              className={cn(
                "tm-world group relative min-h-[220px] overflow-hidden rounded-sm border border-white/15 p-6 text-left transition duration-500",
                "hover:-translate-y-2 hover:border-white/40 hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)]",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8eb4ff]",
                active === world.id && "border-white/50",
              )}
              style={{ animationDelay: world.delay }}
              aria-label={`${world.title}: abrir cronología en una pestaña nueva`}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-90 transition duration-500 group-hover:scale-105",
                  world.tone,
                )}
              />
              <div className="tm-world-sheen absolute inset-0" aria-hidden />
              <div className="relative flex h-full flex-col justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                    Línea {index + 1}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-tight sm:text-[1.7rem]">
                    {world.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/70">{world.hint}</p>
                </div>
                <span
                  className="mt-8 inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: world.accent }}
                >
                  Entrar a la línea
                  <ArrowUpRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-white/55">
          La experiencia completa vive en{" "}
          <button
            type="button"
            onClick={openTimeline}
            className="text-[#8eb4ff] underline-offset-4 transition hover:text-white hover:underline"
          >
            linea-comparativa-2027.vercel.app
          </button>
          . Aquí solo abrimos el puente.
        </p>
      </div>
    </section>
  );
}
