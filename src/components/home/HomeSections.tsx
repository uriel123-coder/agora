import Image from "next/image";
import { CategoryExplore } from "@/components/home/CategoryExplore";
import { HomeSearchPanel } from "@/components/home/HomeSearchPanel";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative min-h-[460px] sm:min-h-[520px]">
        <Image
          src="/brand/hero-campus.jpg"
          alt="Colegio Or Hajayim Jacobo y Yosi Cojab — Edificio Alberto y Vicky Saba"
          fill
          priority
          className="animate-reveal-image object-cover object-[center_45%]"
          sizes="100vw"
        />
        {/* Oscurece un poco el centro para legibilidad del texto */}
        <div
          className="absolute inset-0"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(26,42,54,0.45) 0%, rgba(26,42,54,0.28) 45%, rgba(26,42,54,0.55) 100%)",
          }}
        />
        {/* Difuminado hacia las categorías (azul OH) */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 sm:h-52"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, rgba(36,55,70,0) 0%, rgba(36,55,70,0.55) 48%, #243746 100%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[460px] max-w-2xl flex-col items-center justify-center px-4 pb-24 pt-16 text-center sm:min-h-[520px] sm:px-6 sm:pb-28">
          <div className="animate-rise mb-6 flex flex-col items-center">
            <Image
              src="/brand/or-hajayim-logo.png"
              alt="Colegio Or Hajayim"
              width={58}
              height={58}
              className="rounded-md bg-white p-1 shadow-md"
              priority
            />
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/85">
              Colegio Or Hajayim
            </p>
            <h1 className="mt-1 font-display text-4xl tracking-tight text-white drop-shadow-sm sm:text-5xl">
              Ágora
            </h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
              Un espacio para descubrir, comprender y compartir.
            </p>
          </div>

          <div className="animate-rise-delay w-full max-w-lg">
            <HomeSearchPanel />
          </div>
        </div>
      </div>
    </section>
  );
}

export function CategoryGrid() {
  return <CategoryExplore />;
}
