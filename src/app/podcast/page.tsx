import { PageHeader } from "@/components/PageHeader";
import { Sunburst } from "@/components/Sunburst";
import { episodes } from "@/lib/data";

export default function Podcast() {
  const [latest, ...older] = episodes;
  return (
    <>
      <PageHeader
        title="The Podcast"
        lead="Conversations from the patio. New episodes appear here on their own the moment they're published."
      />

      <div className="mx-auto max-w-4xl px-4 pt-10">
        <article className="deco-frame grid items-center gap-6 bg-lagoon/50 p-6 sm:grid-cols-[10rem_1fr] sm:p-8">
          <div className="grid aspect-square place-items-end bg-deep p-3">
            <Sunburst className="w-full" />
          </div>
          <div>
            <p className="text-seafoam">Latest episode</p>
            <h2 className="mt-1 font-display text-3xl text-sand">Ep. {latest.n}: {latest.title}</h2>
            <p className="mt-2 text-haze">With {latest.guest} · {latest.length}</p>
            <p className="mt-3">{latest.summary}</p>
            <div className="mt-5 flex items-center gap-4">
              <button className="grid h-12 w-12 place-items-center rounded-full bg-flamingo text-deep" aria-label="Play episode">
                <svg viewBox="0 0 12 14" className="ml-0.5 h-4 w-4" aria-hidden="true"><path d="M0 0l12 7-12 7z" fill="currentColor" /></svg>
              </button>
              <div className="h-1 flex-1 rounded bg-sand/15">
                <div className="h-1 w-0 rounded bg-flamingo" />
              </div>
              <span className="text-sm text-haze">0:00</span>
            </div>
          </div>
        </article>

        <h2 className="mt-12 font-display text-2xl text-sand">Earlier episodes</h2>
        <ul className="mt-4 divide-y divide-gold/15 border-y border-gold/15">
          {older.map((e) => (
            <li key={e.n} className="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-5">
              <span className="font-display text-xl text-gold">Ep. {e.n}</span>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-medium">{e.title}</h3>
                <p className="text-haze">{e.summary}</p>
              </div>
              <span className="text-sm text-haze">{e.length}</span>
            </li>
          ))}
        </ul>

        <p className="mt-8 rounded-md border border-gold/25 p-5 text-sm text-haze">
          Sample episodes. Once the show has a host, this page reads its RSS feed and lists every
          episode automatically, with links to Apple Podcasts and Spotify.
        </p>
      </div>
    </>
  );
}
