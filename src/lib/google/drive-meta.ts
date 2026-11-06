import { google } from "googleapis";
import { getSheetsConfig } from "@/lib/data/providers/sheets";

export type DriveFileKind =
  | "video"
  | "image"
  | "pdf"
  | "audio"
  | "document"
  | "unknown";

export type DriveFileMeta = {
  kind: DriveFileKind;
  mimeType: string;
  name: string;
  thumbnailLink?: string;
};

function classify(mime: string, name: string): DriveFileKind {
  const m = mime.toLowerCase();
  const n = name.toLowerCase();

  if (
    m.startsWith("video/") ||
    m === "application/vnd.google-apps.video" ||
    /\.(mp4|mov|webm|m4v|mkv|avi)$/i.test(n)
  ) {
    return "video";
  }
  if (m.startsWith("image/") || /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(n)) {
    return "image";
  }
  if (m.startsWith("audio/") || /\.(mp3|wav|m4a|aac|ogg)$/i.test(n)) {
    return "audio";
  }
  if (m === "application/pdf" || n.endsWith(".pdf")) {
    return "pdf";
  }
  if (
    m.includes("word") ||
    m.includes("officedocument") ||
    m.includes("msword") ||
    m.includes("opendocument") ||
    m.includes("presentation") ||
    m.includes("spreadsheet") ||
    m.includes("excel") ||
    m.startsWith("application/vnd.google-apps.") ||
    /\.(docx?|pptx?|xlsx?|odt|ods|odp|rtf)$/i.test(n)
  ) {
    return "document";
  }
  if (m.includes("document") || m.startsWith("text/")) {
    return "document";
  }
  return "unknown";
}

async function metaFromServiceAccount(
  id: string,
): Promise<DriveFileMeta | null> {
  const config = getSheetsConfig();
  if (!config.serviceAccountEmail || !config.privateKey) return null;

  try {
    const auth = new google.auth.JWT({
      email: config.serviceAccountEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    const drive = google.drive({ version: "v3", auth });
    const res = await drive.files.get({
      fileId: id,
      fields: "mimeType,name,thumbnailLink",
      supportsAllDrives: true,
    });
    const mimeType = res.data.mimeType ?? "";
    const name = res.data.name ?? "";
    return {
      kind: classify(mimeType, name),
      mimeType,
      name,
      thumbnailLink: res.data.thumbnailLink ?? undefined,
    };
  } catch {
    return null;
  }
}

async function metaFromApiKey(id: string): Promise<DriveFileMeta | null> {
  const key = process.env.GOOGLE_SHEETS_API_KEY?.trim();
  if (!key) return null;
  try {
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?fields=mimeType,name,thumbnailLink&key=${key}&supportsAllDrives=true`,
      { next: { revalidate: 3600 } },
    );
    if (!metaRes.ok) return null;
    const meta = (await metaRes.json()) as {
      mimeType?: string;
      name?: string;
      thumbnailLink?: string;
    };
    const mimeType = meta.mimeType ?? "";
    const name = meta.name ?? "";
    return {
      kind: classify(mimeType, name),
      mimeType,
      name,
      thumbnailLink: meta.thumbnailLink,
    };
  } catch {
    return null;
  }
}

/** HEAD/GET corto a uc?export=download para ver Content-Type público. */
async function metaFromPublicHeaders(id: string): Promise<DriveFileMeta | null> {
  const urls = [
    `https://drive.google.com/uc?export=download&id=${id}`,
    `https://drive.google.com/uc?id=${id}&export=download`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; AgoraOrHajayim/1.0; +https://agora)",
        },
      });
      const type = (res.headers.get("content-type") || "").split(";")[0].trim();
      if (!type || type.includes("text/html")) continue;
      const kind = classify(type, "");
      if (kind === "unknown") continue;
      return { kind, mimeType: type, name: "" };
    } catch {
      /* siguiente */
    }
  }
  return null;
}

/** Página pública de Drive: busca señales de video/pdf/imagen. */
async function metaFromPublicPage(id: string): Promise<DriveFileMeta | null> {
  try {
    const res = await fetch(`https://drive.google.com/file/d/${id}/view`, {
      redirect: "follow",
      headers: {
        Accept: "text/html",
        "User-Agent":
          "Mozilla/5.0 (compatible; AgoraOrHajayim/1.0; +https://agora)",
      },
    });
    if (!res.ok) return null;
    const html = (await res.text()).slice(0, 120_000);
    const mimeMatch = html.match(/"mimeType"\s*:\s*"([^"]+)"/i);
    const nameMatch = html.match(/"title"\s*:\s*"([^"]+)"/i);
    const mime = mimeMatch?.[1] ?? "";
    const name = nameMatch?.[1] ?? "";
    if (mime) {
      return { kind: classify(mime, name), mimeType: mime, name };
    }
    if (
      /video\/mp4|DriveVideo|video-preview|isVideo["']?\s*:\s*true/i.test(html)
    ) {
      return { kind: "video", mimeType: "video/mp4", name };
    }
    if (/application\/pdf|"pdf"/i.test(html) && /viewer/i.test(html)) {
      return { kind: "pdf", mimeType: "application/pdf", name };
    }
  } catch {
    /* ignore */
  }
  return null;
}

/**
 * Resuelve mime/tipo de un archivo de Drive.
 * Orden: service account → API key → cabeceras públicas.
 */
export async function getDriveFileMeta(id: string): Promise<DriveFileMeta> {
  const viaSa = await metaFromServiceAccount(id);
  if (viaSa && viaSa.kind !== "unknown") return viaSa;

  const viaKey = await metaFromApiKey(id);
  if (viaKey && viaKey.kind !== "unknown") return viaKey;

  const viaHead = await metaFromPublicHeaders(id);
  if (viaHead) return viaHead;

  const viaPage = await metaFromPublicPage(id);
  if (viaPage && viaPage.kind !== "unknown") return viaPage;

  // Devolver lo que haya (aunque unknown) para thumbnails
  return (
    viaSa ??
    viaKey ??
    viaPage ?? { kind: "unknown", mimeType: "", name: "" }
  );
}
