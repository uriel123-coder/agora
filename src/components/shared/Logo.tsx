import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function AgoraLogo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const agoraSize = size === "lg" ? 48 : size === "sm" ? 32 : 40;
  const schoolSize = size === "lg" ? 44 : size === "sm" ? 30 : 36;

  return (
    <a
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 text-oh-ink dark:text-foreground",
        className,
      )}
      style={{ touchAction: "manipulation" }}
      aria-label="Ágora · Or Hajayim — inicio"
    >
      <Image
        src="/brand/or-hajayim-logo.png"
        alt=""
        width={schoolSize}
        height={schoolSize}
        className="shrink-0 object-contain"
        priority
      />
      <span
        className="hidden h-8 w-px shrink-0 bg-border sm:block"
        aria-hidden
      />
      <Image
        src="/brand/agora-mark.png"
        alt=""
        width={agoraSize}
        height={agoraSize}
        className="shrink-0 object-contain transition duration-300 group-hover:opacity-90"
        priority
      />
      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="font-display text-xl tracking-tight text-oh-ink dark:text-foreground sm:text-[1.35rem]">
            Ágora
          </span>
          <span className="mt-1 hidden text-[10px] text-oh-muted sm:block dark:text-muted">
            Or Hajayim
          </span>
        </span>
      ) : null}
    </a>
  );
}

/** Marca del colegio. */
export function SchoolMark({
  className,
  size = 120,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/or-hajayim-logo.png"
      alt="Colegio Or Hajayim"
      width={size}
      height={size}
      className={cn("object-contain", className)}
    />
  );
}
