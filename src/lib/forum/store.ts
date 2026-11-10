import { promises as fs } from "fs";
import path from "path";
import { nanoid } from "nanoid";
import { slugify } from "@/lib/utils/text";
import demoForum from "@/data/demo/forum.json";

export interface ForumCommunity {
  id: string;
  slug: string;
  name: string;
  description: string;
  tags: string[];
  moderated: boolean;
}

export interface ForumPost {
  id: string;
  slug: string;
  communityId: string;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  tags: string[];
  imageUrl?: string;
  linkUrl?: string;
  score: number;
  commentCount: number;
  pinned: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
}

export interface ForumComment {
  id: string;
  postId: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  body: string;
  score: number;
  createdAt: string;
  isDemo?: boolean;
}

export interface ForumVote {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  userId: string;
  value: 1 | -1;
}

export interface ForumReport {
  id: string;
  targetType: "post" | "comment";
  targetId: string;
  reporterId: string;
  reason: string;
  status: "open" | "reviewed" | "dismissed";
  createdAt: string;
}

interface ForumData {
  communities: ForumCommunity[];
  posts: ForumPost[];
  comments: ForumComment[];
  votes: ForumVote[];
  reports: ForumReport[];
  savedPostIdsByUser: Record<string, string[]>;
}

const runtimePath = path.join(process.cwd(), "data/runtime/forum.json");
const BLOB_PATHNAME = "agora/forum-store.json";

/** Fallback en memoria para el ciclo de vida de la instancia. */
let memoryStore: ForumData | null = null;

function seedForum(): ForumData {
  return structuredClone(demoForum as ForumData);
}

async function loadFromBlob(): Promise<ForumData | null> {
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
    return (await res.json()) as ForumData;
  } catch {
    return null;
  }
}

