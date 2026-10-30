import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary:
    "bg-oh-blue text-white hover:bg-oh-blue-deep focus-visible:ring-oh-blue",
  secondary:
    "bg-transparent text-oh-ink border border-oh-ink/25 hover:border-oh-blue hover:text-oh-blue dark:text-foreground dark:border-white/25",
  ghost:
    "bg-transparent text-oh-ink hover:bg-oh-stone dark:text-foreground dark:hover:bg-white/5",
  soft: "bg-oh-stone text-oh-ink hover:bg-oh-line dark:bg-white/10 dark:text-foreground",
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
  external?: boolean;
  children: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  href,
  external = false,
  children,
  ...props
}: Props) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-sm font-medium transition duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    if (external || href.startsWith("http")) {
      return (
        <a
          href={href}
          className={classes}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      );
    }
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
