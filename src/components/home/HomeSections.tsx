import Image from "next/image";
import { CategoryExplore } from "@/components/home/CategoryExplore";
import { HomeSearchPanel } from "@/components/home/HomeSearchPanel";

export function HomeHero() {
  return (
    <section className="relative isolate min-h-[420px] overflow-hidden sm:min-h-[480px]">
      <Image
        src="/brand/hero-campus.png"
        alt="Colegio Or Hajayim Jacobo y Yosi Cojab — Edificio Alberto y Vicky Saba"
        fill
        priority
        className="animate-reveal-image object-cover object-[center_40%]"
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(180deg, rgba(26,42,54,0.55) 0%, rgba(26,42,54,0.35) 40%, rgba(26,42,54,0.72) 100%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[420px] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center sm:min-h-[480px] sm:px-6">
        <div className="animate-rise mb-5 flex flex-col items-center">
          <Image
            src="/brand/or-hajayim-logo.png"
            alt="Colegio Or Hajayim"
            width={56}
            height={56}
            className="rounded-sm bg-white/95 p-1 shadow"
            priority
          />
          <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/80">
            Colegio Or Hajayim
          </p>
          <h1 className="mt-1 font-display text-4xl tracking-tight text-white sm:text-5xl">
            Ágora
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">
            Un espacio para descubrir, comprender y compartir.
          </p>
        </div>

        <div className="animate-rise-delay w-full max-w-xl">
          <HomeSearchPanel compact />
        </div>
      </div>
    </section>
  );
}

export function CategoryGrid() {
  return <CategoryExplore />;
}
