// All Board reads and writes live here, and every function checks permissions itself.
// Server Actions and pages call these with the freshly loaded viewer, so a mistake in the UI
// cannot grant access the rules here would refuse. No framework imports, so tests can run it directly.

import { and, asc, desc, eq, inArray, lt, sql, type SQL } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { ZodType } from "zod";
import type { Db } from "@/db";
import type { Category, Tier } from "@/db/enums";
import { comments, posts, reactions, reports, users } from "@/db/schema";
import {
  canParticipate,
  canReadMembersContent,
  isAdmin,
  ServiceError,
  type MaybeViewer,
  type Viewer,
} from "@/lib/permissions";
import { commentSchema, firstError, idSchema, postInputSchema, reportSchema, statusSchema, tierSchema } from "@/lib/validation";

const POSTS_PER_HOUR = 10;
const COMMENTS_PER_HOUR = 30;

function parse<T>(schema: ZodType<T>, raw: unknown): T {
  const result = schema.safeParse(raw);
  if (!result.success) throw new ServiceError("invalid", firstError(result.error));
  return result.data;
}

function requireParticipant(viewer: MaybeViewer): Viewer {
  if (!viewer) throw new ServiceError("unauthorized", "Sign in to take part.");
  if (viewer.status === "suspended") throw new ServiceError("forbidden", "This account is suspended.");
  if (!canParticipate(viewer)) throw new ServiceError("forbidden", "Posting and replies are for members. Ask a club host to approve your account.");
  return viewer;
}

function requireAdmin(viewer: MaybeViewer): Viewer {
  if (!viewer) throw new ServiceError("unauthorized", "Sign in first.");
  if (!isAdmin(viewer)) throw new ServiceError("forbidden", "Admins only.");
  return viewer;
}

// What a viewer is allowed to see: guests and signed-out visitors get public posts only,
// and hidden posts are visible to admins alone.
function visiblePosts(viewer: MaybeViewer): SQL {
  const status = isAdmin(viewer) ? sql`true` : eq(posts.status, "published");
  const audience = canReadMembersContent(viewer) ? sql`true` : eq(posts.visibility, "public");
  return and(status, audience)!;
}

async function loadVisiblePost(db: Db, viewer: MaybeViewer, postId: string) {
  const [post] = await db
    .select({ id: posts.id, authorId: posts.authorId, status: posts.status })
    .from(posts)
    .where(and(eq(posts.id, postId), visiblePosts(viewer)))
    .limit(1);
  if (!post) throw new ServiceError("not_found", "That post isn't available.");
  return post;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------
export type FeedPost = {
  id: string;
  authorId: string;
  authorName: string | null;
  authorTier: Tier;
  body: string;
  category: Category;
  city: string;
  visibility: "public" | "members";
  status: "published" | "hidden";
  cigarId: string | null;
  sessionRating: number | null;
  sessionThirds: [string, string, string] | null;
  sessionPairing: string | null;
  createdAt: Date;
  lights: number;
  lit: boolean;
  replyCount: number;
};

export async function listFeed(
  db: Db,
  viewer: MaybeViewer,
  opts: { city?: string; category?: Category; before?: Date; limit?: number } = {},
): Promise<{ posts: FeedPost[]; hasMore: boolean }> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 50);
  const where: SQL[] = [visiblePosts(viewer)];
  if (opts.city) where.push(eq(posts.city, opts.city));
  if (opts.category) where.push(eq(posts.category, opts.category));
  if (opts.before) where.push(lt(posts.createdAt, opts.before));

  const viewerId = viewer?.id ?? null;
  const rows = await db
    .select({
      id: posts.id,
      authorId: posts.authorId,
      authorName: users.name,
      authorTier: users.tier,
      body: posts.body,
      category: posts.category,
      city: posts.city,
      visibility: posts.visibility,
      status: posts.status,
      cigarId: posts.cigarId,
      sessionRating: posts.sessionRating,
      sessionThirds: posts.sessionThirds,
      sessionPairing: posts.sessionPairing,
      createdAt: posts.createdAt,
      lights: sql<number>`(select count(*)::int from ${reactions} where ${reactions.postId} = ${posts.id})`,
      lit: viewerId
        ? sql<boolean>`exists (select 1 from ${reactions} where ${reactions.postId} = ${posts.id} and ${reactions.userId} = ${viewerId})`
        : sql<boolean>`false`,
      replyCount: sql<number>`(select count(*)::int from ${comments} where ${comments.postId} = ${posts.id} and ${comments.status} = 'published')`,
    })
    .from(posts)
    .innerJoin(users, eq(users.id, posts.authorId))
    .where(and(...where))
    .orderBy(desc(posts.createdAt), desc(posts.id))
    .limit(limit + 1);

  return { posts: rows.slice(0, limit), hasMore: rows.length > limit };
}

export type FeedComment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string | null;
  body: string;
  status: "published" | "hidden";
  createdAt: Date;
};

