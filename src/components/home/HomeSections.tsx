import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { TresMundosExperience } from "@/components/tres-mundos/TresMundosExperience";
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
      <div className="hero-float pointer-events-none absolute -right-8 bottom-8 opacity-[0.14] sm:right-10 sm:bottom-12" aria-hidden>
        <Image
          src="/brand/or-hajayim-logo.png"
          alt=""
          width={220}
          height={220}
          className="select-none"
        />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-oh-ink-deep/40 to-transparent" aria-hidden />

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:pb-20">
        <div className="animate-rise max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <Image
              src="/brand/or-hajayim-logo.png"
              alt="Colegio Or Hajayim"
              width={72}
              height={72}
              className="rounded-sm bg-white p-1.5 shadow-sm transition duration-500 hover:rotate-3 hover:scale-105"
              priority
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/75">
                Colegio Or Hajayim
              </p>
              <p className="font-display text-3xl leading-none tracking-tight text-white sm:text-4xl">
                Ágora
              </p>
            </div>
          </div>
          <h1 className="max-w-[13ch] font-display text-4xl leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            Cada idea merece un espacio.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/85 sm:text-lg">
            Un espacio para descubrir, comprender y compartir.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/buscar-alumno"
              className="inline-flex items-center justify-center bg-[#3968cc] px-5 py-3 text-base font-medium text-white shadow-[0_10px_30px_rgba(57,104,204,0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#2f56ad]"
            >
              Buscar alumno
            </Link>
            <a
              href="#tres-mundos"
              className="inline-flex items-center justify-center border border-white/45 px-5 py-3 text-base font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
            >
              Tres mundos, una historia
            </a>
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
                className="w-full rounded-sm border border-border bg-background py-3 pl-10 pr-3 text-base outline-none transition duration-300 focus:border-oh-blue focus:shadow-[0_0_0_4px_rgba(57,104,204,0.12)]"
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

export function TresMundosHomeBand() {
  return <TresMundosExperience variant="home" />;
}

export function CategoryGrid() {
  const rest = CATEGORIES.filter((c) => c.slug !== "tres-mundos-una-historia");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-2xl animate-rise">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-oh-blue">
          Categorías de Ágora
        </p>
        <h2 className="mt-2 font-display text-3xl text-oh-ink dark:text-foreground sm:text-4xl">
          Un mapa para explorar
        </h2>
        <p className="mt-3 text-sm text-muted sm:text-base">
          Ocho puertas al catálogo. Tres mundos vive aparte, arriba.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rest.map((cat, index) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="cat-card group relative overflow-hidden border border-border bg-card p-5 transition duration-300 hover:-translate-y-1.5 hover:border-oh-blue/40 hover:shadow-[0_18px_40px_rgba(36,55,70,0.12)]"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <span className="cat-card-glow absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" aria-hidden />
            <h3 className="relative font-display text-xl text-oh-ink transition group-hover:text-oh-blue dark:text-foreground">
              {cat.name}
            </h3>
            <p className="relative mt-2 text-sm leading-relaxed text-muted">
              {cat.tagline}
            </p>
            <span className="relative mt-4 inline-block text-xs font-medium text-oh-blue opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">
              Entrar →
            </span>
          </Link>
        ))}
      </div>
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
            <Link href="/explorar" className="text-sm text-oh-blue transition hover:underline">
              Ver catálogo
            </Link>
          ) : null}
        </div>
        {publications.length === 0 ? (
          <EmptyState
            title="Aún no hay publicaciones en el catálogo"
            description="Cuando Or Hajayim cargue contenidos autorizados, aparecerán aquí. Mientras tanto puedes saltar a Tres mundos o buscar alumnos autorizados."
            actionHref={TIMELINE_EXTERNAL_URL}
            actionLabel="Abrir Tres mundos (nueva pestaña)"
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
