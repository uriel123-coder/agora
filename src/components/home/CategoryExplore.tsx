import Image from "next/image";
import { CATEGORIES, TIMELINE_EXTERNAL_URL } from "@/lib/categories";

/**
 * Enlaces nativos <a>: navegan al primer toque (sin soft-nav lento).
 */
export function CategoryExplore() {
  return (
    <section
      id="categorias"
      className="relative bg-[#1a2a36] text-white"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 20% 0%, rgba(57,104,204,0.18), transparent 45%), radial-gradient(ellipse at 90% 20%, rgba(255,255,255,0.04), transparent 40%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-4 sm:px-6 sm:pb-20">
        <div className="mb-8 max-w-lg">
          <p className="text-[12px] font-medium tracking-[0.22em] text-[#9db6f0] uppercase">
            Archivo vivo
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
            Encuentra tu camino
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/65 sm:text-base">
            Letras, pensamiento, historia y creación — un mismo lugar.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {CATEGORIES.map((cat) => {
            const isTimeline = cat.slug === "tres-mundos-una-historia";
            const href = isTimeline ? TIMELINE_EXTERNAL_URL : `/${cat.slug}`;
            const className =
              "group relative flex aspect-[4/5] flex-col overflow-hidden rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8eb4ff]";

            return (
              <a
                key={cat.slug}
                href={href}
                target={isTimeline ? "_blank" : undefined}
                rel={isTimeline ? "noopener noreferrer" : undefined}
                className={className}
                style={{ touchAction: "manipulation" }}
                title={
                  isTimeline ? "Abre la cronología en otra pestaña" : undefined
                }
              >
                <Image
                  src={cat.coverImage}
                  alt=""
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.05]"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  aria-hidden
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(18,28,36,0.05) 20%, rgba(18,28,36,0.78) 100%)",
                  }}
                />
                <div className="relative mt-auto p-3.5 sm:p-4">
                  <span className="font-display text-[0.95rem] leading-snug text-white drop-shadow sm:text-lg">
                    {cat.name}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
