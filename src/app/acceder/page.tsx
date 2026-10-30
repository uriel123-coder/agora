"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";

export default function AccederPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@agora.demo");
  const [password, setPassword] = useState("AgoraDemo2026!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "No se pudo iniciar sesión");
      return;
    }
    router.push("/mi-agora");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Acceder" }]} />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">Acceder</h1>
      <p className="mt-3 text-muted">
        Autenticación real con roles. Cuentas de demostración disponibles para
        pruebas locales.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-8 space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        <label className="block">
          <span className="mb-1 block text-sm">Correo</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Contraseña</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2"
          />
        </label>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <div className="mt-6 rounded-xl border border-dashed border-border p-4 text-sm text-muted">
        <p className="font-medium text-foreground">Cuentas demo</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>admin@agora.demo</li>
          <li>editor@agora.demo</li>
          <li>moderador@agora.demo</li>
          <li>docente@agora.demo</li>
          <li>alumno@agora.demo</li>
        </ul>
        <p className="mt-2">Contraseña: AgoraDemo2026!</p>
      </div>
    </div>
  );
}
