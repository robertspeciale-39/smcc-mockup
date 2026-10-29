"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  reportContent,
  toggleReaction,
} from "@/lib/board-service";
import { getViewer } from "@/lib/dal";
import { ServiceError } from "@/lib/permissions";

// What the composer and reply form get back. resetKey goes up after each success so the form can clear itself.
export type ActionState = { ok: boolean; error?: string; resetKey: number } | null;

function fail(e: unknown, resetKey: number): ActionState {
  if (e instanceof ServiceError) return { ok: false, error: e.message, resetKey };
  console.error(e);
  return { ok: false, error: "Something went wrong on our end. Please try again.", resetKey };
}

const text = (f: FormData, k: string) => String(f.get(k) ?? "");

export async function createPostAction(prev: ActionState, formData: FormData): Promise<ActionState> {
  const resetKey = prev?.resetKey ?? 0;
  try {
    const category = text(formData, "category") || "general";
    const isSession = category === "smoke_session";
    await createPost(getDb(), await getViewer(), {
      body: text(formData, "body"),
      category,
      city: text(formData, "city"),
      visibility: formData.get("members_only") === "on" ? "members" : "public",
      cigarId: text(formData, "cigarId") || undefined,
      session: isSession
        ? {
            rating: Number(text(formData, "session_rating")) || 0,
            thirds: [text(formData, "third_0"), text(formData, "third_1"), text(formData, "third_2")],
            pairing: text(formData, "pairing"),
          }
        : undefined,
    });
    revalidatePath("/board");
    return { ok: true, resetKey: resetKey + 1 };
  } catch (e) {
    return fail(e, resetKey);
  }
}

export async function createCommentAction(postId: string, prev: ActionState, formData: FormData): Promise<ActionState> {
  const resetKey = prev?.resetKey ?? 0;
  try {
    await createComment(getDb(), await getViewer(), { postId, body: text(formData, "body") });
    revalidatePath("/board");
    return { ok: true, resetKey: resetKey + 1 };
  } catch (e) {
    return fail(e, resetKey);
  }
}

// The actions below back plain buttons. If one is refused (say, the item was already removed)
// the page just refreshes to the true state instead of showing an error screen.
async function quietly(fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (e) {
    if (!(e instanceof ServiceError)) throw e;
  }
  revalidatePath("/board");
  revalidatePath("/admin");
}

export async function toggleLightAction(postId: string) {
  await quietly(async () => toggleReaction(getDb(), await getViewer(), postId));
}

export async function deletePostAction(postId: string) {
  await quietly(async () => deletePost(getDb(), await getViewer(), postId));
}

export async function deleteCommentAction(commentId: string) {
  await quietly(async () => deleteComment(getDb(), await getViewer(), commentId));
}

export async function reportAction(target: { postId?: string; commentId?: string }, formData: FormData) {
  await quietly(async () => reportContent(getDb(), await getViewer(), { ...target, reason: text(formData, "reason") }));
}
