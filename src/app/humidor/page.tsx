"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { CigarCard } from "@/components/CigarCard";
import { cigars, STRENGTH_LABELS, WRAPPERS } from "@/lib/data";

const COUNTRIES = ["Dominican Republic", "Nicaragua", "Honduras"];
const SORTS = { rating: "Club rating", priceLow: "Price, low to high", strength: "Strength, mild first" } as const;

const selectCls = "w-full rounded border border-gold/30 bg-night p-2.5 text-sand";

export default function Humidor() {
  const [q, setQ] = useState("");
  const [wrapper, setWrapper] = useState("");
  const [strength, setStrength] = useState(0);
  const [country, setCountry] = useState("");
  const [sort, setSort] = useState<keyof typeof SORTS>("rating");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cigars
      .filter((c) => !term || `${c.brand} ${c.name} ${c.flavors.join(" ")}`.toLowerCase().includes(term))
      .filter((c) => !wrapper || c.wrapper === wrapper)
      .filter((c) => !strength || c.strength === strength)
      .filter((c) => !country || c.country === country)
      .sort((a, b) =>
        sort === "rating" ? b.clubRating - a.clubRating : sort === "priceLow" ? a.price - b.price : a.strength - b.strength,
      );
  }, [q, wrapper, strength, country, sort]);

  const reset = () => { setQ(""); setWrapper(""); setStrength(0); setCountry(""); };

  return (
    <>
      <PageHeader title="The Humidor" lead="Search every cigar in the club catalog by name, brand, flavor, wrapper, strength or origin." />

      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="sr-only">Search cigars</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search Padrón, maduro, cedar..."
              className="w-full rounded border border-gold/30 bg-night p-2.5 text-sand placeholder:text-haze/60"
            />
          </label>
          <label><span className="sr-only">Wrapper</span>
            <select value={wrapper} onChange={(e) => setWrapper(e.target.value)} className={selectCls}>
              <option value="">Any wrapper</option>
              {WRAPPERS.map((w) => <option key={w}>{w}</option>)}
            </select>
          </label>
          <label><span className="sr-only">Strength</span>
            <select value={strength} onChange={(e) => setStrength(Number(e.target.value))} className={selectCls}>
              <option value={0}>Any strength</option>
              {[1, 2, 3, 4, 5].map((s) => <option key={s} value={s}>{STRENGTH_LABELS[s]}</option>)}
            </select>
          </label>
          <label><span className="sr-only">Origin</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectCls}>
              <option value="">Any origin</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label><span className="sr-only">Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className={selectCls}>
              {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </label>
        </div>

        <p className="mt-5 text-sm text-haze" aria-live="polite">
          {list.length} of {cigars.length} cigars
        </p>

        {list.length === 0 ? (
          <div className="mt-6 rounded-md border border-gold/25 p-8 text-center">
            <p>No cigars match those filters.</p>
            <button onClick={reset} className="mt-3 text-flamingo hover:underline">Clear filters</button>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => <CigarCard key={c.id} cigar={c} />)}
          </div>
        )}
      </div>
    </>
  );
}
