"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AgoraLogo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils/cn";
import type { SessionUser } from "@/lib/types/content";
import { canAccessAdmin } from "@/lib/auth/client-roles";

const mainLinks = [
  { href: "/", label: "Inicio" },
  { href: "/explorar", label: "Explorar" },
  { href: "/categorias", label: "Categorías" },
  { href: "/tres-mundos-una-historia", label: "Línea del tiempo" },
  { href: "/ideas-en-dialogo", label: "Ideas en diálogo" },
  { href: "/voces-creadoras", label: "Voces creadoras" },
  { href: "/buscar-alumno", label: "Buscar alumno" },
];

export function Header({
  user,
  onOpenSearch,
}: {
  user: SessionUser | null;
  onOpenSearch: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setCatsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-[var(--header-bg)]/92 shadow-[0_1px_0_color-mix(in_oklab,var(--gold)_18%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <AgoraLogo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {mainLinks.map((link) =>
            link.label === "Categorías" ? (
              <div key={link.href} className="relative">
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm transition hover:text-gold",
                    pathname.startsWith("/categorias") ||
                      CATEGORIES.some((c) => pathname.startsWith(`/${c.slug}`))
                      ? "text-gold"
                      : "text-foreground",
                  )}
                  aria-expanded={catsOpen}
                  onClick={() => setCatsOpen((v) => !v)}
                >
                  Categorías <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {catsOpen ? (
                  <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-xl border border-border bg-card p-2 shadow-lg">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/${cat.slug}`}
                        className="block rounded-lg px-3 py-2 text-sm hover:bg-beige/60 dark:hover:bg-white/5"
                      >
                        <span className="font-medium">{cat.name}</span>
                        <span className="mt-0.5 block text-xs text-muted">
                          {cat.tagline}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition hover:text-gold",
                  pathname === link.href ? "text-gold" : "text-foreground",
                )}
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted transition hover:border-gold hover:text-foreground"
            aria-label="Abrir buscador global"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden rounded border border-border px-1.5 text-[10px] md:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          {user ? (
            <Link
              href="/mi-agora"
              className="hidden rounded-md bg-petrol px-3 py-2 text-sm text-ivory sm:inline-flex dark:bg-gold dark:text-deep"
            >
              Mi cuenta
            </Link>
          ) : (
            <Link
              href="/acceder"
              className="hidden rounded-md bg-petrol px-3 py-2 text-sm text-ivory sm:inline-flex dark:bg-gold dark:text-deep"
            >
              Acceder
            </Link>
          )}
          {user && canAccessAdmin(user.role) ? (
            <Link
              href="/admin"
              className="hidden rounded-md border border-gold/50 px-3 py-2 text-sm text-gold lg:inline-flex"
            >
              Admin
            </Link>
          ) : null}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Móvil">
            {mainLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm hover:bg-beige/50 dark:hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <p className="mt-3 px-3 text-xs uppercase tracking-wider text-muted">
              Categorías
            </p>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="rounded-md px-3 py-2 text-sm hover:bg-beige/50 dark:hover:bg-white/5"
              >
                {cat.name}
              </Link>
            ))}
            <Link href="/buscar" className="rounded-md px-3 py-2 text-sm">
              Buscador global
            </Link>
            <Link
              href={user ? "/mi-agora" : "/acceder"}
              className="rounded-md px-3 py-2 text-sm"
            >
              {user ? "Mi cuenta" : "Acceder"}
            </Link>
            {user && canAccessAdmin(user.role) ? (
              <Link href="/admin" className="rounded-md px-3 py-2 text-sm text-gold">
                Administración
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
