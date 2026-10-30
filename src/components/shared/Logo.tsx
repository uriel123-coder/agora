import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function AgoraLogo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-center gap-2.5 text-petrol dark:text-ivory",
        className,
      )}
      aria-label="Ágora — inicio"
    >
      <svg
        width="36"
        height="36"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
        className="shrink-0 transition-transform duration-300 group-hover:scale-[1.03]"
      >
        <rect width="64" height="64" rx="14" fill="currentColor" className="text-petrol dark:text-gold" />
        <path
          d="M14 42V22.5c0-1.2.7-2.3 1.8-2.8L30 13.2c1.3-.6 2.7-.6 4 0l14.2 6.5c1.1.5 1.8 1.6 1.8 2.8V42"
          stroke="#F8F5EE"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M32 20v24"
          stroke="#B49A65"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M22 34c2.5 3 7.5 3 10 0M32 34c2.5 3 7.5 3 10 0"
          stroke="#F8F5EE"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="22" cy="34" r="2.2" fill="#B49A65" />
        <circle cx="42" cy="34" r="2.2" fill="#B49A65" />
      </svg>
      {showWordmark ? (
        <span className="flex flex-col leading-none">
          <span className="font-serif text-xl tracking-tight">Ágora</span>
          <span className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">
            Descubrir · Comprender · Compartir
          </span>
        </span>
      ) : null}
    </Link>
  );
}
