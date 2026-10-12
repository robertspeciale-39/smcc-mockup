import Link from "next/link";
import { Sunburst } from "@/components/Sunburst";
import { CigarCard } from "@/components/CigarCard";
import { cigars, episodes, meetups, posts } from "@/lib/data";

export default function Lobby() {
  const nextHerf = meetups[0];
  const episode = episodes[0];
  const featured = cigars.find((c) => c.id === "padron-1964-maduro")!;

  return (
    <>
      {/* Hero: the club's sign at sunrise */}
      <section className="relative overflow-hidden bg-deep">
        <div className="mx-auto max-w-6xl px-4 pb-0 pt-14 text-center sm:pt-20">
          <p className="text-seafoam">Las Vegas, every Sunday since the first one</p>
          <h1 className="mx-auto mt-4 max-w-4xl font-display text-[2.6rem] leading-[1.05] text-sand sm:text-7xl">
            The Sunday Morning Cigar Club
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-haze">
            Coffee, a good cigar, and the people worth sharing them with. Find your next smoke,
            meet members in your city, and pull up a chair.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/membership" className="rounded-full bg-flamingo px-6 py-3 font-medium text-deep hover:bg-sand">
              Join the club
            </Link>
            <Link href="/finder" className="rounded-full border border-gold/60 px-6 py-3 hover:border-flamingo hover:text-flamingo">
              Find your cigar
            </Link>
          </div>
          <Sunburst className="sun-rise mx-auto mt-10 w-full max-w-2xl" />
        </div>
        <div className="pinstripe" />
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <h2 className="font-display text-3xl text-sand">This week at the club</h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="deco-frame flex flex-col bg-lagoon/50 p-8 lg:col-span-2">
            <p className="text-seafoam">Next herf</p>
            <h3 className="mt-1 font-display text-3xl text-sand sm:text-4xl">{nextHerf.title}</h3>
            <p className="mt-3 text-lg">
              {nextHerf.date} at {nextHerf.time}
              <span className="text-haze"> · {nextHerf.venue}</span>
            </p>
            <p className="mt-2 text-haze">{nextHerf.note}</p>
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-8">
              <Link href="/meetups" className="rounded-full bg-flamingo px-5 py-2.5 font-medium text-deep hover:bg-sand">
                RSVP
              </Link>
              <span className="text-sm text-haze">
                {nextHerf.going} of {nextHerf.capacity} seats taken · hosted by {nextHerf.host}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <Link href="/podcast" className="group rounded-md border border-gold/25 bg-lagoon/40 p-6 hover:border-flamingo">
              <p className="text-seafoam">Latest episode</p>
              <h3 className="mt-1 text-xl font-medium group-hover:text-flamingo">
                Ep. {episode.n}: {episode.title}
              </h3>
              <p className="mt-2 text-sm text-haze">{episode.summary}</p>
            </Link>
            <Link href="/finder" className="group rounded-md border border-gold/25 bg-lagoon/40 p-6 hover:border-flamingo">
              <p className="text-seafoam">The club is smoking</p>
              <h3 className="mt-1 text-xl font-medium group-hover:text-flamingo">
                {featured.brand} {featured.name}
              </h3>
              <p className="mt-2 text-sm text-haze">
                Highest-rated cigar on the Board this month, at {featured.clubRating} out of 5.
              </p>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="font-display text-3xl text-sand">From the Board</h2>
          <Link href="/board" className="text-flamingo hover:underline">Read the Board</Link>
        </div>
        <ul className="mt-6 divide-y divide-gold/15 border-y border-gold/15">
          {posts.slice(0, 3).map((p) => (
            <li key={p.id} className="flex gap-4 py-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/50 text-sm text-gold">
                {p.initials}
              </span>
              <div>
                <p className="text-sm text-haze">
                  <span className="text-sand">{p.author}</span> · {p.city} · {p.ago}
                </p>
                <p className="mt-1 max-w-3xl">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-16 grid max-w-6xl items-start gap-10 px-4 lg:grid-cols-[1fr_22rem]">
        <div>
          <h2 className="font-display text-3xl text-sand">Not sure what to light next?</h2>
          <p className="mt-3 max-w-xl text-haze">
            Tell the Cigar Finder how strong you like it, which wrapper you prefer and the flavors you
            chase. It matches you against the cigars our members actually smoke.
          </p>
          <Link href="/finder" className="mt-6 inline-block rounded-full border border-gold/60 px-6 py-3 hover:border-flamingo hover:text-flamingo">
            Open the Cigar Finder
          </Link>
        </div>
        <CigarCard cigar={featured} />
      </section>
    </>
  );
}
