"use client";

import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AgoraLogo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils/cn";
import type { SessionUser } from "@/lib/types/content";
import { canAccessAdmin } from "@/lib/auth/client-roles";

const mainLinks = [
  { href: "/", label: "Inicio" },
  { href: "/explorar", label: "Explorar" },
  { href: "/#categorias", label: "Categorías" },
  { href: "/voces-creadoras", label: "Voces creadoras" },
  { href: "/buscar", label: "Buscar" },
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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--header-bg)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <AgoraLogo size="md" />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {mainLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ touchAction: "manipulation" }}
              className={cn(
                "rounded-lg px-3 py-2.5 text-sm transition hover:text-oh-blue",
                pathname === link.href ||
                  (link.href !== "/" &&
                    !link.href.includes("#") &&
                    pathname.startsWith(link.href))
                  ? "text-oh-blue"
                  : "text-foreground/85",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            style={{ touchAction: "manipulation" }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-3.5 py-2 text-sm text-muted transition hover:border-oh-blue hover:text-oh-blue"
            aria-label="Abrir buscador global"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden rounded-md border border-border px-1.5 text-[10px] md:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <a
            href={user ? "/mi-agora" : "/acceder"}
            style={{ touchAction: "manipulation" }}
            className="hidden min-h-11 items-center rounded-xl bg-oh-ink px-4 py-2 text-sm text-white sm:inline-flex hover:bg-oh-ink-deep dark:bg-oh-blue"
          >
            {user ? "Mi cuenta" : "Acceder"}
          </a>
          {user && canAccessAdmin(user.role) ? (
            <a
              href="/admin"
              style={{ touchAction: "manipulation" }}
              className="hidden min-h-11 items-center rounded-xl border border-oh-blue/40 px-3 py-2 text-sm text-oh-blue lg:inline-flex"
            >
              Admin
            </a>
          ) : null}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border lg:hidden"
            style={{ touchAction: "manipulation" }}
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
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-3 text-sm hover:bg-oh-stone dark:hover:bg-white/5"
                style={{ touchAction: "manipulation" }}
              >
                {link.label}
              </a>
            ))}
            <a
              href="/categorias"
              className="rounded-lg px-3 py-3 text-sm"
              style={{ touchAction: "manipulation" }}
            >
              Todas las categorías
            </a>
            <a
              href={user ? "/mi-agora" : "/acceder"}
              className="rounded-lg px-3 py-3 text-sm"
              style={{ touchAction: "manipulation" }}
            >
              {user ? "Mi cuenta" : "Acceder"}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
