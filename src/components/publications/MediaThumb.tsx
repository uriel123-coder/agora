"use client";

import { useEffect, useState } from "react";
import { FileText, Film, ImageIcon } from "lucide-react";
import {
  extractGoogleDocId,
  isGoogleWorkspaceUrl,
  type MediaKind,
} from "@/lib/utils/media-links";

/** Miniatura con fallback si Drive/la red fallan (evita cuadro vacío o roto). */
export function MediaThumb({
  src,
  accent,
  kind,
  mediaUrl,
  onKindResolved,
}: {
  src: string | null;
  accent: string;
  kind: MediaKind;
  mediaUrl?: string;
  onKindResolved?: (kind: MediaKind) => void;
}) {
  const [failed, setFailed] = useState(false);
  const [resolvedKind, setResolvedKind] = useState<MediaKind>(kind);
  const showImage = Boolean(src) && !failed;
  const Icon =
    resolvedKind === "video" ||
    resolvedKind === "youtube" ||
    resolvedKind === "vimeo"
      ? Film
      : resolvedKind === "image"
        ? ImageIcon
        : FileText;

  useEffect(() => {
    setResolvedKind(kind);
  }, [kind]);

  // Si es Drive y aún no sabemos si es video, preguntar al servidor (API key)
  useEffect(() => {
    if (!mediaUrl || !isGoogleWorkspaceUrl(mediaUrl)) return;
    if (kind === "youtube" || kind === "vimeo" || kind === "image") return;
    if (kind === "video" || kind === "audio") return;
    const id = extractGoogleDocId(mediaUrl);
    if (!id) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/media/kind?id=${encodeURIComponent(id)}`);
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as { kind?: string };
        if (cancelled || !data.kind || data.kind === "unknown") return;
        const next =
          data.kind === "video"
            ? ("video" as const)
            : data.kind === "image"
              ? ("image" as const)
              : data.kind === "pdf"
                ? ("pdf" as const)
                : data.kind === "audio"
                  ? ("audio" as const)
                  : null;
        if (!next) return;
        setResolvedKind(next);
        onKindResolved?.(next);
      } catch {
        /* silencioso */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [kind, mediaUrl, onKindResolved]);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(145deg, ${accent}33, #24374618 55%, #3968cc22)`,
      }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <Icon className="relative z-[1] h-8 w-8 text-oh-blue/70" />
      )}
    </div>
  );
}
