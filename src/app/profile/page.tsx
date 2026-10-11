import Link from "next/link";
import { SunMark } from "@/components/Sunburst";
import { StrengthMeter } from "@/components/CigarCard";
import { cigars, meetups } from "@/lib/data";

const journal = [
  { id: "hemingway-short-story", date: "Oct 4", rating: 5, note: "Sweet cedar all the way down. The Sunday standard." },
  { id: "tatuaje-verocu", date: "Sep 27", rating: 4, note: "Pepper up front, coffee by the second third." },
  { id: "undercrown-maduro", date: "Sep 20", rating: 4, note: "Great value with a cortado." },
];

export default function Profile() {
  const myHerfs = meetups.filter((m) => [1, 4].includes(m.id));

  return (
    <div className="mx-auto max-w-5xl px-4 pt-12">
      {/* The membership card */}
      <section className="deco-frame mx-auto max-w-lg bg-lagoon p-8">
        <div className="flex items-center justify-between">
          <SunMark className="h-7 w-12" />
          <span className="text-sm text-gold">Member No. 0042</span>
        </div>
        <h1 className="mt-6 font-display text-4xl text-sand">Rob Speciale</h1>
        <p className="mt-1 text-haze">Member since October 2026 · Las Vegas</p>
        <div className="pinstripe mt-6" />
        <dl className="mt-5 grid grid-cols-3 text-center">
          <div><dt className="text-sm text-haze">Logged</dt><dd className="font-display text-2xl text-flamingo">31</dd></div>
          <div><dt className="text-sm text-haze">Herfs</dt><dd className="font-display text-2xl text-flamingo">7</dd></div>
          <div><dt className="text-sm text-haze">Go-to wrapper</dt><dd className="mt-1.5 text-sand">Cameroon</dd></div>
        </dl>
      </section>

      <div className="mt-14 grid gap-10 md:grid-cols-[1fr_18rem]">
        <section>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-2xl text-sand">Humidor journal</h2>
            <button className="text-flamingo hover:underline">Log a cigar</button>
          </div>
          <ul className="mt-4 space-y-4">
            {journal.map((j) => {
              const c = cigars.find((x) => x.id === j.id)!;
              return (
                <li key={j.id} className="rounded-md border border-gold/20 p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="font-medium">{c.brand} {c.name}</h3>
                    <span className="text-sm text-haze">{j.date}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <StrengthMeter value={c.strength} />
                    <span className="text-gold" aria-label={`Rated ${j.rating} of 5`}>{"★".repeat(j.rating)}{"☆".repeat(5 - j.rating)}</span>
                  </div>
                  <p className="mt-2 text-haze">{j.note}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <aside>
          <h2 className="font-display text-2xl text-sand">Your RSVPs</h2>
          <ul className="mt-4 space-y-3">
            {myHerfs.map((m) => (
              <li key={m.id} className="border-l-2 border-flamingo pl-4">
                <p className="font-medium">{m.title}</p>
                <p className="text-sm text-haze">{m.date} · {m.time}</p>
              </li>
            ))}
          </ul>
          <Link href="/meetups" className="mt-5 inline-block text-flamingo hover:underline">See all meetups</Link>
        </aside>
      </div>
    </div>
  );
}
