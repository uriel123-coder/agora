import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createPost, deletePost } from "@/lib/forum/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }
  if (user.role === "visitor") {
    return NextResponse.json({ error: "Sin permiso." }, { status: 403 });
  }

  const body = (await request.json()) as {
    title?: string;
    body?: string;
    communityId?: string;
    tags?: string[];
    linkUrl?: string;
    imageUrl?: string;
  };

  if (!body.title?.trim() || !body.body?.trim() || !body.communityId) {
    return NextResponse.json(
      { error: "Título, texto y espacio son obligatorios." },
      { status: 400 },
    );
  }

  if (body.title.length > 200 || body.body.length > 10000) {
    return NextResponse.json({ error: "Contenido demasiado largo." }, { status: 400 });
  }

  const post = await createPost({
    title: body.title,
    body: body.body,
    communityId: body.communityId,
    authorId: user.id,
    authorName: user.name,
    tags: body.tags ?? [],
    linkUrl: body.linkUrl,
    imageUrl: body.imageUrl,
  });

  return NextResponse.json({ post });
}

export async function DELETE(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = (await request.json()) as { postId?: string };
  if (!body.postId) {
    return NextResponse.json({ error: "Falta postId" }, { status: 400 });
  }
  try {
    await deletePost(body.postId, user.id, user.role);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 403 },
    );
  }
}
