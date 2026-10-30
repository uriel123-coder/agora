import Link from "next/link";
import { AgoraLogo } from "@/components/shared/Logo";
import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-petrol text-ivory">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <AgoraLogo className="text-ivory" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ivory/75">
            Un espacio para descubrir, comprender y compartir. Biblioteca digital
            educativa, cultural y colaborativa para la comunidad escolar.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-lg">Explorar</h2>
          <ul className="mt-3 space-y-2 text-sm text-ivory/80">
            <li>
              <Link href="/explorar" className="hover:text-gold">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/buscar" className="hover:text-gold">
                Buscador global
              </Link>
            </li>
            <li>
              <Link href="/tres-mundos-una-historia" className="hover:text-gold">
                Tres mundos, una historia
              </Link>
            </li>
            <li>
              <Link href="/ideas-en-dialogo" className="hover:text-gold">
                Ideas en diálogo
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-serif text-lg">Categorías</h2>
          <ul className="mt-3 columns-2 gap-x-6 space-y-2 text-sm text-ivory/80">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug} className="break-inside-avoid">
                <Link href={`/${cat.slug}`} className="hover:text-gold">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-ivory/60">
        Ágora · Contenidos de demostración claramente etiquetados · Privacidad
        escolar primero
      </div>
    </footer>
  );
}
