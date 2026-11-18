"use client";

import { usePathname } from "next/navigation";
import { Info, Menu, Search, UserRound, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AgoraLogo } from "@/components/shared/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { cn } from "@/lib/utils/cn";
import type { SessionUser } from "@/lib/types/content";
import { canAccessAdmin } from "@/lib/auth/client-roles";

const desktopLinks = [
  { href: "/que-es-agora", label: "Qué es Ágora", icon: Info },
  { href: "/quienes-somos", label: "Quiénes somos", icon: Info },
  { href: "/buscar-alumno", label: "Buscar alumno", icon: Users },
];

const menuPages = [
  {
    href: "/que-es-agora",
    label: "Qué es Ágora",
    description:
      "Ágora: la biblioteca digital para descubrir, comprender y compartir.",
    icon: Info,
  },
  {
    href: "/quienes-somos",
    label: "Quiénes somos",
    description:
      "El colegio Or Hajayim y su filosofía Torá Im Dérej Éretz.",
    icon: Info,
  },
  {
    href: "/buscar-alumno",
    label: "Buscar alumno",
    description: "Localiza publicaciones asociadas a un alumno.",
    icon: Users,
  },
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

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--header-bg)]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <AgoraLogo size="md" />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
          {desktopLinks.map((link) => {
            const Icon = link.icon;
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <a
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-sm transition hover:text-oh-blue",
                  active ? "text-oh-blue" : "text-foreground/85",
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
                {link.label}
              </a>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSearch}
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
            className="hidden min-h-11 items-center rounded-xl bg-oh-ink px-4 py-2 text-sm text-white sm:inline-flex hover:bg-oh-ink-deep dark:bg-oh-blue dark:text-white"
          >
            {user ? "Mi cuenta" : "Acceder"}
          </a>
          {user && canAccessAdmin(user.role) ? (
            <a
              href="/admin"
              className="hidden min-h-11 items-center rounded-xl border border-oh-blue/40 px-3 py-2 text-sm text-oh-blue lg:inline-flex"
            >
              Admin
            </a>
          ) : null}
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/45"
            aria-label="Cerrar menú"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 flex w-[min(100%,22rem)] flex-col border-l border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="font-display text-lg text-foreground">Menú</p>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Móvil">
              <ul className="space-y-1.5">
                {menuPages.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={cn(
                          "flex gap-3 rounded-xl border px-3 py-3 transition",
                          active
                            ? "border-oh-blue/40 bg-oh-blue/10"
                            : "border-transparent hover:border-border hover:bg-oh-stone/70 dark:hover:bg-white/5",
                        )}
                      >
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-oh-stone text-oh-blue dark:bg-white/10">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-foreground">
                            {item.label}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                            {item.description}
                          </span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <div className="space-y-2 border-t border-border p-3">
              <a
                href={user ? "/mi-agora" : "/acceder"}
                className="flex items-center gap-3 rounded-xl bg-oh-ink px-3 py-3 text-sm text-white dark:bg-oh-blue"
              >
                <UserRound className="h-4 w-4" />
                {user ? "Mi cuenta" : "Acceder / crear cuenta"}
              </a>
              {user && canAccessAdmin(user.role) ? (
                <a
                  href="/admin"
                  className="block rounded-xl border border-oh-blue/40 px-3 py-3 text-center text-sm text-oh-blue"
                >
                  Administración
                </a>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
