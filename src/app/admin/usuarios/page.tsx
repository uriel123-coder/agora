import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { canAccessAdmin, getSession, listUsers } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Admin · Usuarios",
  robots: { index: false, follow: false },
};

export default async function AdminUsuariosPage() {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) redirect("/acceder");
  if (user.role !== "administrador") redirect("/admin");
  const users = (await listUsers()).filter(
    (u) => u.role !== "administrador",
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Administración", href: "/admin" },
          { label: "Usuarios" },
        ]}
      />
      <h1 className="font-display text-4xl text-oh-ink dark:text-foreground">Usuarios</h1>
      <p className="mt-2 text-muted">
        Cuentas de alumnos registradas en Ágora. La cuenta de administración no
        se muestra aquí.
      </p>
      <ul className="mt-8 space-y-3">
        {users.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted">
            Aún no hay cuentas de alumno.
          </li>
        ) : (
          users.map((u) => (
            <li
              key={u.id}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <p className="font-medium text-foreground">{u.name}</p>
              <p className="text-muted">
                {u.email} · {u.role}
                {u.studentId ? ` · alumno ${u.studentId}` : ""}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
