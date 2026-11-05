import Image from "next/image";
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
              width={48}
              height={48}
              className="rounded-md bg-white/95 p-1 object-contain"
            />
            <span className="h-10 w-px shrink-0 bg-white/20" aria-hidden />
            <Image
              src="/brand/agora-mark.png"
              alt=""
              width={48}
              height={48}
              className="object-contain"
            />
            <div>
              <p className="font-display text-2xl">Ágora</p>
              <p className="text-xs text-white/55">
                Colegio Or Hajayim Jacobo y Yosi Cojab
              </p>
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
              <a href="/explorar" className="hover:text-white">
                Catálogo
              </a>
            </li>
            <li>
              <a href="/buscar-alumno" className="hover:text-white">
                Buscar alumno
              </a>
            </li>
            <li>
              <a href="/tres-mundos-una-historia" className="hover:text-white">
                Tres mundos, una historia
              </a>
            </li>
            <li>
              <a href="/voces-creadoras" className="hover:text-white">
                Voces creadoras
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-lg text-white">Categorías</h2>
          <ul className="mt-3 columns-1 gap-x-6 space-y-2 text-sm text-white/75 sm:columns-2">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug} className="break-inside-avoid">
                <a href={`/${cat.slug}`} className="hover:text-white">
                  {cat.name}
                </a>
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
