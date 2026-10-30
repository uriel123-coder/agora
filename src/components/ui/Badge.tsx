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
        "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium tracking-wide",
        tone === "default" && "bg-oh-blue/10 text-oh-blue-deep dark:bg-oh-blue/20 dark:text-[#9db4ef]",
        tone === "gold" && "bg-oh-blue/15 text-oh-ink dark:text-[#c5d4f5]",
        tone === "demo" && "bg-amber-100 text-amber-950 dark:bg-amber-950/40 dark:text-amber-100",
        tone === "muted" && "bg-oh-stone text-muted dark:bg-white/10",
        className,
      )}
    >
      {children}
    </span>
  );
}
