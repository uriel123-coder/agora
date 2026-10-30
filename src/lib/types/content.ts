/** Tipos canónicos de contenido ÁGORA — compatibles con filas de Google Sheets. */

export type AccessLevel = "public" | "restricted" | "private";

export type PublicationStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

export type ContentType =
  | "articulo"
  | "cuento"
  | "poema"
  | "ensayo"
  | "investigacion"
  | "experimento"
  | "galeria"
  | "video"
  | "audio"
  | "documento"
  | "entrevista"
  | "proyecto"
  | "obra"
  | "reflexion"
  | "otro";

/** Las nueve categorías oficiales — no añadir otras. */
export type CategorySlug =
  | "taller-de-letras"
  | "mentes-curiosas"
  | "fe-y-pensamiento"
  | "shorashim"
  | "ecos-de-la-historia"
  | "tres-mundos-una-historia"
  | "expresiones-del-arte"
  | "ideas-en-dialogo"
  | "voces-creadoras";

export type HistoricalLine = "hebrea-judia" | "mundial" | "mexico" | "comparativa";

export interface Category {
  id: string;
  slug: CategorySlug;
  name: string;
  tagline: string;
  description: string;
  accent: string;
  contentTypes: string[];
  /** Portada visual de la categoría (ruta local o remota). */
  coverImage: string;
}

export interface AuthorRef {
  id: string;
  displayName: string;
  role?: "alumno" | "docente" | "editor" | "invitado" | "institucional";
  studentId?: string;
  /** Solo true si hay autorización explícita para mostrar el nombre. */
  nameVisible: boolean;
}

export interface MediaAsset {
  id: string;
  type: "image" | "video" | "audio" | "pdf" | "document" | "embed";
  url: string;
  title?: string;
  credit?: string;
  alt?: string;
  mimeType?: string;
}

export interface HistoricalLink {
  year?: number;
  yearEnd?: number;
  historicalLine?: HistoricalLine;
  eventId?: string;
  deepUrl?: string;
  label?: string;
}

export interface Publication {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  summary: string;
  body: string;
  coverImage?: string;
  coverAlt?: string;
  categorySlugs: CategorySlug[];
  primaryCategory: CategorySlug;
  contentType: ContentType;
  tags: string[];
  authors: AuthorRef[];
  subject?: string;
  schoolYear?: string;
  publishedAt: string;
  updatedAt?: string;
  status: PublicationStatus;
  accessLevel: AccessLevel;
  featured?: boolean;
  isDemo: boolean;
  bibliography?: string[];
  credits?: string;
  media: MediaAsset[];
  relatedIds: string[];
  historicalLinks: HistoricalLink[];
  /** ID estable de la fila en Google Sheets (cuando exista). */
  sheetsRowId?: string;
  source: "demo" | "google-sheets" | "local";
}

export interface StudentProfile {
  id: string;
  displayName: string;
  /** Si false, no aparece en buscador público ni se indexa. */
  searchable: boolean;
  authorizationStatus: "pending" | "approved" | "denied" | "revoked";
  grade?: string;
  schoolYear?: string;
  portfolioPublicationIds: string[];
  isDemo: boolean;
}

export interface SearchFilters {
  query?: string;
  category?: CategorySlug | "";
  contentType?: ContentType | "";
  tag?: string;
  subject?: string;
  schoolYear?: string;
  author?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
  accessLevel?: AccessLevel;
  sort?: "relevance" | "date" | "title";
  page?: number;
  pageSize?: number;
}

export interface SearchResultItem {
  publication: Publication;
  score: number;
  highlights: { field: string; snippet: string }[];
}

export interface SearchResponse {
  items: SearchResultItem[];
  total: number;
  page: number;
  pageSize: number;
  query: string;
}

export type UserRole =
  | "visitor"
  | "alumno"
  | "docente"
  | "editor"
  | "moderador"
  | "administrador";

export interface AgoraUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string;
  avatarUrl?: string;
  suspended?: boolean;
  createdAt: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  studentId?: string;
  suspended?: boolean;
}
