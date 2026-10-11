"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { cigars, cities, posts as seed, type Post } from "@/lib/data";

export default function Board() {
  const [posts, setPosts] = useState<Post[]>(seed);
  const [city, setCity] = useState("All cities");
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState<Set<number>>(new Set());

  const shown = posts.filter((p) => city === "All cities" || p.city === city);

  const publish = () => {
    if (!draft.trim()) return;
    setPosts([
      { id: Date.now(), author: "Rob Speciale", initials: "RS", city: "Las Vegas", ago: "Just now", text: draft.trim(), likes: 0, replies: 0 },
      ...posts,
    ]);
    setDraft("");
  };

  const toggleLike = (id: number) => {
    const next = new Set(liked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLiked(next);
  };

  return (
    <>
      <PageHeader title="The Board" lead="What members are smoking, pouring and planning. Guests can read; members can post." />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 lg:grid-cols-[1fr_18rem]">
        <section>
          <div className="rounded-md border border-gold/25 bg-lagoon/40 p-5">
            <label htmlFor="draft" className="text-sm text-haze">Share what you&apos;re smoking</label>
            <textarea
              id="draft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              placeholder="Sunday patio, a Padrón and a cortado..."
              className="mt-2 w-full resize-none rounded border border-gold/30 bg-night p-3 text-sand placeholder:text-haze/60"
            />
            <div className="mt-3 flex justify-end">
              <button onClick={publish} className="rounded-full bg-flamingo px-5 py-2 font-medium text-deep hover:bg-sand disabled:opacity-40" disabled={!draft.trim()}>
                Post to the Board
              </button>
            </div>
          </div>

          <ul className="mt-8 space-y-4">
            {shown.map((p) => {
              const cigar = cigars.find((c) => c.id === p.cigarId);
              const isLiked = liked.has(p.id);
              return (
                <li key={p.id} className="rounded-md border border-gold/15 bg-night p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 text-sm text-gold">{p.initials}</span>
                    <p className="text-sm text-haze">
                      <span className="text-sand">{p.author}</span> · {p.city} · {p.ago}
                    </p>
                    {p.membersOnly && (
                      <span className="ml-auto rounded-full border border-seafoam/50 px-2.5 py-0.5 text-xs text-seafoam">Members only</span>
                    )}
                  </div>
                  <p className="mt-3">{p.text}</p>
                  {cigar && (
                    <Link href="/humidor" className="mt-3 inline-block rounded border border-gold/30 px-3 py-1 text-sm text-gold hover:border-flamingo hover:text-flamingo">
                      Smoking: {cigar.brand} {cigar.name}
                    </Link>
                  )}
                  <div className="mt-4 flex gap-5 text-sm text-haze">
                    <button onClick={() => toggleLike(p.id)} aria-pressed={isLiked} className={isLiked ? "text-flamingo" : "hover:text-sand"}>
                      {isLiked ? "Lit" : "Light it"} · {p.likes + (isLiked ? 1 : 0)}
                    </button>
                    <span>{p.replies} replies</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div>
            <label htmlFor="city" className="text-sm text-haze">Show posts from</label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full rounded border border-gold/30 bg-night p-2.5 text-sand"
            >
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="deco-frame p-5 text-sm">
            <p className="font-display text-lg text-sand">House rules</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-haze">
              <li>Talk cigars, pairings, gear and good company.</li>
              <li>No selling or trading tobacco on the Board.</li>
              <li>What&apos;s said at a private herf stays there.</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
