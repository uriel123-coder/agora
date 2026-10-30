import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { addComment } from "@/lib/forum/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const body = (await request.json()) as {
    postId?: string;
    parentId?: string | null;
    body?: string;
  };

  if (!body.postId || !body.body?.trim()) {
    return NextResponse.json({ error: "Datos incompletos." }, { status: 400 });
  }
  if (body.body.length > 5000) {
    return NextResponse.json({ error: "Comentario demasiado largo." }, { status: 400 });
  }

  try {
    const comment = await addComment({
      postId: body.postId,
      parentId: body.parentId ?? null,
      authorId: user.id,
      authorName: user.name,
      body: body.body,
    });
    return NextResponse.json({ comment });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 400 },
    );
  }
}
