/** Utilidades para enlaces de Drive/Docs y previsualización. */

export function extractGoogleDocId(url: string): string | null {
  const m = url.match(/\/(?:document|presentation|spreadsheets|file)\/d\/([a-zA-Z0-9_-]+)/);
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
  return `https://drive.google.com/uc?export=download&id=${id}`;
}

/** URL embebible en el visor nativo del navegador (sin UI de Google). */
export function toEmbeddablePdfUrl(url: string): string | null {
  if (isPdfUrl(url) && !isGoogleWorkspaceUrl(url)) return url;
  const download = toGoogleDownloadUrl(url);
  if (!download) return null;
  if (url.includes("/document/") || url.includes("/presentation/") || url.includes("/spreadsheets/")) {
    return download;
  }
  // Archivos de Drive: vista directa si es PDF público
  const id = extractGoogleDocId(url);
  if (!id) return null;
  return `https://drive.google.com/uc?export=view&id=${id}`;
}

export function isGoogleWorkspaceUrl(url: string): boolean {
  return /docs\.google\.com|drive\.google\.com/i.test(url);
}

export function isDirectImageUrl(url: string): boolean {
  return /\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/i.test(url);
}

export function isPdfUrl(url: string): boolean {
  return /\.pdf(\?|$)/i.test(url) || /\/export\?format=pdf/i.test(url) || /\/export\/pdf/i.test(url);
}
