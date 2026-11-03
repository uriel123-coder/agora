import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { canAccessAdmin, getSession } from "@/lib/auth/session";

export const runtime = "nodejs";

const MAX_BYTES = 40 * 1024 * 1024; // 40 MB

/** Sube PDF/imagen/video a Vercel Blob (carpeta pública de Ágora). */
export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !canAccessAdmin(user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Falta BLOB_READ_WRITE_TOKEN. En Vercel: Storage → Blob → Connect to Project, o pega un enlace público de Drive/PDF.",
      },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta archivo" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "El archivo supera 40 MB" },
      { status: 413 },
    );
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  const pathname = `agora-media/${Date.now()}-${safeName}`;

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type || undefined,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: file.type,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "No se pudo subir a Blob",
      },
      { status: 500 },
    );
  }
}
