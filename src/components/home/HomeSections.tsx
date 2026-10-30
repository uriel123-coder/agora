import Image from "next/image";
import Link from "next/link";
import { CategoryExplore } from "@/components/home/CategoryExplore";
import { HomeSearchPanel } from "@/components/home/HomeSearchPanel";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { Publication } from "@/lib/types/content";

export function HomeHero() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto grid max-w-7xl lg:min-h-[min(78vh,720px)] lg:grid-cols-2">
        <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:min-h-full">
          <Image
            src="/brand/hero-campus.png"
            alt="Fachada del Colegio Or Hajayim Jacobo y Yosi Cojab"
            fill
            priority
            className="animate-reveal-image object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-oh-ink/55 via-transparent to-oh-ink/10 lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-card/40"
            aria-hidden
          />
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6">
            <div className="inline-flex items-center gap-3 rounded-sm bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
              <Image
                src="/brand/or-hajayim-logo.png"
                alt=""
                width={40}
                height={40}
                className="rounded-sm"
              />
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
                  Colegio Or Hajayim
                </p>
                <p className="font-display text-lg leading-none text-oh-ink">
                  Ágora
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border lg:border-l lg:border-t-0">
          <HomeSearchPanel />
        </div>
      </div>
    </section>
  );
}

export function CategoryGrid() {
  return <CategoryExplore />;
}

export function CatalogBlock({ publications }: { publications: Publication[] }) {
  return (
    <section className="border-t border-border bg-oh-stone/40 dark:bg-white/[0.02]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
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
            <Link
              href="/explorar"
              className="text-sm text-oh-blue transition hover:underline"
            >
              Ver catálogo
            </Link>
          ) : null}
        </div>
        {publications.length === 0 ? (
          <EmptyState
            title="Aún no hay publicaciones en el catálogo"
            description="Cuando Or Hajayim cargue contenidos autorizados, aparecerán aquí. Usa el buscador de arriba o explora una categoría."
            actionHref="#categorias"
            actionLabel="Ver categorías"
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
