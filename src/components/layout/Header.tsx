"use client";

import Link from "next/link";
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
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-sm px-3 py-2 text-sm transition duration-300 hover:-translate-y-0.5 hover:text-oh-blue",
                pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href))
                  ? "text-oh-blue"
                  : "text-foreground/85",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-2 text-sm text-muted transition hover:border-oh-blue hover:text-oh-blue"
            aria-label="Abrir buscador global"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Buscar</span>
            <kbd className="hidden rounded-sm border border-border px-1.5 text-[10px] md:inline">
              ⌘K
            </kbd>
          </button>
          <ThemeToggle />
          <Link
            href={user ? "/mi-agora" : "/acceder"}
            className="hidden rounded-sm bg-oh-ink px-3 py-2 text-sm text-white sm:inline-flex hover:bg-oh-ink-deep dark:bg-oh-blue"
          >
            {user ? "Mi cuenta" : "Acceder"}
          </Link>
          {user && canAccessAdmin(user.role) ? (
            <Link
              href="/admin"
              className="hidden rounded-sm border border-oh-blue/40 px-3 py-2 text-sm text-oh-blue lg:inline-flex"
            >
              Admin
            </Link>
          ) : null}
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border lg:hidden"
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
                className="rounded-sm px-3 py-2.5 text-sm hover:bg-oh-stone dark:hover:bg-white/5"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/categorias" className="rounded-sm px-3 py-2.5 text-sm">
              Todas las categorías
            </Link>
            <Link href="/ideas-en-dialogo" className="rounded-sm px-3 py-2.5 text-sm">
              Ideas en diálogo
            </Link>
            <Link
              href={user ? "/mi-agora" : "/acceder"}
              className="rounded-sm px-3 py-2.5 text-sm"
            >
              {user ? "Mi cuenta" : "Acceder"}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
