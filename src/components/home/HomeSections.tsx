import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, History, Search } from "lucide-react";
import { PublicationCard } from "@/components/publications/PublicationCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CATEGORIES, TIMELINE_EXTERNAL_URL } from "@/lib/categories";
import type { ForumPost } from "@/lib/forum/store";
import type { Publication } from "@/lib/types/content";

export function HomeHero() {
  return (
    <section className="hero-grid relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
        <div className="animate-fade-up">
          <p className="mb-5 font-serif text-3xl text-petrol dark:text-ivory sm:text-4xl">
            Ágora
          </p>
          <div className="editorial-rule mb-6 w-40" />
          <h1 className="font-serif text-4xl leading-[1.08] text-petrol dark:text-ivory sm:text-5xl lg:text-[3.65rem]">
            Cada idea merece un espacio.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Explora historias, descubre conocimientos y conoce el talento de
            nuestra comunidad.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/explorar" size="lg">
              Explorar contenidos
            </Button>
            <Button
              href="/tres-mundos-una-historia"
              variant="secondary"
              size="lg"
            >
              Recorrer la historia
            </Button>
          </div>
        </div>
        <div className="animate-fade-up-delay relative aspect-[4/3] overflow-hidden rounded-[1.35rem] border border-border shadow-[var(--shadow-soft)]">
          <Image
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&q=80"
            alt="Composición editorial con libros y luz natural"
            fill
            priority
            className="object-cover"
            sizes="(max-width:1024px) 100vw, 45vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep/65 via-deep/10 to-transparent" />
          <p className="absolute bottom-5 left-5 right-5 font-serif text-xl leading-snug text-ivory sm:text-2xl">
            «Un espacio para descubrir, comprender y compartir»
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomeSearchBand() {
  return (
    <section className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-petrol dark:text-ivory">
            Buscador universal
          </h2>
          <p className="mt-1 text-sm text-muted">
            Título, autor, etiquetas, materia, ciclo escolar y más. Atajo ⌘K /
            Ctrl+K.
          </p>
        </div>
        <Button href="/buscar" variant="secondary">
          <Search className="h-4 w-4" />
          Abrir buscador avanzado
        </Button>
      </div>
    </section>
  );
}

export function CategoryGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl text-petrol dark:text-ivory">
            Nueve caminos para explorar
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            Las categorías oficiales de Ágora. Cada una con identidad propia y
            conexiones con el resto del ecosistema.
          </p>
        </div>
        <Link
          href="/categorias"
          className="hidden items-center gap-1 text-sm text-gold sm:inline-flex"
        >
          Ver todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className="surface-card group rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/45"
          >
            <span
              className="mb-5 inline-block h-1 w-12 rounded-full"
              style={{ background: cat.accent }}
              aria-hidden
            />
            <h3 className="font-serif text-[1.35rem] text-petrol transition-colors group-hover:text-gold dark:text-ivory">
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
}: {
  title: string;
  subtitle: string;
  publications: Publication[];
  href: string;
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
        <Link href={href} className="text-sm text-gold hover:underline">
          Ver más
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {publications.map((pub) => (
          <PublicationCard key={pub.id} publication={pub} />
        ))}
      </div>
    </section>
  );
}

export function TimelineSpotlight() {
  return (
    <section className="border-y border-border bg-petrol text-ivory">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <Badge tone="gold">Sección central</Badge>
          <h2 className="mt-4 font-serif text-3xl sm:text-4xl">
            Tres mundos, una historia
          </h2>
          <p className="mt-3 max-w-xl text-lg text-ivory/80">
            «Tres historias. Un mismo tiempo. Infinitas conexiones».
          </p>
          <p className="mt-4 max-w-xl text-sm text-ivory/70">
            Cronología comparativa de historia hebrea y judía, historia mundial e
            historia de México. Integrada desde el proyecto existente.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/tres-mundos-una-historia" variant="gold">
              <History className="h-4 w-4" />
              Abrir en Ágora
            </Button>
            <Button
              href={TIMELINE_EXTERNAL_URL}
              variant="secondary"
              className="border-white/30 text-ivory hover:border-gold hover:text-gold"
            >
              Sitio original
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/15 bg-deep/40 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-gold">
            Conexiones
          </p>
          <ul className="mt-4 space-y-3 text-sm text-ivory/80">
            <li>Ecos de la historia ↔ acontecimientos</li>
            <li>Shorashim ↔ memoria e identidad</li>
            <li>Publicaciones con año, línea e identificador</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function StudentSearchCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-petrol dark:text-ivory">
            Buscar producciones estudiantiles
          </h2>
          <p className="mt-2 max-w-xl text-muted">
            Encuentra trabajos autorizados por nombre, materia, ciclo escolar o
            tipo de recurso. Los perfiles de menores están restringidos por
            defecto.
          </p>
        </div>
        <Button href="/buscar-alumno">
          <Compass className="h-4 w-4" />
          Buscar alumno
        </Button>
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
      <div className="grid gap-4 md:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/ideas-en-dialogo/${post.slug}`}
            className="rounded-xl border border-border bg-card p-5 transition hover:border-gold/40"
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
    </section>
  );
}
