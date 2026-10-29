import Link from "next/link";
import { Suspense } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Composer } from "@/components/board/Composer";
import { PostCard } from "@/components/board/PostCard";
import { requestTime } from "@/components/board/time";
import { getDb } from "@/db";
import { BOARD_CITIES, CATEGORIES, CATEGORY_LABELS, type Category } from "@/db/enums";
import { listComments, listFeed } from "@/lib/board-service";
import { getViewer } from "@/lib/dal";
import { cigars, DRINKS } from "@/lib/data";
import { canParticipate, isAdmin } from "@/lib/permissions";

export const metadata = { title: "The Board | The Sunday Morning Cigar Club" };

type Params = { city?: string; category?: string; before?: string };

export default function Board({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <>
      <PageHeader title="The Board" lead="What members are smoking, pouring and planning. Guests can read; members can post." />
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 pt-10" aria-busy="true"><div className="h-64 rounded-md bg-lagoon/30" /></div>}>
        <Feed searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function href(params: { city?: string; category?: string; before?: string }) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `/board?${s}` : "/board";
}

const chip = (on: boolean) =>
  `rounded-full border px-3.5 py-1.5 text-sm ${on ? "border-flamingo bg-flamingo text-deep" : "border-gold/40 hover:border-flamingo"}`;

async function Feed({ searchParams }: { searchParams: Promise<Params> }) {
  const raw = await searchParams;
  const city = (BOARD_CITIES as readonly string[]).includes(raw.city ?? "") ? raw.city : undefined;
  const category = (CATEGORIES as readonly string[]).includes(raw.category ?? "") ? (raw.category as Category) : undefined;
  const beforeDate = raw.before ? new Date(raw.before) : undefined;
  const before = beforeDate && !Number.isNaN(beforeDate.getTime()) ? beforeDate : undefined;

  const db = getDb();
  const viewer = await getViewer();
  const { posts, hasMore } = await listFeed(db, viewer, { city, category, before });
  const comments = await listComments(db, viewer, posts.map((p) => p.id));
  const now = requestTime();

  const participant = canParticipate(viewer);
  const admin = isAdmin(viewer);
  const last = posts[posts.length - 1];

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 lg:grid-cols-[1fr_18rem]">
      <section>
        {participant && viewer ? (
          <Composer
            cigars={cigars.map((c) => ({ id: c.id, label: `${c.brand} ${c.name}` }))}
            drinks={DRINKS}
            defaultCity={viewer.city}
          />
        ) : (
          <div className="deco-frame bg-lagoon/30 p-6">
            {!viewer ? (
              <>
                <p className="font-display text-xl text-sand">Pull up a chair</p>
                <p className="mt-2 text-haze">You&apos;re reading the public Board. Sign in with Google to join the club.</p>
                <Link href="/signin?next=/board" className="mt-4 inline-block rounded-full bg-flamingo px-5 py-2 font-medium text-deep hover:bg-sand">
                  Sign in
                </Link>
              </>
            ) : viewer.status === "suspended" ? (
              <>
                <p className="font-display text-xl text-sand">Account suspended</p>
                <p className="mt-2 text-haze">Please contact a club host if you think this is a mistake.</p>
              </>
            ) : (
              <>
                <p className="font-display text-xl text-sand">Welcome, {viewer.name?.split(" ")[0] ?? "friend"}</p>
                <p className="mt-2 text-haze">
                  You&apos;re signed in as a guest, so you can read public posts. A club host will approve your membership, and then you
                  can post, reply, and see members-only posts.
                </p>
              </>
            )}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="mt-10 text-haze">
            {before ? "That's everything." : "Nothing here yet."}{" "}
            {(city || category) && <Link href="/board" className="text-flamingo hover:underline">Clear filters</Link>}
          </p>
        ) : (
          <ul className="mt-8 space-y-4">
            {posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                comments={comments.filter((c) => c.postId === p.id)}
                viewer={viewer}
                canParticipate={participant}
                admin={admin}
                now={now}
              />
            ))}
          </ul>
        )}

        {hasMore && last && (
          <p className="mt-8 text-center">
            <Link
              href={href({ city, category, before: last.createdAt.toISOString() })}
              className="rounded-full border border-gold/60 px-6 py-2.5 hover:border-flamingo hover:text-flamingo"
            >
              Older posts
            </Link>
          </p>
        )}
        {before && (
          <p className="mt-4 text-center text-sm">
            <Link href={href({ city, category })} className="text-flamingo hover:underline">Back to the newest</Link>
          </p>
        )}
      </section>

      <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
        <div>
          <p className="text-sm text-haze">City</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href={href({ category })} className={chip(!city)} aria-current={!city ? "true" : undefined}>All</Link>
            {BOARD_CITIES.map((c) => (
              <Link key={c} href={href({ city: c, category })} className={chip(city === c)} aria-current={city === c ? "true" : undefined}>{c}</Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-haze">Category</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link href={href({ city })} className={chip(!category)} aria-current={!category ? "true" : undefined}>All</Link>
            {CATEGORIES.map((c) => (
              <Link key={c} href={href({ city, category: c })} className={chip(category === c)} aria-current={category === c ? "true" : undefined}>{CATEGORY_LABELS[c]}</Link>
            ))}
          </div>
        </div>
        <div className="deco-frame p-5 text-sm">
          <p className="font-display text-lg text-sand">House rules</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-haze">
            <li>Talk cigars, pairings, gear and good company.</li>
            <li>No selling or trading tobacco on the Board.</li>
            <li>What&apos;s said at a private herf stays there.</li>
            <li>See something off? Use Report and a host will look.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
