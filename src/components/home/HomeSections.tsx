import Image from "next/image";
import { CategoryExplore } from "@/components/home/CategoryExplore";
import { HomeSearchPanel } from "@/components/home/HomeSearchPanel";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative min-h-[520px] sm:min-h-[580px]">
        <Image
          src="/brand/hero-campus.jpg"
          alt="Colegio Or Hajayim Jacobo y Yosi Cojab — Edificio Alberto y Vicky Saba"
          fill
          priority
          className="animate-reveal-image object-cover object-[center_42%]"
          sizes="100vw"
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, rgba(18,28,36,0.35) 0%, rgba(18,28,36,0.45) 42%, rgba(36,55,70,0.92) 100%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[520px] max-w-3xl flex-col items-center justify-center px-4 pb-28 pt-20 text-center sm:min-h-[580px] sm:px-6 sm:pb-32">
          <div className="animate-rise mb-8 flex flex-col items-center">
            <Image
              src="/brand/or-hajayim-logo.png"
              alt="Colegio Or Hajayim"
              width={64}
              height={64}
              className="rounded-2xl bg-white/95 p-1.5 shadow-lg"
              priority
            />
            <p className="mt-4 text-[12px] font-medium tracking-[0.28em] text-white/75 uppercase">
              Or Hajayim
            </p>
            <h1 className="mt-2 font-display text-5xl tracking-tight text-white sm:text-6xl md:text-7xl">
              Ágora
            </h1>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
              Ideas, voces y trabajos que viven en la comunidad.
            </p>
          </div>

          <div className="animate-rise-delay w-full max-w-xl">
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
