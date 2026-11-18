import { normalizeText } from "@/lib/utils/text";

/** Palabras / expresiones a censurar en el foro escolar. */
const BLOCKED = [
  "pendejo",
  "pendeja",
  "putas",
  "puto",
  "puta",
  "mierda",
  "verga",
  "cabron",
  "cabrona",
  "hijueputa",
  "estupido",
  "estupida",
  "idiota",
  "imbecil",
  "pinche",
  "culero",
  "culera",
  "maricon",
  "joder",
  "carajo",
  "chinga",
  "chingar",
  "chingada",
  "nazi",
  "kill yourself",
  "suicidat",
];

/** Patrones tipo secretos / variables sensibles. */
const SECRET_PATTERNS: RegExp[] = [
  /\b(sk|pk|rk|api)[_-]?[a-z0-9]{16,}\b/gi,
  /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/gi,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\b(ghp|gho|github_pat)_[A-Za-z0-9_]{20,}\b/g,
  /\b(xox[baprs]-)[0-9A-Za-z-]{10,}\b/g,
  /\bpassword\s*[:=]\s*\S+/gi,
  /\bcontraseña\s*[:=]\s*\S+/gi,
  /\b(AUTH_SECRET|BLOB_READ_WRITE_TOKEN|PRIVATE_KEY)\s*[:=]\s*\S+/gi,
  /\b-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+PRIVATE KEY-----/g,
];

function maskWord(word: string): string {
  if (word.length <= 2) return "*".repeat(word.length);
  return `${word[0]}${"*".repeat(Math.max(1, word.length - 2))}${word[word.length - 1]}`;
}

export function censorForumText(input: string): {
  text: string;
  blocked: boolean;
} {
  let text = input;
  let blocked = false;

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(text)) {
      blocked = true;
      text = text.replace(pattern, "[dato oculto]");
    }
    pattern.lastIndex = 0;
  }

  const lower = normalizeText(text);
  for (const bad of BLOCKED) {
    const n = normalizeText(bad);
    if (!n || !lower.includes(n)) continue;
    blocked = true;
    // Reemplazo case-insensitive aproximado sobre el texto original
    const escaped = bad.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    text = text.replace(new RegExp(escaped, "gi"), (m) => maskWord(m));
  }

  return { text, blocked };
}

export function assertForumTextAllowed(input: string, field: string): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error(`${field} vacío.`);
  const { text } = censorForumText(trimmed);
  return text;
}
