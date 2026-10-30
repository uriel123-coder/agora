import { NextResponse } from "next/server";
import {
  createSessionToken,
  setSessionCookie,
  verifyCredentials,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "Email y contraseña son obligatorios." },
      { status: 400 },
    );
  }

  const user = await verifyCredentials(body.email, body.password);
  if (!user) {
    return NextResponse.json(
      { error: "Credenciales incorrectas o cuenta suspendida." },
      { status: 401 },
    );
  }

  const token = await createSessionToken(user);
  await setSessionCookie(token);
  return NextResponse.json({ user });
}
