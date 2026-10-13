"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { cigars, cities, DRINKS, members, posts as seed, type Post } from "@/lib/data";

const THIRDS = ["First third", "Second third", "Final third"] as const;

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default function Board() {
  const [posts, setPosts] = useState<Post[]>(seed);
  const [city, setCity] = useState("All cities");
  const [mode, setMode] = useState<"post" | "session">("post");
  const [draft, setDraft] = useState("");
  const [liked, setLiked] = useState<Set<number>>(new Set());

  // Smoke Session form
  const [sCigar, setSCigar] = useState(cigars[0].id);
  const [sRating, setSRating] = useState(0);
  const [sThirds, setSThirds] = useState<[string, string, string]>(["", "", ""]);
  const [sPairing, setSPairing] = useState(DRINKS[0]);
  const [sNote, setSNote] = useState("");

  const shown = posts.filter((p) => city === "All cities" || p.city === city);
  const me = { author: "Rob Speciale", initials: "RS", city: "Las Vegas", ago: "Just now", likes: 0, replies: 0 };

  const publish = () => {
    if (!draft.trim()) return;
    setPosts([{ id: Date.now(), ...me, text: draft.trim() }, ...posts]);
    setDraft("");
  };

  const logSession = () => {
    if (sRating === 0) return;
    setPosts([
      {
        id: Date.now(),
        ...me,
        text: sNote.trim(),
        cigarId: sCigar,
        session: { rating: sRating as 1 | 2 | 3 | 4 | 5, thirds: sThirds, pairing: sPairing },
      },
      ...posts,
    ]);
    setSRating(0);
    setSThirds(["", "", ""]);
    setSNote("");
  };

  const toggleLike = (id: number) => {
    const next = new Set(liked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLiked(next);
  };

  const field = "mt-1 w-full rounded border border-gold/30 bg-night p-2.5 text-sand placeholder:text-haze/60";

  return (
    <>
      <PageHeader title="The Board" lead="What members are smoking, pouring and planning. Guests can read; members can post." />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 lg:grid-cols-[1fr_18rem]">
        <section>
          <div className="rounded-md border border-gold/25 bg-lagoon/40 p-5">
            <div className="flex gap-2" role="group" aria-label="What would you like to share?">
              {([["post", "Post"], ["session", "Smoke Session"]] as const).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMode(k)}
                  aria-pressed={mode === k}
                  className={`rounded-full border px-4 py-1.5 text-sm ${
                    mode === k ? "border-flamingo bg-flamingo text-deep" : "border-gold/40 hover:border-flamingo"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === "post" ? (
              <>
                <label htmlFor="draft" className="mt-4 block text-sm text-haze">Share what you&apos;re smoking</label>
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
              </>
            ) : (
              <div className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="s-cigar" className="text-sm text-haze">Cigar</label>
                    <select id="s-cigar" value={sCigar} onChange={(e) => setSCigar(e.target.value)} className={field}>
                      {cigars.map((c) => <option key={c.id} value={c.id}>{c.brand} {c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="s-pairing" className="text-sm text-haze">What you paired it with</label>
                    <select id="s-pairing" value={sPairing} onChange={(e) => setSPairing(e.target.value)} className={field}>
                      {DRINKS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <fieldset className="mt-4">
                  <legend className="text-sm text-haze">Your rating</legend>
                  <div className="mt-1 flex gap-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSRating(n)}
                        aria-pressed={sRating === n}
                        aria-label={`${n} out of 5`}
                        className={`h-10 w-10 rounded border text-lg ${
                          n <= sRating ? "border-gold bg-gold/20 text-gold" : "border-gold/30 text-haze hover:border-flamingo"
                        }`}
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
                        value={sThirds[i]}
                        onChange={(e) => {
                          const next: [string, string, string] = [...sThirds];
                          next[i] = e.target.value;
                          setSThirds(next);
                        }}
                        placeholder={["Cedar, a little pepper", "Coffee builds", "Cocoa, strong finish"][i]}
                        className={field}
                      />
                    </div>
                  ))}
                </div>

                <label htmlFor="s-note" className="mt-4 block text-sm text-haze">Anything else? (optional)</label>
                <input id="s-note" value={sNote} onChange={(e) => setSNote(e.target.value)} placeholder="Worth buying a box?" className={field} />

                <div className="mt-4 flex items-center justify-end gap-4">
                  {sRating === 0 && <span className="text-sm text-haze">Pick a rating to log it.</span>}
                  <button onClick={logSession} disabled={sRating === 0} className="rounded-full bg-flamingo px-5 py-2 font-medium text-deep hover:bg-sand disabled:opacity-40">
                    Log Smoke Session
                  </button>
                </div>
              </div>
            )}
          </div>

          <ul className="mt-8 space-y-4">
            {shown.map((p) => {
              const cigar = cigars.find((c) => c.id === p.cigarId);
              const isLiked = liked.has(p.id);
              const badge = members.find((m) => m.name === p.author)?.badge;
              const s = p.session;
              return (
                <li key={p.id} className="rounded-md border border-gold/15 bg-night p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-gold/50 text-sm text-gold">{p.initials}</span>
                    <p className="text-sm text-haze">
                      <span className="text-sand">{p.author}</span> · {p.city} · {p.ago}
                      {badge && <span className="ml-2 rounded-full border border-gold/40 px-2 py-0.5 text-xs text-gold">{badge}</span>}
                    </p>
                    {p.membersOnly && (
                      <span className="ml-auto rounded-full border border-seafoam/50 px-2.5 py-0.5 text-xs text-seafoam">Members only</span>
                    )}
                  </div>
                  {p.text && <p className="mt-3">{p.text}</p>}
                  {p.photo && (
                    <figure className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.photo.src} alt={p.photo.alt} loading="lazy" className="max-h-80 w-full rounded border border-gold/20 object-cover" />
                      <figcaption className="mt-1 text-xs text-haze/70">Stock photo, sample post. {p.photo.credit}</figcaption>
                    </figure>
                  )}
                  {s && cigar && (
                    <div className="mt-3 rounded border border-gold/25 bg-lagoon/30 p-4">
                      <p className="text-sm text-seafoam">Smoke Session</p>
                      <p className="mt-1">
                        <Link href="/finder" className="text-sand hover:text-flamingo">{cigar.brand} {cigar.name}</Link>{" "}
                        <span className="whitespace-nowrap text-gold" aria-label={`Rated ${s.rating} out of 5`}>{stars(s.rating)}</span>
                      </p>
                      <ol className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                        {THIRDS.map((label, i) => (
                          <li key={label}>
                            <span className="block text-haze">{label}</span>
                            {s.thirds[i] || <span className="text-haze/60">No notes</span>}
                          </li>
                        ))}
                      </ol>
                      <p className="mt-3 text-sm text-haze">Paired with <span className="text-sand">{s.pairing}</span></p>
                    </div>
                  )}
                  {!s && cigar && (
                    <Link href="/finder" className="mt-3 inline-block rounded border border-gold/30 px-3 py-1 text-sm text-gold hover:border-flamingo hover:text-flamingo">
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
          <div className="rounded-md border border-gold/25 p-5 text-sm">
            <p className="font-display text-lg text-sand">Log a Smoke Session</p>
            <p className="mt-2 text-haze">
              Rate it, jot a note for each third, and note the pour. Sessions count toward your{" "}
              <Link href="/profile" className="text-flamingo hover:underline">badges</Link> and the club ratings in the Cigar Finder.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
