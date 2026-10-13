"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { cigars, INDUSTRIES, members, OPEN_TO, type OpenTo } from "@/lib/data";

export default function Members() {
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("All industries");
  const [city, setCity] = useState("All cities");
  const [open, setOpen] = useState<OpenTo[]>([]);
  const [listed, setListed] = useState(true);
  const [intros, setIntros] = useState<Set<number>>(new Set());

  const toggleOpen = (o: OpenTo) => setOpen(open.includes(o) ? open.filter((x) => x !== o) : [...open, o]);
  const toggleIntro = (id: number) => {
    const next = new Set(intros);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setIntros(next);
  };

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return members.filter((m) => {
      if (m.you && !listed) return false;
      if (industry !== "All industries" && m.industry !== industry) return false;
      if (city !== "All cities" && m.city !== city) return false;
      if (open.length && !open.every((o) => m.openTo.includes(o))) return false;
      if (needle && !`${m.name} ${m.headline} ${m.industry}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, industry, city, open, listed]);

  const memberCities = Array.from(new Set(members.map((m) => m.city)));
  const field = "mt-1 w-full rounded border border-gold/30 bg-night p-2.5 text-sand placeholder:text-haze/60";

  return (
    <>
      <PageHeader
        title="Members"
        lead="The people behind the smoke. Listings are opt-in, so you only see members who chose to be found."
      />

      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="rounded-md border border-gold/25 bg-lagoon/40 p-5">
          <div className="grid gap-4 md:grid-cols-[1fr_14rem_12rem]">
            <div>
              <label htmlFor="m-search" className="text-sm text-haze">Search by name or work</label>
              <input id="m-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Attorney, developer, Marcus..." className={field} />
            </div>
            <div>
              <label htmlFor="m-industry" className="text-sm text-haze">Industry</label>
              <select id="m-industry" value={industry} onChange={(e) => setIndustry(e.target.value)} className={field}>
                <option>All industries</option>
                {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="m-city" className="text-sm text-haze">City</label>
              <select id="m-city" value={city} onChange={(e) => setCity(e.target.value)} className={field}>
                <option>All cities</option>
                {memberCities.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Open to">
            <span className="mr-1 text-sm text-haze">Open to</span>
            {OPEN_TO.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => toggleOpen(o)}
                aria-pressed={open.includes(o)}
                className={`rounded-full border px-3.5 py-1.5 text-sm ${
                  open.includes(o) ? "border-flamingo bg-flamingo text-deep" : "border-gold/40 hover:border-flamingo"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-haze">
          <p aria-live="polite">{shown.length} {shown.length === 1 ? "member" : "members"}</p>
          <p>
            Your listing is {listed ? "visible" : "hidden"}.{" "}
            <button onClick={() => setListed(!listed)} className="text-flamingo hover:underline">
              {listed ? "Hide me" : "Show me"}
            </button>
          </p>
        </div>

        {shown.length === 0 ? (
          <p className="mt-10 text-haze">No one matches those filters. Try removing one.</p>
        ) : (
          <ul className="mt-6 grid gap-5 md:grid-cols-2">
            {shown.map((m) => {
              const fav = cigars.find((c) => c.id === m.favoriteCigarId)!;
              const asked = intros.has(m.id);
              return (
                <li key={m.id} className="flex flex-col rounded-md border border-gold/20 bg-night p-5">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-gold/50 text-gold">{m.initials}</span>
                    <div className="min-w-0">
                      <h2 className="text-lg font-medium text-sand">
                        {m.name}
                        {m.you && <span className="ml-2 text-sm text-haze">(you)</span>}
                      </h2>
                      <p className="text-sm text-haze">{m.city} · {m.industry}</p>
                    </div>
                    {m.tier === "Founders Circle" && (
                      <span className="ml-auto whitespace-nowrap rounded-full border border-gold/60 px-2.5 py-0.5 text-xs text-gold">Founders Circle</span>
                    )}
                  </div>

                  <p className="mt-3">{m.headline}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.openTo.map((o) => (
                      <span key={o} className="rounded-full border border-seafoam/40 px-2.5 py-0.5 text-xs text-seafoam">Open to {o.toLowerCase()}</span>
                    ))}
                  </div>

                  <p className="mt-3 text-sm text-haze">
                    Favorite: <span className="text-sand">{fav.brand} {fav.name}</span> · Wears <span className="text-gold">{m.badge}</span>
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                    <span className="text-sm text-haze">Member since {m.since}</span>
                    {m.you ? (
                      <span className="text-sm text-haze">This is how others see you</span>
                    ) : (
                      <button
                        onClick={() => toggleIntro(m.id)}
                        aria-pressed={asked}
                        className={`rounded-full px-4 py-1.5 text-sm ${
                          asked ? "border border-seafoam text-seafoam" : "border border-flamingo text-flamingo hover:bg-flamingo hover:text-deep"
                        }`}
                      >
                        {asked ? "Intro requested" : "Request an intro"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <p className="mt-8 max-w-2xl text-sm text-haze">
          In the live app, intro requests go to a club host, who passes along a note only if both sides agree. Nobody&apos;s email or phone number is shown.
        </p>
      </div>
    </>
  );
}
