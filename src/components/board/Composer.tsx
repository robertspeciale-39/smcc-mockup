"use client";

import { startTransition, useActionState, useState } from "react";
import { createPostAction, type ActionState } from "@/app/board/actions";
import { BOARD_CITIES, CATEGORIES, CATEGORY_LABELS } from "@/db/enums";
import { LIMITS } from "@/lib/validation";

export type CigarOption = { id: string; label: string };

const THIRDS = ["First third", "Second third", "Final third"] as const;
const POST_CATEGORIES = CATEGORIES.filter((c) => c !== "smoke_session");
const field = "mt-1 w-full rounded border border-gold/30 bg-night p-2.5 text-sand placeholder:text-haze/60";

export function Composer({ cigars, drinks, defaultCity }: { cigars: CigarOption[]; drinks: string[]; defaultCity: string }) {
  const [state, dispatch, pending] = useActionState<ActionState, FormData>(createPostAction, null);

  // Submitting through onSubmit (instead of the form's action prop) keeps what you typed if the
  // server says no. After a successful post the fields remount empty because resetKey changes.
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => dispatch(data));
      }}
    >
      <Fields key={state?.resetKey ?? 0} cigars={cigars} drinks={drinks} defaultCity={defaultCity} pending={pending} state={state} />
    </form>
  );
}

function Fields({
  cigars,
  drinks,
  defaultCity,
  pending,
  state,
}: {
  cigars: CigarOption[];
  drinks: string[];
  defaultCity: string;
  pending: boolean;
  state: ActionState;
}) {
  const [mode, setMode] = useState<"post" | "session">("post");
  const [rating, setRating] = useState(0);
  const city = (BOARD_CITIES as readonly string[]).includes(defaultCity) ? defaultCity : BOARD_CITIES[0];

  return (
    <div className="rounded-md border border-gold/25 bg-lagoon/40 p-5">
      <div className="flex gap-2" role="group" aria-label="What would you like to share?">
        {([["post", "Post"], ["session", "Smoke Session"]] as const).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setMode(k)}
            aria-pressed={mode === k}
            className={`rounded-full border px-4 py-1.5 text-sm ${mode === k ? "border-flamingo bg-flamingo text-deep" : "border-gold/40 hover:border-flamingo"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "session" && <input type="hidden" name="category" value="smoke_session" />}

      {mode === "post" ? (
        <div className="mt-4">
          <label htmlFor="c-body" className="text-sm text-haze">Share what you&apos;re smoking</label>
          <textarea
            id="c-body"
            name="body"
            rows={3}
            maxLength={LIMITS.post}
            placeholder="Sunday patio, a Padrón and a cortado..."
            className={`${field} resize-none p-3`}
          />
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="c-category" className="text-sm text-haze">Category</label>
              <select id="c-category" name="category" defaultValue="general" className={field}>
                {POST_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="c-cigar" className="text-sm text-haze">Tag a cigar (optional)</label>
              <select id="c-cigar" name="cigarId" defaultValue="" className={field}>
                <option value="">None</option>
                {cigars.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="s-cigar" className="text-sm text-haze">Cigar</label>
              <select id="s-cigar" name="cigarId" defaultValue={cigars[0]?.id} className={field}>
                {cigars.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="s-pairing" className="text-sm text-haze">What you paired it with</label>
              <select id="s-pairing" name="pairing" defaultValue={drinks[0]} className={field}>
                {drinks.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <fieldset className="mt-4">
            <legend className="text-sm text-haze">Your rating</legend>
            <input type="hidden" name="session_rating" value={rating || ""} />
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  aria-pressed={rating === n}
                  aria-label={`${n} out of 5`}
                  className={`h-10 w-10 rounded border text-lg ${n <= rating ? "border-gold bg-gold/20 text-gold" : "border-gold/30 text-haze hover:border-flamingo"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {THIRDS.map((label, i) => (
              <div key={label}>
                <label htmlFor={`third-${i}`} className="text-sm text-haze">{label}</label>
                <input
                  id={`third-${i}`}
                  name={`third_${i}`}
                  maxLength={LIMITS.third}
                  placeholder={["Cedar, a little pepper", "Coffee builds", "Cocoa, strong finish"][i]}
                  className={field}
                />
              </div>
            ))}
          </div>

          <label htmlFor="s-body" className="mt-4 block text-sm text-haze">Anything else? (optional)</label>
          <input id="s-body" name="body" maxLength={LIMITS.post} placeholder="Worth buying a box?" className={field} />

          <div className="mt-4 max-w-xs">
            <label htmlFor="s-city" className="text-sm text-haze">City</label>
            <select id="s-city" name="city" defaultValue={city} className={field}>
              {BOARD_CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      )}

      {mode === "post" && (
        <div className="mt-4 max-w-xs">
          <label htmlFor="c-city" className="text-sm text-haze">City</label>
          <select id="c-city" name="city" defaultValue={city} className={field}>
            {BOARD_CITIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2 text-sm text-haze">
          <input type="checkbox" name="members_only" className="h-4 w-4 accent-[#f3a5b6]" />
          Members only
        </label>
        <div className="flex items-center gap-4">
          <p role="status" aria-live="polite" className={`text-sm ${state?.error ? "text-flamingo" : "text-seafoam"}`}>
            {state?.error ?? (state?.ok ? "Posted." : mode === "session" && rating === 0 ? "Pick a rating to log it." : "")}
          </p>
          <button
            disabled={pending || (mode === "session" && rating === 0)}
            className="rounded-full bg-flamingo px-5 py-2 font-medium text-deep hover:bg-sand disabled:opacity-40"
          >
            {pending ? "Posting..." : mode === "session" ? "Log Smoke Session" : "Post to the Board"}
          </button>
        </div>
      </div>
    </div>
  );
}
