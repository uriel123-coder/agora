import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import seedUsers from "@/data/demo/users.json";
import type { AgoraUser, SessionUser, UserRole } from "@/lib/types/content";

export type StoredUser = AgoraUser & { passwordHash: string };

const runtimePath = path.join(process.cwd(), "data/runtime/users.json");
const BLOB_PATHNAME = "agora/users-store.json";
const ADMIN_EMAIL = "jrubio@oh.edu.mx";

let memoryStore: StoredUser[] | null = null;

function seed(): StoredUser[] {
  return structuredClone(seedUsers as StoredUser[]);
}

function ensureAdmin(users: StoredUser[]): StoredUser[] {
  const adminSeed = (seedUsers as StoredUser[]).find(
    (u) => u.email.toLowerCase() === ADMIN_EMAIL,
  );
  if (!adminSeed) return users;

  const withoutDemos = users.filter((u) => {
    const email = u.email.toLowerCase();
    if (email.endsWith("@agora.demo")) return false;
    if (email === ADMIN_EMAIL) return false;
    return true;
  });

  return [adminSeed, ...withoutDemos];
}

async function loadFromBlob(): Promise<StoredUser[] | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) return null;
  try {
    const { list } = await import("@vercel/blob");
    const { blobs } = await list({
      prefix: BLOB_PATHNAME,
      limit: 5,
      token,
    });
    const hit =
      blobs.find((b) => b.pathname === BLOB_PATHNAME) ?? blobs[0] ?? null;
    if (!hit?.url) return null;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as StoredUser[];
    if (!Array.isArray(data)) return null;
    return ensureAdmin(data);
  } catch {
    return null;
  }
}

async function saveToBlob(users: StoredUser[]): Promise<boolean> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) return false;
  try {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATHNAME, JSON.stringify(users), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      token,
    });
    return true;
  } catch {
    return false;
  }
}

async function ensureStore(): Promise<StoredUser[]> {
  const fromBlob = await loadFromBlob();
  if (fromBlob) {
    memoryStore = fromBlob;
    return memoryStore;
  }

  if (memoryStore) return memoryStore;

  try {
    const raw = await fs.readFile(runtimePath, "utf8");
    memoryStore = ensureAdmin(JSON.parse(raw) as StoredUser[]);
    void saveToBlob(memoryStore);
    return memoryStore;
  } catch {
    memoryStore = seed();
    try {
      await fs.mkdir(path.dirname(runtimePath), { recursive: true });
      await fs.writeFile(
        runtimePath,
        JSON.stringify(memoryStore, null, 2),
        "utf8",
      );
    } catch {
      // Solo memoria / Blob
    }
    void saveToBlob(memoryStore);
    return memoryStore;
  }
}

async function saveStore(users: StoredUser[]) {
  memoryStore = ensureAdmin(users);
  const savedBlob = await saveToBlob(memoryStore);
  if (savedBlob) return;
  try {
    await fs.mkdir(path.dirname(runtimePath), { recursive: true });
    await fs.writeFile(
      runtimePath,
      JSON.stringify(memoryStore, null, 2),
      "utf8",
    );
  } catch {
    if (process.env.VERCEL) {
      throw new Error(
        "No se pudo guardar la cuenta. Configura BLOB_READ_WRITE_TOKEN en Vercel.",
      );
    }
  }
}

export async function listStoredUsers(): Promise<StoredUser[]> {
  return ensureStore();
}

export async function findUserByEmail(
  email: string,
): Promise<StoredUser | null> {
  const users = await ensureStore();
  return (
    users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) ??
    null
  );
}

export async function registerStudent(input: {
  name: string;
  email: string;
  password: string;
}): Promise<SessionUser> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (name.length < 2) throw new Error("Escribe tu nombre completo.");
  if (!email.includes("@") || email.length < 5) {
    throw new Error("Correo no válido.");
  }
  if (password.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }
  if (email === ADMIN_EMAIL) {
    throw new Error("Ese correo no puede usarse para registro.");
  }

  const users = await ensureStore();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    throw new Error("Ya existe una cuenta con ese correo.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user: StoredUser = {
    id: `user-${nanoid(10)}`,
    email,
    name,
    role: "alumno" as UserRole,
    studentId: `stu-${nanoid(8)}`,
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await saveStore(users);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    studentId: user.studentId,
  };
}

/** Lista pública para admin: sin hashes ni datos sensibles. */
export async function listPublicUsers(): Promise<
  Omit<StoredUser, "passwordHash">[]
> {
  const users = await ensureStore();
  return users.map(({ passwordHash: _, ...rest }) => rest);
}
