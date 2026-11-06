/** Utilidades para enlaces de Drive/Docs/media y previsualización. */

export type MediaKind =
  | "pdf"
  | "google-doc"
  | "document"
  | "image"
  | "video"
  | "youtube"
  | "vimeo"
  | "audio"
  | "link";

export function extractGoogleDocId(url: string): string | null {
  const m = url.match(
    /\/(?:document|presentation|spreadsheets|file)\/d\/([a-zA-Z0-9_-]+)/,
  );
  if (m) return m[1];
  const open = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return open?.[1] ?? null;
}

export function toGooglePreviewUrl(url: string): string | null {
  const id = extractGoogleDocId(url);
  if (!id) return null;
  if (url.includes("/presentation/")) {
    return `https://docs.google.com/presentation/d/${id}/preview`;
  }
  if (url.includes("/spreadsheets/")) {
    return `https://docs.google.com/spreadsheets/d/${id}/preview`;
  }
  if (url.includes("/file/d/") || url.includes("drive.google.com")) {
    return `https://drive.google.com/file/d/${id}/preview`;
  }
  return `https://docs.google.com/document/d/${id}/preview`;
}

export function toGoogleDownloadUrl(url: string): string | null {
  const id = extractGoogleDocId(url);
  if (!id) return null;
  if (url.includes("/document/")) {
    return `https://docs.google.com/document/d/${id}/export?format=pdf`;
  }
  if (url.includes("/presentation/")) {
    return `https://docs.google.com/presentation/d/${id}/export/pdf`;
  }
  if (url.includes("/spreadsheets/")) {
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=pdf`;
  }
  return `https://drive.google.com/uc?export=download&confirm=t&id=${id}`;
}

/** URL de origen para obtener bytes PDF (público). */
export function toEmbeddablePdfUrl(url: string): string | null {
  if (isPdfUrl(url) && !isGoogleWorkspaceUrl(url)) return url;
  const download = toGoogleDownloadUrl(url);
  if (!download) return null;
  if (
    url.includes("/document/") ||
    url.includes("/presentation/") ||
    url.includes("/spreadsheets/")
  ) {
    return download;
  }
  const id = extractGoogleDocId(url);
  if (!id) return null;
  return `https://drive.google.com/uc?export=download&confirm=t&id=${id}`;
}

/** Proxy local: PDF sin UI de Google/Chrome en iframe. */
export function toAgoraPdfProxyUrl(url: string): string {
  return `/api/doc-pdf?url=${encodeURIComponent(url)}`;
}

/** Miniatura proxied (misma en todas las PCs). */
export function toAgoraThumbUrl(fileId: string): string {
  return `/api/media/thumb?id=${encodeURIComponent(fileId)}`;
}

export function isGoogleWorkspaceUrl(url: string): boolean {
  return /docs\.google\.com|drive\.google\.com/i.test(url);
}

export function isDirectImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(url);
}

export function isPdfUrl(url: string): boolean {
  return (
    /\.pdf(\?|$)/i.test(url) ||
    /\/export\?format=pdf/i.test(url) ||
    /\/export\/pdf/i.test(url)
  );
}

export function isOfficeDocUrl(url: string): boolean {
  return /\.(docx?|pptx?|xlsx?|odt|rtf)(\?|$)/i.test(url);
}

export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url);
}

export function isDirectAudioUrl(url: string): boolean {
  return /\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(url);
}

export function youtubeVideoId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
  );
  return m?.[1] ?? null;
}

