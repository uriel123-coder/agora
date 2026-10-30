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

/** Fallback en memoria para entornos serverless (p. ej. Vercel) con FS de solo lectura. */
let memoryStore: ForumData | null = null;

function seedForum(): ForumData {
  return structuredClone(demoForum as ForumData);
}

async function ensureStore(): Promise<ForumData> {
  if (memoryStore) return memoryStore;
  try {
    const raw = await fs.readFile(runtimePath, "utf8");
    memoryStore = JSON.parse(raw) as ForumData;
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
      // Lectura/escritura local no disponible: continuar solo en memoria.
    }
    return memoryStore;
  }
}

async function saveStore(data: ForumData) {
  memoryStore = data;
  try {
    await fs.mkdir(path.dirname(runtimePath), { recursive: true });
    await fs.writeFile(runtimePath, JSON.stringify(data, null, 2), "utf8");
  } catch {
    // Persistencia en memoria durante el ciclo de vida de la instancia.
  }
}

export async function getForumData(): Promise<ForumData> {
  return ensureStore();
}

export async function listCommunities() {
  return (await ensureStore()).communities;
}

export async function listPosts(options?: {
  sort?: "recent" | "popular" | "commented";
  communityId?: string;
  query?: string;
  tag?: string;
}) {
  const data = await ensureStore();
  let posts = [...data.posts];
  if (options?.communityId) {
    posts = posts.filter((p) => p.communityId === options.communityId);
  }
  if (options?.tag) {
    posts = posts.filter((p) => p.tags.includes(options.tag!));
  }
  if (options?.query) {
    const q = options.query.toLowerCase();
    posts = posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q),
    );
  }
  const sort = options?.sort ?? "recent";
  posts.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (sort === "popular") return b.score - a.score;
    if (sort === "commented") return b.commentCount - a.commentCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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
  patch: Partial<Pick<ForumPost, "title" | "body" | "tags" | "pinned" | "locked">>,
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
  const data = await ensureStore();
  const post = data.posts.find((p) => p.id === postId);
  if (!post) throw new Error("No encontrado");
  const canDelete =
    post.authorId === userId ||
    ["moderador", "administrador"].includes(role);
  if (!canDelete) throw new Error("Sin permiso");
  data.posts = data.posts.filter((p) => p.id !== postId);
  data.comments = data.comments.filter((c) => c.postId !== postId);
  await saveStore(data);
}
