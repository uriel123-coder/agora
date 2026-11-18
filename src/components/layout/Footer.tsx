import Image from "next/image";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-[var(--footer-bg)] text-[var(--footer-fg)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Image
            src="/brand/or-hajayim-logo.png"
            alt="Colegio Or Hajayim"
            width={40}
            height={40}
            className="rounded-md bg-white/95 p-0.5 object-contain"
          />
          <div className="min-w-0">
            <p className="font-display text-lg leading-tight">
              Colegio Or Hajayim Jacobo y Yosi Cojab
            </p>
            <p className="mt-1 text-sm opacity-80">
              Camino a Santiago Yancuitlalpan 17, Jesús del Monte, Huixquilucan,
              Edo. Méx. C.P. 52764
            </p>
            <p className="mt-1 text-sm opacity-80">
              <a href="tel:+525571001000" className="hover:underline">
                (55) 7100-1000
              </a>
              {" · "}
              <a href="mailto:contacto@oh.edu.mx" className="hover:underline">
                contacto@oh.edu.mx
              </a>
            </p>
          </div>
        </div>
        <p className="shrink-0 text-[10px] leading-relaxed opacity-45 sm:max-w-[14rem] sm:text-right">
          Creado por Javier Rubio Patiño · Uriel Nakach · Ágora · Or Hajayim
        </p>
      </div>
    </footer>
  );
}
