import { NextResponse } from "next/server";
import { canModerate, getSession } from "@/lib/auth/session";
import { updatePost } from "@/lib/forum/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !canModerate(user.role)) {
    return NextResponse.json({ error: "Sin permiso de moderación." }, { status: 403 });
  }
  const body = (await request.json()) as {
    postId?: string;
    pinned?: boolean;
    locked?: boolean;
  };
  if (!body.postId) {
    return NextResponse.json({ error: "Falta postId" }, { status: 400 });
  }
  const post = await updatePost(body.postId, user.id, user.role, {
    pinned: body.pinned,
    locked: body.locked,
  });
  return NextResponse.json({ post });
}
