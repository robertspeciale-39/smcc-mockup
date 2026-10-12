"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";

const tiers = [
  {
    name: "Guest",
    monthly: "Free",
    annual: "Free",
    blurb: "Look around and find your next cigar.",
    perks: ["Cigar Finder", "Read the Board", "Public meetups", "Every podcast episode"],
    cta: "Continue with Google",
    featured: false,
  },
  {
    name: "Member",
    monthly: "$29 a month",
    annual: "$295 a year",
    blurb: "A seat at every table the club sets.",
    perks: ["Everything in Guest", "Post and reply on the Board", "RSVP to members-only herfs", "Member directory, opt-in", "Your own humidor journal"],
    cta: "Become a member",
    featured: true,
  },
  {
    name: "Founders Circle",
    monthly: "$750 a year",
    annual: "$750 a year",
    blurb: "Fifty seats. Dues locked for as long as you stay.",
    perks: ["Everything in Member", "Quarterly private herf at a partner lounge", "First seats on group outings", "Your name on the founders wall"],
    cta: "Request a seat",
    featured: false,
  },
];

export default function Membership() {
  const [annual, setAnnual] = useState(true);

  return (
    <>
      <PageHeader title="Membership" lead="Start free. Join when you want a seat at the herfs and a voice on the Board." />

      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="flex justify-center">
          <div className="inline-flex rounded-full border border-gold/40 p-1" role="group" aria-label="Billing period">
            {["Monthly", "Annual"].map((p) => {
              const on = (p === "Annual") === annual;
              return (
                <button
                  key={p}
                  onClick={() => setAnnual(p === "Annual")}
                  aria-pressed={on}
                  className={`rounded-full px-5 py-1.5 text-sm ${on ? "bg-gold text-deep" : ""}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-3">
          {tiers.map((t) => (
            <article
              key={t.name}
              className={`flex flex-col p-8 ${t.featured ? "deco-frame bg-lagoon lg:-my-4 lg:py-12" : "rounded-md border border-gold/25 bg-night"}`}
            >
              <h2 className="font-display text-3xl text-sand">{t.name}</h2>
              <p className="mt-1 text-haze">{t.blurb}</p>
              <p className="mt-6 text-2xl text-flamingo">{annual ? t.annual : t.monthly}</p>
              {t.name === "Founders Circle" && <p className="mt-1 text-sm text-seafoam">23 of 50 seats remaining</p>}
              <ul className="mt-6 space-y-2.5">
                {t.perks.map((p) => (
                  <li key={p} className="flex gap-3">
                    <span className="mt-2.5 h-px w-4 shrink-0 bg-gold" aria-hidden="true" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <button
                  className={`w-full rounded-full px-5 py-3 font-medium ${
                    t.featured ? "bg-flamingo text-deep hover:bg-sand" : "border border-gold/60 hover:border-flamingo hover:text-flamingo"
                  }`}
                >
                  {t.cta}
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-haze">
          Sign in with your Google account. Payments are handled securely by Stripe. Cancel any time.
        </p>
      </div>
    </>
  );
}
