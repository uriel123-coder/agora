import Image from "next/image";
import Link from "next/link";
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
  const logoSize = size === "lg" ? 56 : size === "sm" ? 36 : 44;

  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-3 text-oh-ink dark:text-foreground",
        className,
      )}
      aria-label="Or Hajayim · Ágora — inicio"
    >
      <Image
        src="/brand/or-hajayim-logo.png"
        alt="Colegio Or Hajayim"
        width={logoSize}
        height={logoSize}
        className="shrink-0 object-contain transition duration-300 group-hover:opacity-90"
        priority
      />
      {showWordmark ? (
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-oh-muted dark:text-muted">
            Or Hajayim
          </span>
          <span className="mt-1 font-display text-xl tracking-tight text-oh-ink dark:text-foreground sm:text-[1.35rem]">
            Ágora
          </span>
          <span className="mt-1 hidden text-[10px] text-oh-muted sm:block dark:text-muted">
            Descubrir · Comprender · Compartir
          </span>
        </span>
      ) : null}
    </Link>
  );
}

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
