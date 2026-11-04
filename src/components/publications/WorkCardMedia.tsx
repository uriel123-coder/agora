"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { MediaThumb } from "@/components/publications/MediaThumb";
import {
  mediaKindLabel,
  type MediaKind,
} from "@/lib/utils/media-links";

/** Miniatura + etiqueta estable (solo Video si Drive confirma mime). */
export function WorkCardMedia({
  src,
  accent,
  kind: initialKind,
  mediaUrl,
}: {
  src: string | null;
  accent: string;
  kind: MediaKind;
  mediaUrl?: string;
}) {
  const [kind, setKind] = useState(initialKind);
  const isVideo =
    kind === "youtube" || kind === "vimeo" || kind === "video";

  return (
    <>
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
    </>
  );
}
