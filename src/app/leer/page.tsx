import type { Metadata } from "next";
import Link from "next/link";
import { DocumentPanel } from "@/components/publications/DocumentPanel";

export const metadata: Metadata = {
  title: "Leer",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ url?: string; titulo?: string }>;
};

/** Lectura a pantalla completa con el visor de Ágora (sin UI de Google). */
export default async function LeerPage({ searchParams }: Props) {
  const sp = await searchParams;
  const url = (sp.url ?? "").trim();
  const title = (sp.titulo ?? "Documento").trim() || "Documento";

  if (!url || !/^https?:\/\//i.test(url)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="font-display text-2xl">Falta el enlace del documento</h1>
        <Link href="/buscar" className="mt-4 inline-block text-oh-blue hover:underline">
          Ir a buscar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/" className="text-sm text-oh-blue hover:underline">
        ← Ágora
      </Link>
      <DocumentPanel title={title} url={url} />
    </div>
  );
}
