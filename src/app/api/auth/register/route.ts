import { NextResponse } from "next/server";
import {
  createSessionToken,
  registerAccount,
  setSessionCookie,
} from "@/lib/auth/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!body.name?.trim() || !body.email?.trim() || !body.password) {
    return NextResponse.json(
      { error: "Nombre, correo y contraseña son obligatorios." },
      { status: 400 },
    );
  }

  try {
    const user = await registerAccount({
      name: body.name,
      email: body.email,
      password: body.password,
    });
    const token = await createSessionToken(user);
    await setSessionCookie(token);
    return NextResponse.json({ user });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "No se pudo crear la cuenta.";
    const status = message.includes("Ya existe") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
