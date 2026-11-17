"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

function runThemeTransition(apply: () => void) {
  const root = document.documentElement;
  root.classList.add("theme-transition");
  apply();
  window.setTimeout(() => {
    root.classList.remove("theme-transition");
  }, 380);
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return (
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border" />
    );
  }
  const dark = resolvedTheme === "dark";
  return (
    <button
      type="button"
      aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
      onClick={() =>
        runThemeTransition(() => setTheme(dark ? "light" : "dark"))
      }
      className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border text-foreground transition hover:border-oh-blue hover:text-oh-blue"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
