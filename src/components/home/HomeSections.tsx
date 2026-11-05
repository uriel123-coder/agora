import Image from "next/image";
import { CategoryExplore } from "@/components/home/CategoryExplore";
import { HomeSearchPanel } from "@/components/home/HomeSearchPanel";

export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative min-h-[540px] sm:min-h-[620px]">
        <Image
          src="/brand/hero-agora-collage.jpg"
          alt=""
          fill
          priority
          className="animate-reveal-image object-cover object-center"
          sizes="100vw"
          quality={90}
        />
        {/* Velo suave: el collage es claro; no lo oscurecemos como una foto de campus */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(248,250,252,0.45) 38%, rgba(36,55,70,0.55) 78%, rgba(18,28,36,0.88) 100%)",
          }}
        />

        <div className="relative mx-auto flex min-h-[540px] max-w-3xl flex-col items-center justify-center px-4 pb-28 pt-16 text-center sm:min-h-[620px] sm:px-6 sm:pb-32 sm:pt-20">
          <div className="animate-rise mb-8 flex w-full max-w-lg flex-col items-center">
            <Image
              src="/brand/agora-logo.png"
              alt="Ágora — Descubrir · Comprender · Compartir"
              width={520}
              height={300}
              className="h-auto w-[min(100%,22rem)] drop-shadow-[0_8px_28px_rgba(36,55,70,0.18)] sm:w-[min(100%,26rem)]"
              priority
            />
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#243746]/90 drop-shadow-sm sm:text-lg">
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
