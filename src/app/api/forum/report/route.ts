import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { reportContent } from "@/lib/forum/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: "Debes iniciar sesión." }, { status: 401 });
  }
  const body = (await request.json()) as {
    targetType?: "post" | "comment";
    targetId?: string;
    reason?: string;
  };
  if (!body.targetType || !body.targetId || !body.reason?.trim()) {
    return NextResponse.json({ error: "Reporte incompleto." }, { status: 400 });
  }
  const report = await reportContent({
    reporterId: user.id,
    targetType: body.targetType,
    targetId: body.targetId,
    reason: body.reason,
  });
  return NextResponse.json({ report });
}
