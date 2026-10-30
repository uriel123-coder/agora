import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-petrol text-ivory hover:bg-deep focus-visible:ring-gold dark:bg-gold dark:text-deep dark:hover:bg-[#c4ad7a]",
  secondary:
    "bg-transparent text-petrol border border-petrol/25 hover:border-gold hover:text-deep dark:text-ivory dark:border-white/20",
  ghost:
    "bg-transparent text-petrol hover:bg-beige/70 dark:text-ivory dark:hover:bg-white/5",
  gold: "bg-gold text-deep hover:brightness-105 focus-visible:ring-petrol",
} as const;

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-3 text-base",
} as const;

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  href?: string;
  children: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  children,
  ...props
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
