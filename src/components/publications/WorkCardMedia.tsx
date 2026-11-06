"use client";

import { useState, type ReactNode } from "react";
import { Play } from "lucide-react";
import { MediaThumb } from "@/components/publications/MediaThumb";
import {
  mediaKindLabel,
  type MediaKind,
} from "@/lib/utils/media-links";

/** Miniatura + etiqueta + CTA; actualiza a Video cuando Drive confirma. */
export function WorkCardMedia({
  src,
  accent,
  kind: initialKind,
  mediaUrl,
  children,
}: {
  src: string | null;
  accent: string;
  kind: MediaKind;
  mediaUrl?: string;
  children: (ctx: { kind: MediaKind; isVideo: boolean }) => ReactNode;
}) {
  const [kind, setKind] = useState(initialKind);
  const isVideo =
    kind === "youtube" || kind === "vimeo" || kind === "video";

  return (
    <>
      <div className="relative aspect-[16/11] overflow-hidden bg-oh-stone">
        <MediaThumb
          src={src}
          accent={accent}
          kind={initialKind}
          mediaUrl={mediaUrl}
          onKindResolved={setKind}
        />
        <span className="absolute bottom-2 left-2 z-[2] inline-flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {isVideo ? (
            <>
              <Play className="h-3 w-3 fill-white" />
              Video
            </>
          ) : (
            mediaKindLabel(kind)
          )}
        </span>
        {isVideo ? (
          <span
            className="pointer-events-none absolute inset-0 z-[1] flex items-center justify-center"
            aria-hidden
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white shadow-lg backdrop-blur-sm">
              <Play className="h-5 w-5 fill-white pl-0.5" />
            </span>
          </span>
        ) : null}
      </div>
      {children({ kind, isVideo })}
    </>
  );
}
