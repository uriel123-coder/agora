import type { UserRole } from "@/lib/types/content";

export function canAccessAdmin(role: UserRole): boolean {
  return ["editor", "moderador", "administrador"].includes(role);
}

export function canModerate(role: UserRole): boolean {
  return ["moderador", "administrador"].includes(role);
}
