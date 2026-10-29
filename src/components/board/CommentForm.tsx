"use client";

import { startTransition, useActionState, useId } from "react";
import { createCommentAction, type ActionState } from "@/app/board/actions";
import { LIMITS } from "@/lib/validation";

export function CommentForm({ postId }: { postId: string }) {
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(createCommentAction.bind(null, postId), null);
  return (
    <form
      className="mt-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => dispatch(data));
      }}
    >
      <ReplyField key={state?.resetKey ?? 0} pending={pending} />
      <p role="status" aria-live="polite" className="mt-1 text-sm text-flamingo">{state?.error ?? ""}</p>
    </form>
  );
}

function ReplyField({ pending }: { pending: boolean }) {
  const id = useId();
  return (
    <div className="flex gap-2">
      <label htmlFor={id} className="sr-only">Write a reply</label>
      <input
        id={id}
        name="body"
        maxLength={LIMITS.comment}
        placeholder="Write a reply..."
        className="min-w-0 flex-1 rounded border border-gold/30 bg-night p-2 text-sand placeholder:text-haze/60"
      />
      <button disabled={pending} className="rounded-full border border-flamingo px-4 py-1.5 text-sm text-flamingo hover:bg-flamingo hover:text-deep disabled:opacity-40">
        {pending ? "Sending" : "Reply"}
      </button>
    </div>
  );
}
