// Fills a LOCAL database with pretend members and posts so you can click around.
//   npm run db:seed
// It refuses to run against anything but localhost, and it only ever touches @smcc.test accounts.
import { like } from "drizzle-orm";
import { getDb } from "../src/db";
import { comments, posts, reactions, reports, users } from "../src/db/schema";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* no .env.local, fine */
}

const url = process.env.DATABASE_URL ?? "";
const host = (() => {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
})();
if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "::1"].includes(host)) {
  console.error("Refusing to seed: DATABASE_URL must point at a database on this computer (localhost).");
  process.exit(1);
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

const PEOPLE = [
  { key: "admin", name: "Alex Rivera", email: "admin@smcc.test", tier: "founder", role: "admin", city: "Las Vegas" },
  { key: "marcus", name: "Marcus Bell", email: "marcus@smcc.test", tier: "founder", role: "user", city: "Las Vegas" },
  { key: "dana", name: "Dana Ortiz", email: "dana@smcc.test", tier: "founder", role: "user", city: "Las Vegas" },
  { key: "greg", name: "Greg Whitfield", email: "greg@smcc.test", tier: "member", role: "user", city: "Scottsdale" },
  { key: "andre", name: "Andre Kim", email: "andre@smcc.test", tier: "member", role: "user", city: "Las Vegas" },
  { key: "lauren", name: "Lauren Hayes", email: "lauren@smcc.test", tier: "member", role: "user", city: "Miami" },
  { key: "victor", name: "Victor Chen", email: "victor@smcc.test", tier: "member", role: "user", city: "Las Vegas" },
  { key: "gina", name: "Gina Guest", email: "guest@smcc.test", tier: "guest", role: "user", city: "Las Vegas" },
  { key: "sam", name: "Sam Suspended", email: "suspended@smcc.test", tier: "member", role: "user", city: "Las Vegas", status: "suspended" },
] as const;

async function main() {
  const db = getDb();

  await db.delete(users).where(like(users.email, "%@smcc.test")); // cascades to their posts, replies, reactions

  const created = await db
    .insert(users)
    .values(PEOPLE.map((p) => ({ name: p.name, email: p.email, tier: p.tier, role: p.role, city: p.city, status: ("status" in p ? p.status : "active") as "active" | "suspended" })))
    .returning();
  const id = Object.fromEntries(PEOPLE.map((p, i) => [p.key, created[i].id])) as Record<(typeof PEOPLE)[number]["key"], string>;

  const inserted = await db
    .insert(posts)
    .values([
      { authorId: id.marcus, city: "Las Vegas", createdAt: hoursAgo(2), cigarId: "hemingway-short-story", body: "Patio was perfect this morning. 68 degrees, double espresso, and a Hemingway Short Story. Who's in for next Sunday?" },
      { authorId: id.dana, city: "Las Vegas", createdAt: hoursAgo(5), visibility: "members" as const, cigarId: "epc-pledge-prequel", body: "Picked up a box of Pledge Prequel. Dark chocolate and black pepper from the first draw. Bringing a few to the Big Smoke outing to share." },
      { authorId: id.victor, city: "Las Vegas", createdAt: hoursAgo(20), category: "smoke_session" as const, cigarId: "oliva-v-melanio", body: "Cleanest burn I've had on a figurado this year.", sessionRating: 5, sessionThirds: ["Cedar and a little black coffee", "Spice builds, still smooth", "Dark chocolate, long finish"] as [string, string, string], sessionPairing: "Bourbon" },
      { authorId: id.greg, city: "Scottsdale", createdAt: hoursAgo(26), category: "recommendations" as const, body: "Looking for a mild morning smoke that isn't just cream and nothing else. Recommendations?" },
      { authorId: id.andre, city: "Las Vegas", createdAt: hoursAgo(28), category: "recommendations" as const, cigarId: "four-kicks", body: "Ran the Cigar Finder with medium, Habano, cedar and citrus. It matched Four Kicks and it nailed it. Lemon zest in the first third." },
      { authorId: id.lauren, city: "Miami", createdAt: hoursAgo(50), body: "Heading to Vegas the first week of November. Any members open to a herf before the Big Smoke Friday night?" },
      { authorId: id.marcus, city: "Las Vegas", createdAt: hoursAgo(60), category: "pairings" as const, body: "Maduro and a stout is hard to beat on a cold night. Anyone tried it with a porter instead?" },
      { authorId: id.victor, city: "Las Vegas", createdAt: hoursAgo(72), visibility: "members" as const, cigarId: "le-bijou-1922", category: "gear" as const, body: "Humidor check: 69% and holding after the seasoning. Le Bijou is resting until Thanksgiving." },
    ])
    .returning({ id: posts.id, authorId: posts.authorId });

  const first = inserted[0].id;
  const greg = inserted[3].id;
  await db.insert(comments).values([
    { postId: first, authorId: id.dana, body: "Count me in. I'll bring the coffee.", createdAt: hoursAgo(1) },
    { postId: first, authorId: id.andre, body: "Same patio?", createdAt: hoursAgo(1) },
    { postId: greg, authorId: id.marcus, body: "Try the Hemingway Short Story. Sweet cedar, not boring.", createdAt: hoursAgo(25) },
  ]);
  await db.insert(reactions).values([
    { postId: first, userId: id.dana },
    { postId: first, userId: id.andre },
    { postId: inserted[2].id, userId: id.marcus },
  ]);
  // One open report so the host tools have something to show.
  await db.insert(reports).values({ reporterId: id.dana, postId: inserted[5].id, reason: "Feels like an ad for something. Not sure this belongs here." });

  console.log(`Seeded ${created.length} accounts (all @smcc.test), ${inserted.length} posts.`);
  console.log("Hosts sign in as admin@smcc.test with DEV_LOGIN=1. Guest: guest@smcc.test. Suspended: suspended@smcc.test.");
}

main().then(
  () => process.exit(0),
  (e) => {
    console.error(e);
    process.exit(1);
  },
);
