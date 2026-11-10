import { NextResponse } from "next/server";
import { canModerate, getSession } from "@/lib/auth/session";
import {
  deletePost,
  resolveReport,
  updatePost,
} from "@/lib/forum/store";

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || !canModerate(user.role)) {
    return NextResponse.json(
      { error: "Sin permiso de moderación." },
      { status: 403 },
    );
  }
  const body = (await request.json()) as {
    postId?: string;
    pinned?: boolean;
    locked?: boolean;
    deletePostId?: string;
    reportId?: string;
    reportAction?: "dismiss" | "delete";
  };

  try {
    if (body.reportId && body.reportAction) {
      const report = await resolveReport(
        body.reportId,
        body.reportAction,
        user.id,
        user.role,
      );
      return NextResponse.json({ report });
    }

    if (body.deletePostId) {
      await deletePost(body.deletePostId, user.id, user.role);
      return NextResponse.json({ ok: true });
    }

    if (!body.postId) {
      return NextResponse.json({ error: "Falta postId" }, { status: 400 });
    }
    const post = await updatePost(body.postId, user.id, user.role, {
      pinned: body.pinned,
      locked: body.locked,
    });
    return NextResponse.json({ post });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error" },
      { status: 403 },
    );
  }
}
