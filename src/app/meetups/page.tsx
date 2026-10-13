"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { cities, meetups, type Meetup } from "@/lib/data";

type Rsvp = { status: "going" | "waitlist"; guests: number };

export default function Meetups() {
  const [city, setCity] = useState("All cities");
  const [rsvps, setRsvps] = useState<Record<number, Rsvp>>({});
  const [openId, setOpenId] = useState<number | null>(null);
  const [guests, setGuests] = useState(0);

  const shown = meetups.filter((m) => city === "All cities" || m.city === city);

  const openPanel = (m: Meetup) => {
    setGuests(rsvps[m.id]?.guests ?? 0);
    setOpenId(m.id);
  };

  const confirm = (m: Meetup) => {
    const party = 1 + guests;
    const fits = party <= m.capacity - m.going;
    setRsvps({ ...rsvps, [m.id]: { status: fits ? "going" : "waitlist", guests } });
    setOpenId(null);
  };

  const cancel = (id: number) => {
    const next = { ...rsvps };
    delete next[id];
    setRsvps(next);
    if (openId === id) setOpenId(null);
  };

  return (
    <>
      <PageHeader title="Meetups" lead="Herfs, tastings and outings hosted by members. Public events are open to guests; the rest are for members." />

      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by city">
          {cities.map((c) => (
            <button
              key={c}
              onClick={() => setCity(c)}
              aria-pressed={city === c}
              className={`rounded-full border px-4 py-1.5 text-sm ${
                city === c ? "border-flamingo bg-flamingo text-deep" : "border-gold/40 hover:border-flamingo"
              }`}
            >
              {c}
            </button>
          ))}
          <button className="ml-auto rounded-full border border-gold/60 px-4 py-1.5 text-sm text-gold hover:border-flamingo hover:text-flamingo">
            Host a herf
          </button>
        </div>

        <ul className="mt-8 space-y-5">
          {shown.map((m) => {
            const mine = rsvps[m.id];
            const confirmed = mine?.status === "going" ? 1 + mine.guests : 0;
            const seatsTaken = m.going + confirmed;
            const left = m.capacity - m.going;
            const full = left <= 0;
            const waiting = (m.waitlist ?? 0) + (mine?.status === "waitlist" ? 1 : 0);
            const party = 1 + guests;
            const fits = party <= left;
            const [dow, ...rest] = m.date.split(", ");

            return (
              <li key={m.id} className="grid overflow-hidden rounded-md border border-gold/25 bg-lagoon/40 sm:grid-cols-[8rem_1fr_auto]">
                <div className="flex flex-row items-baseline justify-center gap-2 bg-gold px-4 py-3 text-deep sm:flex-col sm:items-center sm:justify-center sm:gap-0">
                  <span className="text-sm">{dow}</span>
                  <span className="font-display text-2xl leading-tight">{rest.join(", ")}</span>
                  <span className="text-sm">{m.time}</span>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-medium text-sand">{m.title}</h2>
                    {m.membersOnly && (
                      <span className="rounded-full border border-seafoam/50 px-2.5 py-0.5 text-xs text-seafoam">Members only</span>
                    )}
                    {full && !mine && (
                      <span className="rounded-full border border-flamingo/60 px-2.5 py-0.5 text-xs text-flamingo">Full</span>
                    )}
                  </div>
                  <p className="mt-1 text-haze">{m.city} · {m.venue}</p>
                  <p className="mt-2">{m.note}</p>
                  <p className="mt-2 text-sm text-haze">
                    Hosted by {m.host} · {m.guestsAllowed === 0 ? "No guests" : `Guests: up to ${m.guestsAllowed} each`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 border-t border-gold/15 p-5 sm:flex-col sm:justify-center sm:border-l sm:border-t-0">
                  <span className="text-sm text-haze">
                    {Math.min(seatsTaken, m.capacity)} of {m.capacity} going
                    {waiting > 0 && <span className="block">{waiting} on the waitlist</span>}
                  </span>

                  {!mine && (
                    <button
                      onClick={() => (openId === m.id ? setOpenId(null) : openPanel(m))}
                      aria-expanded={openId === m.id}
                      className="rounded-full bg-flamingo px-5 py-2 font-medium text-deep hover:bg-sand"
                    >
                      {full ? "Join waitlist" : "RSVP"}
                    </button>
                  )}

                  {mine && (
                    <div className="text-center">
                      <p className={`rounded-full border px-4 py-1.5 text-sm ${mine.status === "going" ? "border-seafoam text-seafoam" : "border-gold text-gold"}`}>
                        {mine.status === "going"
                          ? `You're going${mine.guests ? ` +${mine.guests}` : ""}`
                          : `Waitlist #${(m.waitlist ?? 0) + 1}`}
                      </p>
                      <p className="mt-2 text-sm">
                        <button onClick={() => openPanel(m)} className="text-flamingo hover:underline">Change</button>
                        <span className="text-haze"> · </span>
                        <button onClick={() => cancel(m.id)} className="text-haze hover:text-sand hover:underline">Cancel</button>
                      </p>
                    </div>
                  )}
                </div>

                {openId === m.id && (
                  <div className="border-t border-gold/15 bg-night/60 p-5 sm:col-span-3">
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                      <div>
                        <p className="font-medium text-sand">Bringing a guest?</p>
                        <p className="text-sm text-haze">
                          {m.guestsAllowed === 0
                            ? "This herf is for members only. No guests."
                            : `Each member may bring up to ${m.guestsAllowed}. Guests are named at check-in.`}
                        </p>
                      </div>

                      <div className="flex items-center gap-3" role="group" aria-label="Number of guests">
                        <button
                          onClick={() => setGuests(Math.max(0, guests - 1))}
                          disabled={guests === 0}
                          aria-label="One fewer guest"
                          className="h-9 w-9 rounded-full border border-gold/50 text-lg hover:border-flamingo disabled:opacity-30"
                        >
                          −
                        </button>
                        <span className="w-24 text-center" aria-live="polite">
                          {guests === 0 ? "Just me" : `Me + ${guests}`}
                        </span>
                        <button
                          onClick={() => setGuests(Math.min(m.guestsAllowed, guests + 1))}
                          disabled={guests >= m.guestsAllowed}
                          aria-label="One more guest"
                          className="h-9 w-9 rounded-full border border-gold/50 text-lg hover:border-flamingo disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <div className="ml-auto flex items-center gap-3">
                        <button onClick={() => setOpenId(null)} className="text-haze hover:text-sand">Close</button>
                        <button onClick={() => confirm(m)} className="rounded-full bg-flamingo px-5 py-2 font-medium text-deep hover:bg-sand">
                          {fits ? `Confirm ${party} ${party === 1 ? "seat" : "seats"}` : `Join waitlist, party of ${party}`}
                        </button>
                      </div>
                    </div>
                    {!fits && (
                      <p className="mt-3 text-sm text-gold">
                        {left <= 0 ? "This herf is full." : `Only ${left} ${left === 1 ? "seat is" : "seats are"} left, not enough for a party of ${party}.`}{" "}
                        You&apos;ll be added to the waitlist, and the host will confirm if seats open.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