export function youtubeEmbedUrl(url: string): string | null {
  const id = youtubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function vimeoEmbedUrl(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

/** Solo palabras claras de video — evita falsos positivos. */
function hintSuggestsVideo(hint = ""): boolean {
  return /(^|[\s|:_-])(video|vídeo|mp4|mov|webm|reel)([\s|:_-]|$)/i.test(
    hint.trim(),
  );
}

function hintSuggestsImage(hint = ""): boolean {
  return /(^|[\s|:_-])(imagen|image|foto|photo|png|jpe?g|webp|galer[ií]a)([\s|:_-]|$)/i.test(
    hint.trim(),
  );
}

/** Nombre del archivo / título del enlace (p. ej. video::url o …/clip.mp4). */
function filenameHints(url: string): string {
  try {
    const decoded = decodeURIComponent(url);
    const path = decoded.split("?")[0] ?? decoded;
    const leaf = path.split("/").pop() ?? path;
    return `${decoded} ${leaf}`;
  } catch {
    return url;
  }
}

/** Miniatura para tarjetas: YouTube, imagen, o proxy de Drive. */
export function getMediaThumbnail(
  url: string | undefined,
  coverImage?: string,
): string | null {
  if (coverImage) return coverImage;
  if (!url) return null;
  const yt = youtubeVideoId(url);
  if (yt) return `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`;
  if (isDirectImageUrl(url)) return url;
  const id = extractGoogleDocId(url);
  if (id && isGoogleWorkspaceUrl(url)) return toAgoraThumbUrl(id);
  return null;
}

/**
 * Clasificación inicial (sin llamar a Drive).
 * Archivos /file/d/ sin extensión → "document" (no asumir PDF ni video).
 */
export function detectMediaKind(
  url: string,
  opts?: { mediaType?: string; title?: string },
): MediaKind {
  const fileHint = filenameHints(url);
  const hint = `${opts?.mediaType ?? ""} ${opts?.title ?? ""} ${fileHint}`;
  if (youtubeEmbedUrl(url)) return "youtube";
  if (vimeoEmbedUrl(url)) return "vimeo";
  if (isDirectImageUrl(url) || opts?.mediaType === "image" || hintSuggestsImage(hint)) {
    return "image";
  }
  if (
    isDirectVideoUrl(url) ||
    opts?.mediaType === "video" ||
    hintSuggestsVideo(hint) ||
    /\.(mp4|mov|webm|m4v|mkv)(\?|$)/i.test(fileHint)
  ) {
    return "video";
  }
  if (isDirectAudioUrl(url) || opts?.mediaType === "audio") return "audio";
  if (isPdfUrl(url) || opts?.mediaType === "pdf" || /\.pdf(\?|$)/i.test(fileHint)) {
    return "pdf";
  }
  if (
    isOfficeDocUrl(url) ||
    opts?.mediaType === "document" ||
    /\.(docx?|pptx?|xlsx?)(\?|$)/i.test(fileHint)
  ) {
    return "document";
  }
  if (isGoogleWorkspaceUrl(url)) {
    if (url.includes("/document/") || url.includes("/presentation/")) {
      return "google-doc";
    }
    if (url.includes("/spreadsheets/")) return "document";
    // Drive genérico: documento hasta que /api/media/kind diga otra cosa
    return "document";
  }
  return "link";
}

export function mediaKindLabel(kind: MediaKind): string {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "google-doc":
    case "document":
      return "Documento";
    case "image":
      return "Imagen";
    case "video":
      return "Video";
    case "youtube":
      return "YouTube";
    case "vimeo":
      return "Vimeo";
    case "audio":
      return "Audio";
    default:
      return "Enlace";
  }
}

/** ¿Se puede intentar el visor PDF.js? */
export function kindCanTryPdf(kind: MediaKind): boolean {
  return kind === "pdf" || kind === "google-doc";
}

export function looksLikePdfBytes(bytes: ArrayBuffer): boolean {
  if (bytes.byteLength < 5) return false;
  const head = new Uint8Array(bytes.slice(0, 5));
  return (
    head[0] === 0x25 &&
    head[1] === 0x50 &&
    head[2] === 0x44 &&
    head[3] === 0x46
  ); // %PDF
}

export function mapApiKindToMediaKind(
  apiKind: string | undefined,
): MediaKind | null {
  switch (apiKind) {
    case "video":
      return "video";
    case "image":
      return "image";
    case "audio":
      return "audio";
    case "pdf":
      return "pdf";
    case "document":
    case "google-doc":
      return "document";
    default:
      return null;
  }
}
