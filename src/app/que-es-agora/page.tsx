import type { Metadata } from "next";
import { Info } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Qué es Ágora",
  description:
    "Ágora es la biblioteca digital educativa, cultural y colaborativa del Colegio Or Hajayim.",
};

export default function QueEsAgoraPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Qué es Ágora" }]} />
      <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-muted">
        <Info className="h-3.5 w-3.5 text-oh-blue" aria-hidden />
        Este proyecto
      </p>
      <h1 className="mt-2 font-display text-4xl text-oh-ink dark:text-foreground sm:text-5xl">
        Qué es Ágora
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        «Un espacio para descubrir, comprender y compartir.»
      </p>

      <div className="prose-agora mt-10 text-foreground">
        <p>
          Ágora es la biblioteca digital del{" "}
          <strong>Colegio Or Hajayim Jacobo y Yosi Cojab</strong>: un lugar
          donde la comunidad escolar publica, encuentra y conversa sobre
          trabajos educativos, culturales y creativos.
        </p>
        <p>
          Aquí viven ensayos, cuentos, investigaciones, videos, documentos y
          debates de alumnos y docentes. El objetivo no es acumular archivos:
          es que el conocimiento de la escuela se pueda descubrir con claridad,
          leer con respeto y compartir con sentido.
        </p>
        <h2>Qué puedes hacer</h2>
        <ul>
          <li>Explorar el catálogo por categorías y temas.</li>
          <li>Buscar trabajos, videos, PDFs y publicaciones de alumnos.</li>
          <li>
            Participar en <em>Ideas en diálogo</em>, el foro escolar.
          </li>
          <li>Crear una cuenta para guardar y comentar con tu perfil.</li>
        </ul>
        <h2>Cómo se organiza</h2>
        <p>
          El contenido se agrupa en nueve categorías oficiales —de literatura y
          ciencia a historia, arte, fe y voces creadoras—. Todo lo publicado
          responde a autorización escolar y a la identidad educativa de Or
          Hajayim.
        </p>
      </div>
    </div>
  );
}
