import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { CATEGORIES, TIMELINE_EXTERNAL_URL } from "@/lib/categories";
import type { Publication } from "@/lib/types/content";

export function HomeHero() {
  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-oh-ink text-white">
      <Image
        src="/brand/hero-bleed.png"
        alt="Ambiente escolar y cultural de Or Hajayim"
        fill
        priority
        className="animate-reveal-image object-cover object-center"
        sizes="100vw"
      />
      <div
        className="absolute inset-0"
        aria-hidden
        style={{
          background:
            "linear-gradient(105deg, rgba(26,42,54,0.92) 0%, rgba(36,55,70,0.78) 42%, rgba(36,55,70,0.35) 100%)",
        }}
      />
      <div className="pointer-events-none absolute -right-8 bottom-8 opacity-[0.12] sm:right-10 sm:bottom-12" aria-hidden>
        <Image
          src="/brand/or-hajayim-logo.png"
          alt=""
          width={220}
          height={220}
          className="select-none"
        />
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:pb-20">
        <div className="animate-rise max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <Image
              src="/brand/or-hajayim-logo.png"
              alt="Colegio Or Hajayim"
              width={64}
              height={64}
              className="rounded-sm bg-white/95 p-1.5 shadow-sm"
              priority
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/70">
                Colegio Or Hajayim
              </p>
              <p className="font-display text-3xl leading-none tracking-tight sm:text-4xl">
                Ágora
              </p>
            </div>
          </div>
          <h1 className="max-w-[13ch] font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
            Cada idea merece un espacio.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/80 sm:text-lg">
            Un espacio para descubrir, comprender y compartir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/buscar-alumno" size="lg" className="bg-oh-blue hover:bg-oh-blue-deep">
              Buscar alumno
            </Button>
            <Button
              href="/tres-mundos-una-historia"
              variant="secondary"
              size="lg"
              className="border-white/35 text-white hover:border-white hover:text-white"
            >
              Tres mundos, una historia
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudentSearchBand() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <form
          action="/buscar-alumno"
          method="get"
          className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end"
        >
          <label className="block">
            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-muted">
              Encuentra las producciones de nuestros alumnos
            </span>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                name="alumno"
                placeholder="Nombre del alumno (cuando esté autorizado)"
                className="w-full rounded-sm border border-border bg-background py-3 pl-10 pr-3 text-base outline-none transition focus:border-oh-blue"
              />
            </div>
          </label>
          <Button type="submit" size="lg">
            Buscar
          </Button>
        </form>
      </div>
    </section>
  );
}

export function CategoryGrid() {
  const featured = CATEGORIES.find((c) => c.slug === "tres-mundos-una-historia");
  const rest = CATEGORIES.filter((c) => c.slug !== "tres-mundos-una-historia");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-oh-blue">
          Nueve categorías
        </p>
        <h2 className="mt-2 font-display text-3xl text-oh-ink dark:text-foreground sm:text-4xl">
          Un mapa para explorar Ágora
        </h2>
      </div>

      {featured ? (
        <Link
          href={`/${featured.slug}`}
          className="group mb-4 flex flex-col justify-between gap-6 border border-border bg-oh-ink p-7 text-white transition duration-300 hover:bg-oh-ink-deep sm:flex-row sm:items-end sm:p-9"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-white/55">
              Destacado
            </p>
            <h3 className="mt-3 font-display text-3xl sm:text-4xl">
              {featured.name}
            </h3>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
              «Tres historias. Un mismo tiempo. Infinitas conexiones».
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm text-white/85 transition group-hover:text-white">
            Abrir cronología
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </Link>
      ) : null}

      <div className="grid gap-px overflow-hidden border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="group bg-card p-5 transition duration-300 hover:bg-oh-stone dark:hover:bg-white/5"
          >
            <h3 className="font-display text-xl text-oh-ink transition group-hover:text-oh-blue dark:text-foreground">
              {cat.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {cat.tagline}
            </p>
          </Link>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted">
        La cronología completa vive en{" "}
        <a
          href={TIMELINE_EXTERNAL_URL}
          className="text-oh-blue hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          linea-comparativa-2027.vercel.app
        </a>
        .
      </p>
    </section>
  );
}

export function CatalogBlock({ publications }: { publications: Publication[] }) {
  return (
    <section className="border-t border-border bg-oh-stone/40 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-oh-blue">
              Catálogo
            </p>
            <h2 className="mt-2 font-display text-3xl text-oh-ink dark:text-foreground">
              Publicaciones
            </h2>
          </div>
          {publications.length > 0 ? (
            <Link href="/explorar" className="text-sm text-oh-blue hover:underline">
              Ver catálogo
            </Link>
          ) : null}
        </div>
        {publications.length === 0 ? (
          <EmptyState
            title="Aún no hay publicaciones en el catálogo"
            description="Cuando Or Hajayim cargue contenidos autorizados, aparecerán aquí. Mientras tanto puedes explorar Tres mundos o buscar alumnos autorizados."
            actionHref="/tres-mundos-una-historia"
            actionLabel="Ir a Tres mundos, una historia"
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {publications.slice(0, 6).map((pub) => (
              <PublicationCard key={pub.id} publication={pub} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
