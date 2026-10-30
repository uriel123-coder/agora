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
  const users = listUsers();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Administración", href: "/admin" },
          { label: "Usuarios" },
        ]}
      />
      <h1 className="font-serif text-4xl text-petrol dark:text-ivory">Usuarios</h1>
      <p className="mt-2 text-muted">
        Cuentas de demostración locales. En producción conviene migrar a un
        proveedor gestionado (p. ej. Supabase/Clerk) sin exponer hashes.
      </p>
      <ul className="mt-8 space-y-3">
        {users.map((u) => (
          <li
            key={u.id}
            className="rounded-xl border border-border bg-card px-4 py-3 text-sm"
          >
            <p className="font-medium">{u.name}</p>
            <p className="text-muted">
              {u.email} · {u.role}
              {u.studentId ? ` · alumno ${u.studentId}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