// Pass only ids that listFeed already returned for this viewer, so visibility is inherited.
export async function listComments(db: Db, viewer: MaybeViewer, postIds: string[]): Promise<FeedComment[]> {
  if (postIds.length === 0) return [];
  const status = isAdmin(viewer) ? sql`true` : eq(comments.status, "published");
  return db
    .select({
      id: comments.id,
      postId: comments.postId,
      authorId: comments.authorId,
      authorName: users.name,
      body: comments.body,
      status: comments.status,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(users, eq(users.id, comments.authorId))
    .where(and(inArray(comments.postId, postIds), status))
    .orderBy(asc(comments.createdAt))
    .limit(500);
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------
async function countSince(db: Db, table: typeof posts | typeof comments, authorId: string): Promise<number> {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(table)
    .where(and(eq(table.authorId, authorId), sql`${table.createdAt} > now() - interval '1 hour'`));
  return row?.n ?? 0;
}

export async function createPost(db: Db, viewer: MaybeViewer, raw: unknown): Promise<{ id: string }> {
  const who = requireParticipant(viewer);
  const input = parse(postInputSchema, raw);
  if ((await countSince(db, posts, who.id)) >= POSTS_PER_HOUR) {
    throw new ServiceError("rate_limited", "That's a lot of posts for one hour. Give the Board a minute.");
  }
  const isSession = input.category === "smoke_session" && input.session;
  const [row] = await db
    .insert(posts)
    .values({
      authorId: who.id,
      body: input.body,
      category: input.category,
      city: input.city,
      visibility: input.visibility,
      cigarId: input.cigarId || null,
      sessionRating: isSession ? input.session!.rating : null,
      sessionThirds: isSession ? input.session!.thirds : null,
      sessionPairing: isSession ? input.session!.pairing : null,
    })
    .returning({ id: posts.id });
  return row;
}

export async function createComment(db: Db, viewer: MaybeViewer, raw: unknown): Promise<{ id: string }> {
  const who = requireParticipant(viewer);
  const input = parse(commentSchema, raw);
  const post = await loadVisiblePost(db, who, input.postId);
  if (post.status !== "published") throw new ServiceError("not_found", "That post isn't available.");
  if ((await countSince(db, comments, who.id)) >= COMMENTS_PER_HOUR) {
    throw new ServiceError("rate_limited", "Slow down a little. Try again in a few minutes.");
  }
  const [row] = await db
    .insert(comments)
    .values({ postId: input.postId, authorId: who.id, body: input.body })
    .returning({ id: comments.id });
  return row;
}

export async function toggleReaction(db: Db, viewer: MaybeViewer, postId: string): Promise<{ lit: boolean }> {
  const who = requireParticipant(viewer);
  const post = await loadVisiblePost(db, who, parse(idSchema, postId));
  if (post.status !== "published") throw new ServiceError("not_found", "That post isn't available.");
  const removed = await db
    .delete(reactions)
    .where(and(eq(reactions.postId, post.id), eq(reactions.userId, who.id)))
    .returning({ postId: reactions.postId });
  if (removed.length > 0) return { lit: false };
  await db.insert(reactions).values({ postId: post.id, userId: who.id }).onConflictDoNothing();
  return { lit: true };
}

// Authors can delete their own posts; admins can delete anything.
export async function deletePost(db: Db, viewer: MaybeViewer, postId: string): Promise<void> {
  if (!viewer) throw new ServiceError("unauthorized", "Sign in first.");
  const id = parse(idSchema, postId);
  const [post] = await db.select({ authorId: posts.authorId }).from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) throw new ServiceError("not_found", "That post is already gone.");
  const own = viewer.status === "active" && post.authorId === viewer.id;
  if (!own && !isAdmin(viewer)) throw new ServiceError("forbidden", "You can only delete your own posts.");
  await db.delete(posts).where(eq(posts.id, id));
}

export async function deleteComment(db: Db, viewer: MaybeViewer, commentId: string): Promise<void> {
  if (!viewer) throw new ServiceError("unauthorized", "Sign in first.");
  const id = parse(idSchema, commentId);
  const [row] = await db.select({ authorId: comments.authorId }).from(comments).where(eq(comments.id, id)).limit(1);
  if (!row) throw new ServiceError("not_found", "That reply is already gone.");
  const own = viewer.status === "active" && row.authorId === viewer.id;
  if (!own && !isAdmin(viewer)) throw new ServiceError("forbidden", "You can only delete your own replies.");
  await db.delete(comments).where(eq(comments.id, id));
}

export async function reportContent(db: Db, viewer: MaybeViewer, raw: unknown): Promise<void> {
  const who = requireParticipant(viewer);
  const input = parse(reportSchema, raw);

  let postId = input.postId;
  if (input.commentId) {
    const [c] = await db.select({ postId: comments.postId }).from(comments).where(eq(comments.id, input.commentId)).limit(1);
    if (!c) throw new ServiceError("not_found", "That reply isn't available.");
    postId = c.postId;
  }
  await loadVisiblePost(db, who, postId!); // you can only report what you can see

  const target = input.postId ? eq(reports.postId, input.postId) : eq(reports.commentId, input.commentId!);
  const [dupe] = await db
    .select({ id: reports.id })
    .from(reports)
    .where(and(eq(reports.reporterId, who.id), eq(reports.status, "open"), target))
    .limit(1);
  if (dupe) return; // already reported, nothing more to do
  await db.insert(reports).values({
    reporterId: who.id,
    postId: input.postId ?? null,
    commentId: input.commentId ?? null,
    reason: input.reason,
  });
}

// ---------------------------------------------------------------------------
// Moderation (admins only)
// ---------------------------------------------------------------------------
export async function setContentHidden(
  db: Db,
  viewer: MaybeViewer,
  opts: { kind: "post" | "comment"; id: string; hidden: boolean },
): Promise<void> {
  const admin = requireAdmin(viewer);
  const id = parse(idSchema, opts.id);
  const patch = opts.hidden
    ? { status: "hidden" as const, hiddenBy: admin.id, hiddenAt: new Date() }
    : { status: "published" as const, hiddenBy: null, hiddenAt: null };

  const table = opts.kind === "post" ? posts : comments;
  const updated = await db.update(table).set(patch).where(eq(table.id, id)).returning({ id: table.id });
  if (updated.length === 0) throw new ServiceError("not_found", "That item no longer exists.");

  // Hiding something settles any open reports about it.
  if (opts.hidden) {
    const target = opts.kind === "post" ? eq(reports.postId, id) : eq(reports.commentId, id);
    await db
      .update(reports)
      .set({ status: "resolved", resolvedBy: admin.id, resolvedAt: new Date() })
      .where(and(eq(reports.status, "open"), target));
  }
}

export type OpenReport = {
  id: string;
  reason: string;
  createdAt: Date;
  reporterName: string | null;
  kind: "post" | "comment";
  targetId: string;
  targetBody: string;
  targetAuthorName: string | null;
  targetStatus: "published" | "hidden";
};

export async function listOpenReports(db: Db, viewer: MaybeViewer): Promise<OpenReport[]> {
  requireAdmin(viewer);
  const reporter = alias(users, "reporter");
  const postAuthor = alias(users, "post_author");
  const commentAuthor = alias(users, "comment_author");
  const rows = await db
    .select({
      id: reports.id,
      reason: reports.reason,
      createdAt: reports.createdAt,
      reporterName: reporter.name,
      postId: reports.postId,
      commentId: reports.commentId,
      postBody: posts.body,
      postStatus: posts.status,
      postAuthorName: postAuthor.name,
      commentBody: comments.body,
      commentStatus: comments.status,
      commentAuthorName: commentAuthor.name,
    })
    .from(reports)
    .innerJoin(reporter, eq(reporter.id, reports.reporterId))
    .leftJoin(posts, eq(posts.id, reports.postId))
    .leftJoin(postAuthor, eq(postAuthor.id, posts.authorId))
    .leftJoin(comments, eq(comments.id, reports.commentId))
    .leftJoin(commentAuthor, eq(commentAuthor.id, comments.authorId))
    .where(eq(reports.status, "open"))
    .orderBy(asc(reports.createdAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    reason: r.reason,
    createdAt: r.createdAt,
    reporterName: r.reporterName,
    kind: r.postId ? "post" : "comment",
    targetId: (r.postId ?? r.commentId)!,
    targetBody: (r.postId ? r.postBody : r.commentBody) ?? "",
    targetAuthorName: r.postId ? r.postAuthorName : r.commentAuthorName,
    targetStatus: ((r.postId ? r.postStatus : r.commentStatus) ?? "published") as "published" | "hidden",
  }));
}

export async function resolveReport(db: Db, viewer: MaybeViewer, reportId: string): Promise<void> {
  const admin = requireAdmin(viewer);
  const id = parse(idSchema, reportId);
  await db
    .update(reports)
    .set({ status: "resolved", resolvedBy: admin.id, resolvedAt: new Date() })
    .where(and(eq(reports.id, id), eq(reports.status, "open")));
}

export type MemberRow = {
  id: string;
  name: string | null;
  email: string;
  tier: Tier;
  role: "user" | "admin";
  status: "active" | "suspended";
  createdAt: Date;
};

export async function listAccounts(db: Db, viewer: MaybeViewer): Promise<MemberRow[]> {
  requireAdmin(viewer);
  return db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      tier: users.tier,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(300);
}

export async function setUserTier(db: Db, viewer: MaybeViewer, userId: string, tier: unknown): Promise<void> {
  requireAdmin(viewer);
  const id = parse(idSchema, userId);
  const next = parse(tierSchema, tier);
  const updated = await db.update(users).set({ tier: next }).where(eq(users.id, id)).returning({ id: users.id });
  if (updated.length === 0) throw new ServiceError("not_found", "No such member.");
}

export async function setUserStatus(
  db: Db,
  viewer: MaybeViewer,
  userId: string,
  status: unknown,
): Promise<void> {
  const admin = requireAdmin(viewer);
  const id = parse(idSchema, userId);
  const next = parse(statusSchema, status);
  if (admin.id === id) throw new ServiceError("invalid", "You can't suspend your own account.");
  const updated = await db.update(users).set({ status: next }).where(eq(users.id, id)).returning({ id: users.id });
  if (updated.length === 0) throw new ServiceError("not_found", "No such member.");
}
