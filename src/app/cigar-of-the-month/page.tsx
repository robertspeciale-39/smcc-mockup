"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { CigarCard, StrengthMeter } from "@/components/CigarCard";
import { cigars, monthlyPick, nominees, pastPicks } from "@/lib/data";

const find = (id: string) => cigars.find((c) => c.id === id)!;

export default function CigarOfTheMonth() {
  const [myVote, setMyVote] = useState<string | null>(null);

  const pick = find(monthlyPick.cigarId);
  const counts = nominees.map((n) => ({ ...n, votes: n.votes + (myVote === n.cigarId ? 1 : 0) }));
  const total = counts.reduce((sum, n) => sum + n.votes, 0);

  return (
    <>
      <PageHeader
        title="Cigar of the Month"
        lead="One cigar, the whole club, a month of notes to compare. Members pick next month's."
      />

      <div className="mx-auto max-w-6xl px-4 pt-10">
        <section className="grid items-start gap-8 lg:grid-cols-[22rem_1fr]">
          <CigarCard cigar={pick} />
          <div className="deco-frame bg-lagoon/50 p-8">
            <p className="text-seafoam">{monthlyPick.month}</p>
            <h2 className="mt-1 font-display text-3xl text-sand sm:text-4xl">{pick.brand} {pick.name}</h2>
            <p className="mt-4 max-w-xl text-lg">{monthlyPick.blurb}</p>

            <dl className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div><dt className="text-sm text-haze">Smoked by</dt><dd className="font-display text-2xl text-flamingo">{monthlyPick.smokedBy}</dd></div>
              <div><dt className="text-sm text-haze">Club rating</dt><dd className="font-display text-2xl text-flamingo">{monthlyPick.rating}</dd></div>
              <div><dt className="text-sm text-haze">Smoke-along</dt><dd className="mt-1.5 text-sand">{monthlyPick.smokeAlong}</dd></div>
            </dl>

            <div className="pinstripe mt-6" />
            <h3 className="mt-6 text-lg font-medium text-sand">What members are saying</h3>
            <ul className="mt-3 space-y-3">
              {monthlyPick.reviews.map((r) => (
                <li key={r.author} className="border-l-2 border-flamingo pl-4">
                  <p>{r.text}</p>
                  <p className="text-sm text-haze">
                    {r.author} · <span className="text-gold" aria-label={`Rated ${r.rating} out of 5`}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </p>
                </li>
              ))}
            </ul>
            <Link href="/board" className="mt-6 inline-block rounded-full bg-flamingo px-5 py-2.5 font-medium text-deep hover:bg-sand">
              Log your Smoke Session
            </Link>
          </div>
        </section>

        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-3xl text-sand">Vote for November</h2>
            <p className="text-sm text-haze">Voting closes Saturday, Oct 31 · {total} votes so far</p>
          </div>
          <p className="mt-2 max-w-2xl text-haze">
            Four nominees, one vote each. You can change your vote until it closes.
          </p>

          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {counts.map((n) => {
              const c = find(n.cigarId);
              const pct = Math.round((n.votes / total) * 100);
              const mine = myVote === n.cigarId;
              return (
                <li key={n.cigarId} className={`rounded-md border p-5 ${mine ? "border-flamingo bg-lagoon/50" : "border-gold/20 bg-night"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-gold">{c.brand}</p>
                      <h3 className="text-lg font-medium text-sand">{c.name}</h3>
                      <p className="mt-1 flex items-center gap-3 text-sm text-haze">
                        <StrengthMeter value={c.strength} /> {c.wrapper} · ~${c.price}
                      </p>
                    </div>
                    <button
                      onClick={() => setMyVote(mine ? null : n.cigarId)}
                      aria-pressed={mine}
                      className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${
                        mine ? "border border-flamingo text-flamingo" : "bg-flamingo font-medium text-deep hover:bg-sand"
                      }`}
                    >
                      {mine ? "Your vote" : "Vote"}
                    </button>
                  </div>
                  <p className="mt-3 text-sm">&ldquo;{n.pitch}&rdquo; <span className="text-haze">{n.nominator}</span></p>

                  {/* Results show once you've voted, so early tallies don't sway anyone */}
                  {myVote && (
                    <div className="mt-4">
                      <div className="h-2 rounded-full bg-sand/15" role="img" aria-label={`${pct} percent of votes`}>
                        <div className="h-2 rounded-full bg-flamingo" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mt-1 text-sm text-haze">{pct}% · {n.votes} votes</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {!myVote && <p className="mt-4 text-sm text-haze">Results appear once you&apos;ve voted.</p>}
        </section>

        <section className="mt-16">
          <h2 className="font-display text-3xl text-sand">Past picks</h2>
          <ul className="mt-4 divide-y divide-gold/15 border-y border-gold/15">
            {pastPicks.map((p) => {
              const c = find(p.cigarId);
              return (
                <li key={p.month} className="flex flex-wrap items-baseline justify-between gap-2 py-4">
                  <span>
                    <span className="text-sm text-haze">{p.month}</span>
                    <span className="block text-sand">{c.brand} {c.name}</span>
                  </span>
                  <span className="text-sm text-haze">Club rating {c.clubRating.toFixed(1)} / 5</span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
