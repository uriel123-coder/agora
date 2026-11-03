/** Utilidades para enlaces de Drive/Docs/media y previsualización. */

export type MediaKind =
  | "pdf"
  | "google-doc"
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
  // confirm=t evita la página intermedia de Google Drive
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

export function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

export function isDirectAudioUrl(url: string): boolean {
  return /\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(url);
}

export function youtubeEmbedUrl(url: string): string | null {
  const m =
    url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
    ) ?? null;
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
}

export function vimeoEmbedUrl(url: string): string | null {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

export function detectMediaKind(url: string): MediaKind {
  if (youtubeEmbedUrl(url)) return "youtube";
  if (vimeoEmbedUrl(url)) return "vimeo";
  if (isDirectImageUrl(url)) return "image";
  if (isDirectVideoUrl(url)) return "video";
  if (isDirectAudioUrl(url)) return "audio";
  if (isPdfUrl(url)) return "pdf";
  if (isGoogleWorkspaceUrl(url)) {
    if (url.includes("/document/") || url.includes("/presentation/")) {
      return "google-doc";
    }
    return "pdf"; // Drive file: intentamos PDF
  }
  return "link";
}

export function mediaKindLabel(kind: MediaKind): string {
  switch (kind) {
    case "pdf":
      return "PDF";
    case "google-doc":
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
