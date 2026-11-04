export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Miga de pan" className="mb-6 text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <a href="/" className="hover:text-oh-blue" style={{ touchAction: "manipulation" }}>
            Inicio
          </a>
        </li>
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-oh-blue"
                style={{ touchAction: "manipulation" }}
              >
                {item.label}
              </a>
            ) : (
              <span className="text-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
