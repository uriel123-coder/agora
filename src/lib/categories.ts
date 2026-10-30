import type { Category, CategorySlug } from "@/lib/types/content";

export const CATEGORIES: Category[] = [
  {
    id: "cat-taller",
    slug: "taller-de-letras",
    name: "Taller de letras",
    tagline: "Literatura y creación escrita",
    description:
      "Cuentos, fábulas, poemas, leyendas, relatos, ensayos literarios, escritura creativa y antologías.",
    accent: "#5B7C8A",
    contentTypes: [
      "Cuentos",
      "Fábulas",
      "Poemas",
      "Leyendas",
      "Relatos",
      "Ensayos literarios",
      "Escritura creativa",
      "Antologías",
    ],
  },
  {
    id: "cat-mentes",
    slug: "mentes-curiosas",
    name: "Mentes curiosas",
    tagline: "Ciencia, investigación y descubrimiento",
    description:
      "Física, química, biología, astronomía, matemáticas, tecnología, experimentos y divulgación científica.",
    accent: "#3D7A6A",
    contentTypes: [
      "Física",
      "Química",
      "Biología",
      "Astronomía",
      "Matemáticas",
      "Tecnología",
      "Experimentos",
      "Descubrimientos",
      "Divulgación científica",
    ],
  },
  {
    id: "cat-fe",
    slug: "fe-y-pensamiento",
    name: "Fe y pensamiento",
    tagline: "Reflexión, ética y tradiciones",
    description:
      "Textos religiosos, reflexiones, filosofía, ética, tradiciones, interpretaciones y estudios culturales, con enfoque educativo y respetuoso.",
    accent: "#7A6B8A",
    contentTypes: [
      "Textos religiosos",
      "Reflexiones",
      "Filosofía",
      "Ética",
      "Tradiciones",
      "Interpretaciones",
      "Preguntas de pensamiento",
      "Estudios culturales",
    ],
  },
  {
    id: "cat-shorashim",
    slug: "shorashim",
    name: "Shorashim",
    tagline: "Raíces, memoria e identidad",
    description:
      "Tradiciones judías, festividades, historia y memoria, cultura, identidad, costumbres, lengua hebrea y raíces comunitarias autorizadas.",
    accent: "#8A6B3D",
    contentTypes: [
      "Tradiciones judías",
      "Festividades",
      "Historia y memoria",
      "Cultura",
      "Identidad",
      "Costumbres",
      "Lengua hebrea",
      "Raíces familiares",
      "Textos educativos",
    ],
  },
  {
    id: "cat-ecos",
    slug: "ecos-de-la-historia",
    name: "Ecos de la historia",
    tagline: "Civilizaciones, personajes y procesos",
    description:
      "Civilizaciones, acontecimientos, personajes, documentos, mapas, investigaciones y artículos históricos.",
    accent: "#8A4F3D",
    contentTypes: [
      "Civilizaciones",
      "Acontecimientos",
      "Personajes",
      "Procesos históricos",
      "Documentos",
      "Mapas",
      "Investigaciones",
      "Artículos y videos",
    ],
  },
  {
    id: "cat-tres",
    slug: "tres-mundos-una-historia",
    name: "Tres mundos, una historia",
    tagline: "Tres historias. Un mismo tiempo. Infinitas conexiones",
    description:
      "Cronología comparativa oficial de historia hebrea y judía, historia mundial e historia de México. En Ágora es un puente al proyecto existente; no la rehacemos aquí.",
    accent: "#B49A65",
    contentTypes: [
      "Historia hebrea y judía",
      "Historia mundial",
      "Historia de México",
      "Comparativas",
    ],
  },
  {
    id: "cat-arte",
    slug: "expresiones-del-arte",
    name: "Expresiones del arte",
    tagline: "Galería cultural y artística",
    description:
      "Pintura, escultura, fotografía, arquitectura, música, cine, ilustración y producciones artísticas estudiantiles.",
    accent: "#6A5B8A",
    contentTypes: [
      "Pintura",
      "Escultura",
      "Fotografía",
      "Arquitectura",
      "Música",
      "Cine",
      "Ilustración",
      "Movimientos artísticos",
      "Producciones estudiantiles",
    ],
  },
  {
    id: "cat-ideas",
    slug: "ideas-en-dialogo",
    name: "Ideas en diálogo",
    tagline: "Comunidad de discusión escolar",
    description:
      "Foro interactivo para debatir con respeto: publicaciones, comentarios, votos, espacios temáticos y moderación.",
    accent: "#3D6A8A",
    contentTypes: ["Debates", "Preguntas", "Temas", "Espacios moderados"],
  },
  {
    id: "cat-voces",
    slug: "voces-creadoras",
    name: "Voces creadoras",
    tagline: "Talento y producciones estudiantiles",
    description:
      "Investigaciones, artículos, entrevistas, videos, podcasts, proyectos escolares y trabajos interdisciplinarios.",
    accent: "#5A7A4D",
    contentTypes: [
      "Investigaciones",
      "Artículos",
      "Entrevistas",
      "Videos",
      "Podcasts",
      "Proyectos escolares",
      "Textos literarios",
      "Presentaciones",
      "Documentales",
    ],
  },
];

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
) as Record<CategorySlug, Category>;

export function getCategory(slug: CategorySlug): Category {
  return CATEGORY_BY_SLUG[slug];
}

export const TIMELINE_EXTERNAL_URL =
  "https://linea-comparativa-2027.vercel.app/";
