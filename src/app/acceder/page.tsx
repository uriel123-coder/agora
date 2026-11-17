"use client";

import { useState } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";

type Mode = "login" | "register";

export default function AccederPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const payload =
      mode === "login"
        ? { email, password }
        : { name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(data.error || "No se pudo completar la operación.");
        return;
      }
      window.location.href = "/mi-agora";
    } catch {
      setError("Error de red. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <Breadcrumbs items={[{ label: "Acceder" }]} />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
        {mode === "login" ? "Acceder" : "Crear cuenta"}
      </h1>
      <p className="mt-3 text-muted">
        {mode === "login"
          ? "Entra con tu correo para participar en Ideas en diálogo y guardar tu actividad."
          : "Registro rápido para alumnos. Solo necesitas nombre, correo y contraseña."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError("");
          }}
          className={`rounded-lg px-3 py-2.5 text-sm transition ${
            mode === "login"
              ? "bg-oh-ink text-white dark:bg-oh-blue"
              : "text-muted hover:text-foreground"
          }`}
        >
          Entrar
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError("");
          }}
          className={`rounded-lg px-3 py-2.5 text-sm transition ${
            mode === "register"
              ? "bg-oh-ink text-white dark:bg-oh-blue"
              : "text-muted hover:text-foreground"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6"
      >
        {mode === "register" ? (
          <label className="block">
            <span className="mb-1 block text-sm">Nombre</span>
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-foreground"
            />
          </label>
        ) : null}
        <label className="block">
          <span className="mb-1 block text-sm">Correo</span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-foreground"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm">Contraseña</span>
          <input
            type="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={mode === "register" ? 6 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "Mínimo 6 caracteres" : "••••••••"}
            className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-foreground"
          />
        </label>
        {error ? (
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading
            ? mode === "login"
              ? "Entrando…"
              : "Creando…"
            : mode === "login"
              ? "Entrar"
              : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            ¿Primera vez?{" "}
            <button
              type="button"
              className="text-oh-blue hover:underline"
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Crea tu cuenta en un minuto
            </button>
          </>
        ) : (
          <>
            ¿Ya tienes cuenta?{" "}
            <button
              type="button"
              className="text-oh-blue hover:underline"
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Acceder
            </button>
          </>
        )}
      </p>
    </div>
  );
}
