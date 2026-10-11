"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { cities, meetups } from "@/lib/data";

export default function Meetups() {
  const [city, setCity] = useState("All cities");
  const [rsvps, setRsvps] = useState<Set<number>>(new Set());

  const shown = meetups.filter((m) => city === "All cities" || m.city === city);

  const toggle = (id: number) => {
    const next = new Set(rsvps);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRsvps(next);
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
            const going = rsvps.has(m.id);
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
                  </div>
                  <p className="mt-1 text-haze">{m.city} · {m.venue}</p>
                  <p className="mt-2">{m.note}</p>
                  <p className="mt-2 text-sm text-haze">Hosted by {m.host}</p>
                </div>
                <div className="flex items-center gap-4 border-t border-gold/15 p-5 sm:flex-col sm:justify-center sm:border-l sm:border-t-0">
                  <span className="text-sm text-haze">
                    {m.going + (going ? 1 : 0)} of {m.capacity} going
                  </span>
                  <button
                    onClick={() => toggle(m.id)}
                    aria-pressed={going}
                    className={`rounded-full px-5 py-2 font-medium ${
                      going ? "border border-seafoam text-seafoam" : "bg-flamingo text-deep hover:bg-sand"
                    }`}
                  >
                    {going ? "You're going" : "RSVP"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
