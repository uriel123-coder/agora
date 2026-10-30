import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-oh-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/brand/or-hajayim-logo.png"
              alt="Colegio Or Hajayim"
              width={52}
              height={52}
              className="rounded-sm bg-white/95 p-1"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-white/55">
                Colegio Or Hajayim
              </p>
              <p className="font-display text-2xl">Ágora</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/70">
            Un espacio para descubrir, comprender y compartir. Biblioteca digital
            educativa, cultural y colaborativa de nuestra comunidad escolar.
          </p>
        </div>
        <div>
          <h2 className="font-display text-lg text-white">Explorar</h2>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li>
              <Link href="/explorar" className="hover:text-white">
                Catálogo
              </Link>
            </li>
            <li>
              <Link href="/buscar-alumno" className="hover:text-white">
                Buscar alumno
              </Link>
            </li>
            <li>
              <Link href="/tres-mundos-una-historia" className="hover:text-white">
                Tres mundos, una historia
              </Link>
            </li>
            <li>
              <Link href="/voces-creadoras" className="hover:text-white">
                Voces creadoras
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg text-white">Categorías</h2>
          <ul className="mt-3 columns-1 gap-x-6 space-y-2 text-sm text-white/75 sm:columns-2">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug} className="break-inside-avoid">
                <Link href={`/${cat.slug}`} className="hover:text-white">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/50">
        Or Hajayim · Ágora · Solo contenido autorizado · Privacidad escolar primero
      </div>
    </footer>
  );
}
