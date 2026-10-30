import Link from "next/link";
import { ArrowRight, BookOpen, History, Search, Sparkles } from "lucide-react";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CATEGORIES, TIMELINE_EXTERNAL_URL } from "@/lib/categories";
import type { ForumPost } from "@/lib/forum/store";
import type { Publication } from "@/lib/types/content";

export function HomeHero({
  timelineEvents,
}: {
  timelineEvents?: number;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 85% 15%, color-mix(in oklab, #B49A65 22%, transparent), transparent 55%),
            radial-gradient(ellipse 50% 45% at 10% 80%, color-mix(in oklab, #163A45 16%, transparent), transparent 50%),
            linear-gradient(165deg, #F8F5EE 0%, #EAE3D5 48%, #F8F5EE 100%)
          `,
        }}
      />
      <div className="dark:hidden pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23163A45' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-end gap-12 px-4 pb-16 pt-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.28em] text-gold">
            Ágora · biblioteca digital escolar
          </p>
          <h1 className="max-w-[14ch] font-serif text-[2.75rem] leading-[1.05] text-petrol dark:text-ivory sm:text-6xl lg:text-[4.25rem]">
            Cada idea merece un espacio.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Explora historias, descubre conocimientos y conoce el talento de
            nuestra comunidad.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/explorar" size="lg">
              Explorar contenidos
            </Button>
            <Button href="/tres-mundos-una-historia" variant="secondary" size="lg">
              Recorrer la historia
            </Button>
          </div>
          {typeof timelineEvents === "number" && timelineEvents > 0 ? (
            <p className="mt-8 text-sm text-muted">
              <span className="font-medium text-petrol dark:text-gold">
                {timelineEvents.toLocaleString("es-MX")}
              </span>{" "}
              acontecimientos reales en la cronología comparativa.
            </p>
          ) : null}
        </div>

        <div className="animate-fade-up-delay relative">
          <div className="relative overflow-hidden rounded-[1.75rem] border border-petrol/10 bg-petrol text-ivory shadow-[0_30px_80px_-40px_rgba(16,44,54,0.65)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/20 blur-2xl" />
            <div className="relative space-y-6 p-7 sm:p-9">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-ivory/10">
                  <BookOpen className="h-5 w-5 text-gold" />
                </span>
                <div>
                  <p className="font-serif text-xl">Ágora</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-ivory/55">
                    Descubrir · Comprender · Compartir
                  </p>
                </div>
              </div>
              <p className="font-serif text-2xl leading-snug text-ivory/95 sm:text-[1.65rem]">
                Un espacio para descubrir, comprender y compartir.
              </p>
              <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
                {[
                  { n: "9", l: "categorías" },
                  { n: "3", l: "historias" },
                  { n: "1", l: "comunidad" },
                ].map((item) => (
                  <div key={item.l}>
                    <p className="font-serif text-2xl text-gold">{item.n}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-wider text-ivory/50">
                      {item.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeSearchBand() {
  return (
    <section className="border-b border-border bg-card/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-petrol dark:text-ivory">
            Buscador universal
          </h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Busca en el catálogo autorizado. Atajo ⌘K / Ctrl+K.
          </p>
        </div>
        <Button href="/buscar" variant="secondary">
          <Search className="h-4 w-4" />
          Abrir buscador
        </Button>
      </div>
    </section>
  );
}

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gold">
            Las nueve categorías
          </p>
          <h2 className="mt-2 font-serif text-3xl text-petrol dark:text-ivory sm:text-4xl">
            Nueve caminos para explorar
          </h2>
        </div>
        <Link
          href="/categorias"
          className="hidden items-center gap-1 text-sm text-gold sm:inline-flex"
        >
          Ver todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[var(--shadow-soft)]"
          >
            <span className="text-[11px] uppercase tracking-[0.2em] text-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="mt-4 mb-4 block h-1 w-10 rounded-full transition-all duration-300 group-hover:w-16"
              style={{ background: cat.accent }}
              aria-hidden
            />
            <h3 className="font-serif text-xl text-petrol transition group-hover:text-gold dark:text-ivory">
              {cat.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {cat.tagline}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function PublicationStrip({
  title,
  subtitle,
  publications,
  href,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  subtitle: string;
  publications: Publication[];
  href: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-petrol dark:text-ivory">
            {title}
          </h2>
          <p className="mt-2 text-muted">{subtitle}</p>
        </div>
        {publications.length > 0 ? (
          <Link href={href} className="text-sm text-gold hover:underline">
            Ver más
          </Link>
        ) : null}
      </div>
      {publications.length === 0 ? (
        <EmptyState
          title={emptyTitle ?? "Sin publicaciones todavía"}
          description={
            emptyDescription ??
            "Cuando existan contenidos reales en el catálogo, aparecerán aquí. No mostramos ejemplos inventados."
          }
          actionHref={href}
          actionLabel="Ir a la sección"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {publications.map((pub) => (
            <PublicationCard key={pub.id} publication={pub} />
          ))}
        </div>
      )}
    </section>
  );
}

export function TimelineSpotlight({ eventCount }: { eventCount: number }) {
  return (
    <section className="relative overflow-hidden border-y border-border bg-petrol text-ivory">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(180,154,101,0.35), transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(255,255,255,0.08), transparent 40%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <Badge tone="gold">Sección central · datos reales</Badge>
          <h2 className="mt-5 font-serif text-3xl sm:text-5xl">
            Tres mundos, una historia
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ivory/80">
            «Tres historias. Un mismo tiempo. Infinitas conexiones».
          </p>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-ivory/65">
            Cronología comparativa leída desde Google Sheets: historia hebrea y
            judía, historia mundial e historia de México.
            {eventCount > 0
              ? ` ${eventCount.toLocaleString("es-MX")} acontecimientos disponibles.`
              : " Conectando con la hoja autorizada…"}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/tres-mundos-una-historia" variant="gold">
              <History className="h-4 w-4" />
              Abrir en Ágora
            </Button>
            <Button
              href={TIMELINE_EXTERNAL_URL}
              variant="secondary"
              className="border-white/25 text-ivory hover:border-gold hover:text-gold"
            >
              Sitio original
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-deep/35 p-7 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-gold">
            <Sparkles className="h-4 w-4" /> Tres líneas
          </p>
          <ul className="mt-5 space-y-4 text-sm text-ivory/80">
            <li className="border-l-2 border-gold/60 pl-4">Historia hebrea y judía</li>
            <li className="border-l-2 border-gold/60 pl-4">Historia mundial</li>
            <li className="border-l-2 border-gold/60 pl-4">Historia de México</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function StudentSearchCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-6 rounded-[1.75rem] border border-border bg-card p-8 md:flex-row md:items-center md:justify-between md:p-10">
        <div>
          <h2 className="font-serif text-2xl text-petrol dark:text-ivory sm:text-3xl">
            Buscar producciones estudiantiles
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            Solo aparecen nombres y trabajos con autorización explícita. Si aún
            no hay portafolios autorizados, la sección permanece vacía.
          </p>
        </div>
        <Button href="/buscar-alumno">Buscar alumno</Button>
      </div>
    </section>
  );
}

export function ForumHighlights({ posts }: { posts: ForumPost[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-3xl text-petrol dark:text-ivory">
            Debates destacados
          </h2>
          <p className="mt-2 text-muted">Desde Ideas en diálogo</p>
        </div>
        <Link href="/ideas-en-dialogo" className="text-sm text-gold">
          Entrar al foro
        </Link>
      </div>
      {posts.length === 0 ? (
        <EmptyState
          title="Aún no hay debates"
          description="Cuando la comunidad publique conversaciones reales, se listarán aquí. No inventamos hilos de ejemplo."
          actionHref="/ideas-en-dialogo"
          actionLabel="Ir al foro"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/ideas-en-dialogo/${post.slug}`}
              className="rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-gold/40"
            >
              <p className="text-xs text-muted">
                {post.score} pts · {post.commentCount} comentarios
              </p>
              <h3 className="mt-2 font-serif text-lg text-petrol dark:text-ivory">
                {post.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm text-muted">{post.body}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
