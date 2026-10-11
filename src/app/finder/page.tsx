"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CigarCard } from "@/components/CigarCard";
import { cigars, FLAVORS, STRENGTH_LABELS, WRAPPERS, type Cigar, type Flavor, type Wrapper } from "@/lib/data";

const OCCASIONS = {
  "Morning coffee": (c: Cigar) => c.strength <= 3,
  "Afternoon on the patio": (c: Cigar) => c.strength >= 2 && c.strength <= 4,
  "On the golf course": (c: Cigar) => c.strength <= 3,
  "After dinner": (c: Cigar) => c.strength >= 4,
  "A celebration": (c: Cigar) => c.price >= 14,
} as const;
type Occasion = keyof typeof OCCASIONS;

const BUDGETS = [10, 15, 25];

function score(c: Cigar, strength: number, wrappers: Wrapper[], flavors: Flavor[], occasion: Occasion) {
  let s = 40 - 13 * Math.abs(c.strength - strength);
  s += wrappers.length === 0 ? 20 : wrappers.includes(c.wrapper) ? 25 : 0;
  const overlap = flavors.filter((f) => c.flavors.includes(f)).length;
  s += flavors.length === 0 ? 15 : (30 * overlap) / flavors.length;
  s += OCCASIONS[occasion](c) ? 5 : 0;
  return Math.max(0, Math.min(100, Math.round(s)));
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`rounded-full border px-3.5 py-1.5 text-sm capitalize ${
        on ? "border-flamingo bg-flamingo text-deep" : "border-gold/40 hover:border-flamingo"
      }`}
    >
      {children}
    </button>
  );
}

export default function Finder() {
  const [strength, setStrength] = useState(3);
  const [wrappers, setWrappers] = useState<Wrapper[]>([]);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [occasion, setOccasion] = useState<Occasion>("Morning coffee");
  const [budget, setBudget] = useState(25);

  const toggle = <T,>(list: T[], v: T, max = 99) =>
    list.includes(v) ? list.filter((x) => x !== v) : list.length >= max ? list : [...list, v];

  const results = useMemo(
    () =>
      cigars
        .filter((c) => c.price <= budget)
        .map((c) => ({ c, m: score(c, strength, wrappers, flavors, occasion) }))
        .sort((a, b) => b.m - a.m || b.c.clubRating - a.c.clubRating)
        .slice(0, 3),
    [strength, wrappers, flavors, occasion, budget],
  );

  return (
    <>
      <PageHeader
        title="Cigar Finder"
        lead="Describe what you enjoy and we'll match you with three cigars to try next. Results update as you choose."
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pt-10 lg:grid-cols-[22rem_1fr]">
        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend className="font-display text-xl text-sand">How strong?</legend>
            <input
              type="range"
              min={1}
              max={5}
              value={strength}
              onChange={(e) => setStrength(Number(e.target.value))}
              className="mt-4 w-full accent-flamingo"
              aria-valuetext={STRENGTH_LABELS[strength]}
            />
            <p className="mt-1 text-seafoam">{STRENGTH_LABELS[strength]}</p>
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl text-sand">Wrapper</legend>
            <p className="text-sm text-haze">Pick any you like, or none.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {WRAPPERS.map((w) => (
                <Chip key={w} on={wrappers.includes(w)} onClick={() => setWrappers(toggle(wrappers, w))}>{w}</Chip>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-xl text-sand">Flavors you chase</legend>
            <p className="text-sm text-haze">Up to three.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {FLAVORS.map((f) => (
                <Chip key={f} on={flavors.includes(f)} onClick={() => setFlavors(toggle(flavors, f, 3))}>{f}</Chip>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="font-display text-xl text-sand">When</span>
              <select
                value={occasion}
                onChange={(e) => setOccasion(e.target.value as Occasion)}
                className="mt-2 w-full rounded border border-gold/30 bg-night p-2.5"
              >
                {Object.keys(OCCASIONS).map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="font-display text-xl text-sand">Budget</span>
              <select
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="mt-2 w-full rounded border border-gold/30 bg-night p-2.5"
              >
                {BUDGETS.map((b) => <option key={b} value={b}>Up to ${b}</option>)}
              </select>
            </label>
          </div>
        </form>

        <section aria-live="polite">
          <h2 className="font-display text-2xl text-sand">Your matches</h2>
          {results.length === 0 ? (
            <p className="mt-4 text-haze">Nothing in the humidor fits that budget. Raise it to see matches.</p>
          ) : (
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {results.map(({ c, m }) => <CigarCard key={c.id} cigar={c} match={m} />)}
            </div>
          )}
          <p className="mt-6 text-sm text-haze">
            Matches come from the club&apos;s sample humidor of {cigars.length} cigars. In the live app,
            members save results and rate what they try.
          </p>
        </section>
      </div>
    </>
  );
}
