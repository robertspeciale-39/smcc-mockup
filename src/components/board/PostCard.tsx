import Link from "next/link";
import { setHiddenAction } from "@/app/admin/actions";
import { deleteCommentAction, deletePostAction, reportAction } from "@/app/board/actions";
import { CATEGORY_LABELS } from "@/db/enums";
import type { FeedComment, FeedPost } from "@/lib/board-service";
import { cigars } from "@/lib/data";
import { initialsOf, type MaybeViewer } from "@/lib/permissions";
import { CommentForm } from "./CommentForm";
import { LightButton } from "./LightButton";
import { timeAgo } from "./time";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
const THIRDS = ["First third", "Second third", "Final third"] as const;
const linkBtn = "text-haze hover:text-sand hover:underline";

function ReportForm({ target }: { target: { postId?: string; commentId?: string } }) {
  return (
    <details className="inline-block align-top">
      <summary className={`cursor-pointer list-none ${linkBtn} [&::-webkit-details-marker]:hidden`}>Report</summary>
      <form action={reportAction.bind(null, target)} className="mt-2 flex gap-2">
        <label className="sr-only" htmlFor={`why-${target.postId ?? target.commentId}`}>Why are you reporting this?</label>
        <input
          id={`why-${target.postId ?? target.commentId}`}
          name="reason"
          required
          minLength={3}
          maxLength={500}
          placeholder="What's wrong?"
          className="w-56 rounded border border-gold/30 bg-night p-1.5 text-sm text-sand placeholder:text-haze/60"
        />
        <button className="rounded-full border border-gold/50 px-3 text-sm hover:border-flamingo">Send</button>
      </form>
    </details>
  );
}

export function PostCard({
  post,
  comments,
  viewer,
  canParticipate,
  admin,
  now,
}: {
  post: FeedPost;
  comments: FeedComment[];
  viewer: MaybeViewer;
  canParticipate: boolean;
  admin: boolean;
  now: number;
}) {
  const cigar = cigars.find((c) => c.id === post.cigarId);
  const mine = viewer?.id === post.authorId;
  const hidden = post.status === "hidden";
  const session = post.sessionRating && post.sessionThirds;

  return (
    <li className={`rounded-md border bg-night p-5 ${hidden ? "border-flamingo/50 opacity-80" : "border-gold/15"}`}>
      {hidden && <p className="mb-3 text-sm text-flamingo">Hidden from members. Only hosts can see this.</p>}

      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 text-sm text-gold">{initialsOf(post.authorName)}</span>
        <p className="text-sm text-haze">
          <span className="text-sand">{post.authorName ?? "Member"}</span> · {post.city} · {timeAgo(post.createdAt, now)}
          {post.authorTier === "founder" && <span className="ml-2 rounded-full border border-gold/40 px-2 py-0.5 text-xs text-gold">Founders Circle</span>}
        </p>
        <span className="ml-auto flex flex-wrap justify-end gap-2">
          {post.category !== "general" && post.category !== "smoke_session" && (
            <span className="rounded-full border border-gold/30 px-2.5 py-0.5 text-xs text-haze">{CATEGORY_LABELS[post.category]}</span>
          )}
          {post.visibility === "members" && <span className="rounded-full border border-seafoam/50 px-2.5 py-0.5 text-xs text-seafoam">Members only</span>}
        </span>
      </div>

      {post.body && <p className="mt-3 whitespace-pre-line break-words">{post.body}</p>}

      {session && cigar && (
        <div className="mt-3 rounded border border-gold/25 bg-lagoon/30 p-4">
          <p className="text-sm text-seafoam">Smoke Session</p>
          <p className="mt-1">
            <Link href="/finder" className="text-sand hover:text-flamingo">{cigar.brand} {cigar.name}</Link>{" "}
            <span className="whitespace-nowrap text-gold" aria-label={`Rated ${post.sessionRating} out of 5`}>{stars(post.sessionRating!)}</span>
          </p>
          <ol className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            {THIRDS.map((label, i) => (
              <li key={label}>
                <span className="block text-haze">{label}</span>
                {post.sessionThirds![i] || <span className="text-haze/60">No notes</span>}
              </li>
            ))}
          </ol>
          {post.sessionPairing && <p className="mt-3 text-sm text-haze">Paired with <span className="text-sand">{post.sessionPairing}</span></p>}
        </div>
      )}
      {!session && cigar && (
        <Link href="/finder" className="mt-3 inline-block rounded border border-gold/30 px-3 py-1 text-sm text-gold hover:border-flamingo hover:text-flamingo">
          Smoking: {cigar.brand} {cigar.name}
        </Link>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-haze">
        <LightButton postId={post.id} lights={post.lights} lit={post.lit} canLight={canParticipate && !hidden} />
        <span>{post.replyCount} {post.replyCount === 1 ? "reply" : "replies"}</span>
        <span className="ml-auto flex flex-wrap items-start gap-x-4 gap-y-2">
          {canParticipate && !mine && !hidden && <ReportForm target={{ postId: post.id }} />}
          {(mine || admin) && (
            <form action={deletePostAction.bind(null, post.id)}>
              <button className={linkBtn}>Delete</button>
            </form>
          )}
          {admin && (
            <form action={setHiddenAction.bind(null, "post", post.id, !hidden)}>
              <button className="text-flamingo hover:underline">{hidden ? "Restore" : "Hide"}</button>
            </form>
          )}
        </span>
      </div>

      {(comments.length > 0 || (canParticipate && !hidden)) && (
        <details className="mt-3 border-t border-gold/15 pt-3" open={comments.length > 0 && comments.length <= 2}>
          <summary className="cursor-pointer list-none text-sm text-seafoam [&::-webkit-details-marker]:hidden">
            {comments.length > 0 ? `Show ${comments.length} ${comments.length === 1 ? "reply" : "replies"}` : "Reply"}
          </summary>
          <ul className="mt-3 space-y-3">
            {comments.map((c) => {
              const cMine = viewer?.id === c.authorId;
              const cHidden = c.status === "hidden";
              return (
                <li key={c.id} className={`border-l-2 pl-4 text-sm ${cHidden ? "border-flamingo/60 opacity-80" : "border-gold/30"}`}>
                  <p className="text-haze">
                    <span className="text-sand">{c.authorName ?? "Member"}</span> · {timeAgo(c.createdAt, now)}
                    {cHidden && <span className="ml-2 text-flamingo">Hidden</span>}
                  </p>
                  <p className="mt-0.5 whitespace-pre-line break-words">{c.body}</p>
                  <span className="mt-1 flex flex-wrap items-start gap-x-4 gap-y-1 text-xs">
                    {canParticipate && !cMine && !cHidden && <ReportForm target={{ commentId: c.id }} />}
                    {(cMine || admin) && (
                      <form action={deleteCommentAction.bind(null, c.id)}>
                        <button className={linkBtn}>Delete</button>
                      </form>
                    )}
                    {admin && (
                      <form action={setHiddenAction.bind(null, "comment", c.id, !cHidden)}>
                        <button className="text-flamingo hover:underline">{cHidden ? "Restore" : "Hide"}</button>
                      </form>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          {canParticipate && !hidden && <CommentForm postId={post.id} />}
        </details>
      )}
    </li>
  );
}