async function saveToBlob(data: ForumData): Promise<boolean> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  if (!token) return false;
  try {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATHNAME, JSON.stringify(data), {
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

async function ensureStore(): Promise<ForumData> {
  // En Vercel siempre preferir Blob (cada instancia tiene memoria distinta)
  const fromBlob = await loadFromBlob();
  if (fromBlob?.posts && fromBlob?.communities) {
    memoryStore = fromBlob;
    return memoryStore;
  }

  if (memoryStore) return memoryStore;

  try {
    const raw = await fs.readFile(runtimePath, "utf8");
    memoryStore = JSON.parse(raw) as ForumData;
    void saveToBlob(memoryStore);
    return memoryStore;
  } catch {
    memoryStore = seedForum();
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

async function saveStore(data: ForumData) {
  memoryStore = data;
  const savedBlob = await saveToBlob(data);
  if (savedBlob) return;
  try {
    await fs.mkdir(path.dirname(runtimePath), { recursive: true });
    await fs.writeFile(runtimePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Persistencia solo en memoria de esta instancia.
  }
}

export async function getForumData(): Promise<ForumData> {
  return ensureStore();
}

export async function listCommunities() {
  const data = await ensureStore();
  return data.communities;
}

export async function listPosts(filters?: {
  sort?: "recent" | "popular" | "commented";
  query?: string;
  communityId?: string;
  tag?: string;
}) {
  const data = await ensureStore();
  let posts = [...data.posts];
  if (filters?.communityId) {
    posts = posts.filter((p) => p.communityId === filters.communityId);
  }
  if (filters?.tag) {
    const tag = filters.tag.toLowerCase();
    posts = posts.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === tag),
    );
  }
  if (filters?.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.body.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  const sort = filters?.sort ?? "recent";
  posts.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sort === "popular") return b.score - a.score;
    if (sort === "commented") return b.commentCount - a.commentCount;
    return (
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });
  return posts;
}

export async function getPostBySlug(slug: string) {
  const data = await ensureStore();
  return data.posts.find((p) => p.slug === slug) ?? null;
}

export async function getCommentsForPost(postId: string) {
  const data = await ensureStore();
  return data.comments
    .filter((c) => c.postId === postId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export async function createPost(input: {
  title: string;
  body: string;
  communityId: string;
  authorId: string;
  authorName: string;
  tags?: string[];
  imageUrl?: string;
  linkUrl?: string;
}) {
  const data = await ensureStore();
  const baseSlug = slugify(input.title) || "debate";
  let slug = baseSlug;
  let i = 1;
  while (data.posts.some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${i++}`;
  }
  const post: ForumPost = {
    id: `fpost-${nanoid(8)}`,
    slug,
    communityId: input.communityId,
    title: input.title.trim(),
    body: input.body.trim(),
    authorId: input.authorId,
    authorName: input.authorName,
    tags: input.tags ?? [],
    imageUrl: input.imageUrl,
    linkUrl: input.linkUrl,
    score: 1,
    commentCount: 0,
    pinned: false,
    locked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.posts.unshift(post);
  data.votes.push({
    id: nanoid(),
    targetType: "post",
    targetId: post.id,
    userId: input.authorId,
    value: 1,
  });
  await saveStore(data);
  // Invalidar memoria en esta instancia ya está; Blob garantiza otras instancias
  return post;
}

export async function addComment(input: {
  postId: string;
  parentId?: string | null;
  authorId: string;
  authorName: string;
  body: string;
}) {
  const data = await ensureStore();
  const post = data.posts.find((p) => p.id === input.postId);
  if (!post) throw new Error("Publicación no encontrada");
  if (post.locked) throw new Error("El debate está cerrado");
  const comment: ForumComment = {
    id: `fcom-${nanoid(8)}`,
    postId: input.postId,
    parentId: input.parentId ?? null,
    authorId: input.authorId,
    authorName: input.authorName,
    body: input.body.trim(),
    score: 1,
    createdAt: new Date().toISOString(),
  };
  data.comments.push(comment);
  post.commentCount += 1;
  post.updatedAt = new Date().toISOString();
  await saveStore(data);
  return comment;
}

export async function vote(input: {
  userId: string;
  targetType: "post" | "comment";
  targetId: string;
  value: 1 | -1;
}) {
  const data = await ensureStore();
  const existing = data.votes.find(
    (v) =>
      v.userId === input.userId &&
      v.targetType === input.targetType &&
      v.targetId === input.targetId,
  );

  const applyDelta = (delta: number) => {
    if (input.targetType === "post") {
      const post = data.posts.find((p) => p.id === input.targetId);
      if (post) post.score += delta;
    } else {
      const comment = data.comments.find((c) => c.id === input.targetId);
      if (comment) comment.score += delta;
    }
  };

  if (existing) {
    if (existing.value === input.value) {
      applyDelta(-existing.value);
      data.votes = data.votes.filter((v) => v.id !== existing.id);
    } else {
      applyDelta(-existing.value + input.value);
      existing.value = input.value;
    }
  } else {
    data.votes.push({
      id: nanoid(),
      targetType: input.targetType,
      targetId: input.targetId,
      userId: input.userId,
      value: input.value,
    });
    applyDelta(input.value);
  }
  await saveStore(data);
  return data;
}

export async function reportContent(input: {
  reporterId: string;
  targetType: "post" | "comment";
  targetId: string;
  reason: string;
}) {
  const data = await ensureStore();
  const report: ForumReport = {
    id: nanoid(),
    targetType: input.targetType,
    targetId: input.targetId,
    reporterId: input.reporterId,
    reason: input.reason.trim(),
    status: "open",
    createdAt: new Date().toISOString(),
  };
  data.reports.push(report);
  await saveStore(data);
  return report;
}

export async function resolveReport(
  reportId: string,
  action: "dismiss" | "delete",
  moderatorId: string,
  role: string,
) {
  if (!["moderador", "administrador"].includes(role)) {
    throw new Error("Sin permiso");
  }
  const data = await ensureStore();
  const report = data.reports.find((r) => r.id === reportId);
  if (!report) throw new Error("Reporte no encontrado");

  const targetId = report.targetId;
  const targetType = report.targetType;

  if (action === "delete" && targetType === "post") {
    await deletePost(targetId, moderatorId, role);
  }

  const fresh = await ensureStore();
  if (action === "delete" && targetType === "comment") {
    fresh.comments = fresh.comments.filter((c) => c.id !== targetId);
  }
  const r = fresh.reports.find((x) => x.id === reportId);
  if (r) {
    r.status = action === "dismiss" ? "dismissed" : "reviewed";
  }
  await saveStore(fresh);
  return r;
}

export async function toggleSavePost(userId: string, postId: string) {
  const data = await ensureStore();
  const list = new Set(data.savedPostIdsByUser[userId] ?? []);
  if (list.has(postId)) list.delete(postId);
  else list.add(postId);
  data.savedPostIdsByUser[userId] = [...list];
  await saveStore(data);
  return data.savedPostIdsByUser[userId];
}

export async function updatePost(
  postId: string,
  userId: string,
  role: string,
  patch: Partial<
    Pick<ForumPost, "title" | "body" | "tags" | "pinned" | "locked">
  >,
) {
  const data = await ensureStore();
  const post = data.posts.find((p) => p.id === postId);
  if (!post) throw new Error("No encontrado");
  const canEdit =
    post.authorId === userId ||
    ["moderador", "administrador"].includes(role);
  if (!canEdit) throw new Error("Sin permiso");
  Object.assign(post, patch, { updatedAt: new Date().toISOString() });
  await saveStore(data);
  return post;
}

export async function deletePost(postId: string, userId: string, role: string) {
  // Siempre releer desde Blob para no trabajar con estado viejo
  memoryStore = null;
  const data = await ensureStore();
  const post = data.posts.find((p) => p.id === postId);
  if (!post) throw new Error("No encontrado");
  const canDelete =
    post.authorId === userId ||
    ["moderador", "administrador"].includes(role);
  if (!canDelete) throw new Error("Sin permiso");
  data.posts = data.posts.filter((p) => p.id !== postId);
  data.comments = data.comments.filter((c) => c.postId !== postId);
  data.votes = data.votes.filter((v) => v.targetId !== postId);
  data.reports = data.reports.map((r) =>
    r.targetType === "post" && r.targetId === postId
      ? { ...r, status: "reviewed" as const }
      : r,
  );
  await saveStore(data);
}
