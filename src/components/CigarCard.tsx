import { affiliateUrl, checkInsFor, pairingsFor, STRENGTH_LABELS, type Cigar, type Wrapper } from "@/lib/data";

const WRAPPER_SHADE: Record<Wrapper, string> = {
  Connecticut: "#c9a574",
  Cameroon: "#8b5a33",
  Habano: "#7a4a2a",
  Sumatra: "#6b4428",
  Corojo: "#74452b",
  Maduro: "#3b2418",
};

export function StrengthMeter({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Strength: ${STRENGTH_LABELS[value]}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`h-2.5 w-4 rounded-sm ${n <= value ? "bg-flamingo" : "bg-sand/15"}`} />
      ))}
    </span>
  );
}

export function CigarCard({ cigar, match }: { cigar: Cigar; match?: number }) {
  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-gold/25 bg-lagoon/60">
      {/* The wrapper leaf, with a band in the club's colors */}
      <div className="relative h-9" style={{ background: WRAPPER_SHADE[cigar.wrapper] }}>
        <div className="absolute inset-y-0 left-6 flex w-24 items-center justify-center border-x-2 border-gold bg-flamingo">
          <span className="font-display text-[0.7rem] text-deep">{cigar.brand.split(" ")[0]}</span>
        </div>
        {match !== undefined && (
          <span className="absolute right-3 top-1.5 rounded-full bg-deep/80 px-2.5 py-0.5 text-sm text-seafoam">
            {match}% match
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-sm text-gold">{cigar.brand}</p>
        <h3 className="mt-0.5 text-lg font-medium leading-snug text-sand">{cigar.name}</h3>

        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-haze">Strength</dt>
          <dd><StrengthMeter value={cigar.strength} /></dd>
          <dt className="text-haze">Wrapper</dt>
          <dd>{cigar.wrapper}</dd>
          <dt className="text-haze">Origin</dt>
          <dd>{cigar.country}</dd>
          <dt className="text-haze">Shape</dt>
          <dd>{cigar.vitola}</dd>
          <dt className="text-haze">Check-ins</dt>
          <dd>{checkInsFor(cigar)} this year</dd>
        </dl>

        <p className="mt-3 text-sm text-haze">
          Notes of {cigar.flavors.join(", ")}
        </p>

        <details className="mt-3 rounded border border-gold/20 px-3 py-2 text-sm">
          <summary className="cursor-pointer text-seafoam">Pairing guide</summary>
          <ul className="mt-2 space-y-2">
            {pairingsFor(cigar).map((p) => (
              <li key={p.drink}>
                <span className="text-sand">{p.drink}</span>
                <span className="block text-haze">{p.why}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-haze/70">Club suggestions. Enjoy responsibly.</p>
        </details>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
          <span className="whitespace-nowrap text-sm">
            <span className="text-sand">~${cigar.price}</span>
            <span className="text-haze"> · club {cigar.clubRating.toFixed(1)}/5</span>
          </span>
          <a
            href={affiliateUrl(cigar)}
            target="_blank"
            rel="noopener sponsored"
            className="whitespace-nowrap rounded-full border border-flamingo px-3.5 py-1.5 text-sm text-flamingo hover:bg-flamingo hover:text-deep"
          >
            Buy on Cigar Page
          </a>
        </div>
      </div>
    </article>
  );
}
