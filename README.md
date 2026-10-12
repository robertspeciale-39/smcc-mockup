# The Sunday Morning Cigar Club: Phase 1 mockup

A clickable design mockup built with Next.js and Tailwind CSS. Every member, post, meetup, episode and price is sample data in `src/lib/data.ts`. There is no database, login or payment yet.

## Pages

| Page | Path | What works in the mockup |
| --- | --- | --- |
| Lobby | `/` | Next herf, latest episode, featured cigar, Board preview |
| The Board | `/board` | Write a post, filter by city, "Light it" reactions |
| Meetups | `/meetups` | Filter by city, RSVP toggle |
| Cigar Finder | `/finder` | Strength, wrapper, flavors, occasion and budget produce three live matches |
| Podcast | `/podcast` | Sample episodes and player layout |
| Membership | `/membership` | Guest, Member, Founders Circle tiers with monthly/annual toggle |
| Profile | `/profile` | Member card, humidor journal, RSVPs |

A 21+ age check appears on first visit. Clear the site's local storage to see it again.

## Run it on your computer

1. Install Node.js 20 or newer from nodejs.org.
2. Unzip this folder, open a terminal in it, and run `npm install`.
3. Run `npm run dev` and open http://localhost:3000.

## Put it on GitHub

1. Go to github.com, click **+** (top right), then **New repository**.
2. Name it `smcc-mockup`, keep it **Private**, and do not add a README. Click **Create repository**.
3. In a terminal inside this folder, run the commands GitHub shows under "push an existing repository":
   ```
   git remote add origin https://github.com/YOUR-USERNAME/smcc-mockup.git
   git branch -M main
   git push -u origin main
   ```
   The folder already has one commit, so there is nothing else to add.

## Share it through Vercel

1. Go to vercel.com and sign in with GitHub.
2. Click **Add New**, then **Project**.
3. Find `smcc-mockup` in the list and click **Import**.
4. Leave every setting as detected (Framework: Next.js) and click **Deploy**.
5. In about a minute you get a link like `smcc-mockup.vercel.app` to send your buddy. Every push to `main` redeploys it.

## Design tokens

Defined in `src/app/globals.css`.

| Token | Hex | Use |
| --- | --- | --- |
| night | `#0e2f36` | Page background |
| deep | `#0a2329` | Header, hero, footer |
| lagoon | `#17464f` | Raised panels |
| flamingo | `#f3a5b6` | Primary buttons, active states |
| seafoam | `#8fd3c3` | Labels, status |
| gold | `#d6b25e` | Deco linework, the pinstripe divider |
| sand | `#f1e7d6` | Body text |

Type: Limelight for display headings (deco hotel signage), Jost for everything else (a Futura-style geometric sans). The sunrise-over-the-horizon sunburst is the club's signature; the triple gold pinstripe is the one repeated ornament.

## Phase 2 swap points

- `src/lib/data.ts`: replace sample arrays with Supabase queries.
- `affiliateUrl()` in the same file: replace with tracked Cigar Page links from Partnerize.
- `src/app/podcast/page.tsx`: read the podcast host's RSS feed.
- Membership buttons: Supabase Google sign-in and Stripe Checkout.
