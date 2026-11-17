import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "Filosofía",
  description:
    "Torá Im Dérej Éretz: la filosofía educativa del Colegio Or Hajayim.",
};

const pillars = [
  "Torá Im Dérej Éretz",
  "Enseñanza",
  "Amor a Éretz Israel y Am Israel",
  "Liderazgo",
  "Valores",
  "Amor a la Torá",
];

export default function FilosofiaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Filosofía" }]} />
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
        Ideología educativa
      </p>
      <h1 className="mt-2 font-display text-4xl text-oh-ink dark:text-foreground sm:text-5xl">
        Filosofía de la escuela
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Torá Im Dérej Éretz — integrar la Torá con la vida en el mundo.
      </p>

      <div className="prose-agora mt-10 text-foreground">
        <p>
          Nuestra filosofía y forma de vida es{" "}
          <strong>Torá Im Dérej Éretz</strong>. Or Hajayim promueve el estudio
          de la Torá, valores e identidad, al mismo tiempo que educa y
          proporciona las herramientas necesarias para que los alumnos
          triunfen en el ámbito que deseen.
        </p>
        <p>
          Torá Im Dérej Éretz significa integrar todas nuestras acciones y
          actividades en este mundo con Torá. Es una sinergia completa: el
          judaísmo no es un añadido a la vida; la comprende por entero.
        </p>

        <blockquote>
          «El judaísmo no es un mero añadido a la vida: comprende TODA la vida.
          Ser judío no es una mera parte, es la suma total de nuestra tarea en
          la vida. Ser judío en la sinagoga y en la cocina, en el campo y en el
          almacén, en la oficina y en el púlpito… con la aguja y el buril, con
          la pluma y el cincel, eso es lo que significa ser judío.»
          <br />
          <span className="not-italic text-sm">
            — Rav Hirsch ז״ל, fundador de Torá Im Dérej Éretz
          </span>
        </blockquote>

        <h2>Pilares</h2>
        <ul>
          {pillars.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <h2>En la práctica escolar</h2>
        <p>
          En Or Hajayim el judaísmo atraviesa las formas de actuar, pensar y
          sentir. La identidad judía potencia la excelencia académica y un
          sentido de misión: contribuir a la comunidad, al país y al mundo.
        </p>
        <p>
          Al incorporar valores y conocimientos de la Torá en las actividades
          cotidianas, los alumnos inspiran con congruencia: un judaísmo
          apasionado sin renunciar a participar en el mundo de manera
          proactiva.
        </p>
        <p>
          Desarrollamos pensamiento crítico, habilidades y conocimientos para
          el siguiente paso académico, valorando la individualidad de cada
          alumno y su crecimiento personal.
        </p>

        <p className="text-sm text-muted">
          Texto basado en{" "}
          <a
            href="https://oh.edu.mx/tora/"
            target="_blank"
            rel="noopener noreferrer"
          >
            oh.edu.mx/tora
          </a>{" "}
          y{" "}
          <a
            href="https://oh.edu.mx/quienes-somos/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Quiénes somos
          </a>
          .
        </p>
      </div>
    </div>
  );
}
