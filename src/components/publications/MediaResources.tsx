import { Download, ExternalLink, FileText, ImageIcon, Film, Music } from "lucide-react";
import Image from "next/image";
import type { MediaAsset } from "@/lib/types/content";

function iconFor(type: MediaAsset["type"]) {
  switch (type) {
    case "image":
      return ImageIcon;
    case "video":
      return Film;
    case "audio":
      return Music;
    default:
      return FileText;
  }
}

export function MediaResources({ assets }: { assets: MediaAsset[] }) {
  if (!assets.length) return null;

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-oh-ink dark:text-foreground">
        Recursos y archivos
      </h2>
      <p className="mt-1 text-sm text-muted">
        Abre o descarga cada recurso vinculado a esta publicación.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {assets.map((asset) => {
          const Icon = iconFor(asset.type);
          const label = asset.title || asset.type.toUpperCase();

          if (asset.type === "image") {
            return (
              <figure
                key={asset.id}
                className="overflow-hidden rounded-md border border-border bg-card"
              >
                <div className="relative aspect-[4/3] bg-oh-stone">
                  <Image
                    src={asset.url}
                    alt={asset.alt || label}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </div>
                <figcaption className="flex items-center justify-between gap-2 px-3 py-2.5 text-sm">
                  <span className="truncate">{label}</span>
                  <a
                    href={asset.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-oh-blue hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </a>
                </figcaption>
              </figure>
            );
          }

          return (
            <div
              key={asset.id}
              className="flex items-start gap-3 rounded-md border border-border bg-card p-4"
            >
              <span className="mt-0.5 rounded-sm bg-oh-stone p-2 text-oh-ink dark:bg-white/10 dark:text-foreground">
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-oh-ink dark:text-foreground">
                  {label}
                </p>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-muted">
                  {asset.type}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm">
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-oh-blue hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Abrir
                  </a>
                  <a
                    href={asset.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-oh-blue hover:underline"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
