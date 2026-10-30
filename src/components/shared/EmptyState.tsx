import { Button } from "@/components/ui/Button";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="border border-dashed border-border bg-card px-6 py-12 text-center">
      <h3 className="font-display text-2xl text-oh-ink dark:text-foreground">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <div className="mt-6">
          <Button href={actionHref} variant="secondary" size="sm">
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
