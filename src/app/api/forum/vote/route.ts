import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { vote } from "@/lib/forum/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }

  const body = (await request.json()) as {
    targetType?: "post" | "comment";
    targetId?: string;
    value?: 1 | -1;
  };

  if (!body.targetType || !body.targetId || ![1, -1].includes(body.value as number)) {
    return NextResponse.json({ error: "Voto inválido." }, { status: 400 });
  }

  await vote({
    userId: user.id,
    targetType: body.targetType,
    targetId: body.targetId,
    value: body.value as 1 | -1,
  });

  return NextResponse.json({ ok: true });
}
