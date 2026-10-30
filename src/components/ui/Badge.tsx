import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  className,
  tone = "default",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "default" | "gold" | "demo" | "muted";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide",
        tone === "default" && "bg-petrol/10 text-petrol dark:bg-gold/15 dark:text-gold",
        tone === "gold" && "bg-gold/20 text-deep dark:text-gold",
        tone === "demo" && "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
        tone === "muted" && "bg-beige text-muted dark:bg-white/10",
        className,
      )}
    >
      {children}
    </span>
  );
}
