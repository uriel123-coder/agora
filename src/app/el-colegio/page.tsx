import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export const metadata: Metadata = {
  title: "El colegio",
  description:
    "Colegio Or Hajayim Jacobo y Yosi Cojab: misión, identidad y comunidad escolar.",
};

export default function ElColegioPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "El colegio" }]} />
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
        Or Hajayim
      </p>
      <h1 className="mt-2 font-display text-4xl text-oh-ink dark:text-foreground sm:text-5xl">
        Qué escuela es
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted">
        Colegio Or Hajayim Jacobo y Yosi Cojab — una institución educativa
        judía en Huixquilucan, Estado de México.
      </p>

      <div className="prose-agora mt-10 text-foreground">
        <h2>Misión</h2>
        <p>
          Somos una institución educativa que forma individuos empoderados para
          vivir con excelencia, así como conectados de manera congruente,
          constante y comprometida con Hashem, la Torá y Éretz Israel.
          Contribuyendo así, activa y positivamente a su comunidad, a su país y
          al mundo.
        </p>
        <p>
          Educamos alumnos con habilidades y destrezas para tomar sus propias
          decisiones y contribuir de forma activa en el escenario mundial —no
          solo como observadores—, empoderados para ser lo que elijan en su
          vida privada y pública.
        </p>
        <p>
          Los alumnos se educan con un <em>Ahavat Hatorá</em> (amor a la Torá)
          que genera una conexión profunda, significativa y constante con
          Hashem, Su Torá y Eretz Israel, y les permite descubrir la belleza
          del judaísmo.
        </p>
        <p>
          Queremos que sean para siempre judíos llenos de Torá y, a la vez,
          grandes ciudadanos de la humanidad y contribuyentes a la sociedad.
        </p>

        <h2>Mensaje del director</h2>
        <p>
          Bienvenidos a una escuela única en sus características. En el colegio
          Or Hajayim —basado en la ideología de{" "}
          <strong>Torá Im Dérej Éretz</strong>— entendemos que el judaísmo no
          es un aspecto en la vida de nuestros alumnos, sino que atraviesa
          nuestras formas de actuar, pensar y sentir.
        </p>
        <p>
          Acompañamos y motivamos a nuestros alumnos para que sean seres
          integrados, en los cuales su identidad judía potencia una excelencia
          académica y un sentido de misión: hacer de este mundo un lugar mejor.
        </p>
        <p className="text-sm text-muted">
          Rab Isaac Sitt · Director General
        </p>

        <h2>Tres pilares</h2>
        <ul>
          <li>
            <strong>La Halajá</strong> — brújula para identificar el bien y el
            mal.
          </li>
          <li>
            <strong>La congruencia</strong> — la teoría y la realidad se
            encuentran en la escuela.
          </li>
          <li>
            <strong>Ciudadanía judía global</strong> — la responsabilidad de
            ser parte del pueblo judío.
          </li>
        </ul>

        <h2>Como judíos mexicanos</h2>
        <p>
          Reconocemos y respetamos la historia y la cultura de nuestro país y
          trabajamos para ser miembros contribuyentes de la sociedad. La
          excelencia en la educación, tanto judía como secular, es nuestra
          obligación.
        </p>

        <h2>Contacto</h2>
        <p>
          Camino a Santiago Yancuitlalpan 17, Jesús del Monte, Huixquilucan,
          Edo. Méx. C.P. 52764
          <br />
          Tel.{" "}
          <a href="tel:+525571001000">(55) 7100-1000</a>
          <br />
          <a href="mailto:contacto@oh.edu.mx">contacto@oh.edu.mx</a>
          <br />
          <a
            href="https://oh.edu.mx/quienes-somos/"
            target="_blank"
            rel="noopener noreferrer"
          >
            oh.edu.mx — Quiénes somos
          </a>
        </p>
      </div>
    </div>
  );
}
