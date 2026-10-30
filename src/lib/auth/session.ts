import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import demoUsers from "@/data/demo/users.json";
import type { AgoraUser, SessionUser, UserRole } from "@/lib/types/content";

const COOKIE_NAME = "agora_session";

type StoredUser = AgoraUser & { passwordHash: string };

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? "agora-demo-secret-change-me";
  return new TextEncoder().encode(secret);
}

export function listUsers(): StoredUser[] {
  return demoUsers as StoredUser[];
}

export async function verifyCredentials(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = listUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user || user.suspended) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    studentId: user.studentId,
  };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    studentId: user.studentId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: payload.role as UserRole,
      studentId: payload.studentId ? String(payload.studentId) : undefined,
    };
  } catch {
    return null;
  }
}

export function roleAtLeast(role: UserRole, minimum: UserRole): boolean {
  const order: UserRole[] = [
    "visitor",
    "alumno",
    "docente",
    "editor",
    "moderador",
    "administrador",
  ];
  return order.indexOf(role) >= order.indexOf(minimum);
}

export function canAccessAdmin(role: UserRole): boolean {
  return ["editor", "moderador", "administrador"].includes(role);
}

export function canModerate(role: UserRole): boolean {
  return ["moderador", "administrador"].includes(role);
}
