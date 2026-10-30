import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { toggleSavePost } from "@/lib/forum/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }
  const body = (await request.json()) as { postId?: string };
  if (!body.postId) {
    return NextResponse.json({ error: "Falta postId" }, { status: 400 });
  }
  const saved = await toggleSavePost(user.id, body.postId);
  return NextResponse.json({ saved });
}
