import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { canAccessAdmin, getSession } from "@/lib/auth/session";
import { diagnoseSheetsConnection } from "@/lib/data/providers/sheets";

export const metadata: Metadata = {
  title: "Diagnóstico Google Sheets",
  robots: { index: false, follow: false },
};

export default async function DiagnosticoPage() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) redirect("/acceder");

  const diagnostic = await diagnoseSheetsConnection();

  const checks = [
    { label: "Integración habilitada", ok: diagnostic.enabled },
    { label: "Spreadsheet configurado", ok: diagnostic.configured },
    { label: "Autenticación presente", ok: diagnostic.authMode !== "none" },
    { label: "API alcanzable", ok: diagnostic.canReachApi },
    { label: "Hoja legible", ok: diagnostic.canReadSheet },
    { label: "Encabezados reconocibles", ok: diagnostic.headersOk },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Administración", href: "/admin" },
          { label: "Diagnóstico Sheets" },
        ]}
      />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">
        Diagnóstico Google Sheets
      </h1>
      <p className="mt-2 text-muted">
        Verifica conexión, autenticación, encabezados y conversión. No se
        exponen credenciales.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Badge tone={diagnostic.enabled ? "gold" : "muted"}>
          {diagnostic.enabled ? "enabled" : "disabled"}
        </Badge>
        <Badge tone="muted">auth: {diagnostic.authMode}</Badge>
        <Badge tone="muted">tipo: {diagnostic.sheetKind}</Badge>
        <Badge tone="muted">
          actualizado {new Date(diagnostic.lastCheckedAt).toLocaleString("es-MX")}
        </Badge>
      </div>

      <ul className="mt-8 space-y-2">
        {checks.map((c) => (
          <li
            key={c.label}
            className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <span>{c.label}</span>
            <span className={c.ok ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700"}>
              {c.ok ? "OK" : "Requiere atención"}
            </span>
          </li>
        ))}
      </ul>

      <section className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-xl">Mensajes</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
          {diagnostic.messages.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 text-sm">
          <h2 className="font-display text-xl">Métricas</h2>
          <ul className="mt-3 space-y-1 text-muted">
            <li>Filas: {diagnostic.rowCount}</li>
            <li>Eventos de cronología: {diagnostic.timelineEventCount}</li>
            <li>Publicaciones convertidas: {diagnostic.convertedCount}</li>
            <li>Duplicados: {diagnostic.duplicateIssues.length}</li>
            <li>Issues de conversión: {diagnostic.conversionIssues.length}</li>
            <li>Pestañas: {diagnostic.sheetTitles.join(", ") || "—"}</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 text-sm">
          <h2 className="font-display text-xl">Encabezados detectados</h2>
          <p className="mt-3 break-words text-muted">
            {diagnostic.headers.filter(Boolean).join(" · ") || "Sin encabezados"}
          </p>
        </div>
      </section>

      <div className="mt-6">
        <Button href="/admin" variant="secondary">
          Volver al panel
        </Button>
      </div>
    </div>
  );
}
