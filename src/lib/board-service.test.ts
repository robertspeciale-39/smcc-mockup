// Run with:  TEST_DATABASE_URL=postgres://.../smcc_test npm test
// Uses a real Postgres. The database name must contain "test" because every table is emptied between tests.

import assert from "node:assert/strict";
import { after, before, beforeEach, describe, it } from "node:test";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "@/db/schema";
import type { Db } from "@/db";
import type { Role, Tier, UserStatus } from "@/db/enums";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  listAccounts,
  listComments,
  listFeed,
  listOpenReports,
  reportContent,
  resolveReport,
  setContentHidden,
  setUserStatus,
  setUserTier,
  toggleReaction,
} from "@/lib/board-service";
import { ServiceError, type Viewer } from "@/lib/permissions";

try {
  process.loadEnvFile(".env.test");
} catch {
  /* optional file */
}
const url = process.env.TEST_DATABASE_URL ?? "";
if (!url || !/test/i.test(new URL(url).pathname)) {
  throw new Error('Set TEST_DATABASE_URL to a throwaway database whose name contains "test" (see SETUP.md).');
}
const client = postgres(url, { max: 4, onnotice: () => {} });
const db: Db = drizzle(client, { schema });

let counter = 0;
async function mkUser(opts: { tier?: Tier; role?: Role; status?: UserStatus; name?: string } = {}): Promise<Viewer> {
  counter += 1;
  const [u] = await db
    .insert(schema.users)
    .values({
      name: opts.name ?? `User ${counter}`,
      email: `user${counter}@example.test`,
      tier: opts.tier ?? "member",
      role: opts.role ?? "user",
      status: opts.status ?? "active",
    })
    .returning();
  return { id: u.id, name: u.name, email: u.email, image: null, tier: u.tier, role: u.role, status: u.status, city: u.city };
}

async function code(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (e) {
    if (e instanceof ServiceError) return e.code;
    throw e;
  }
  return "ok";
}

const post = (body: string, extra: Record<string, unknown> = {}) => ({
  body,
  category: "general",
  city: "Las Vegas",
  visibility: "public",
  ...extra,
});

before(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
});
beforeEach(async () => {
  await db.execute(sql`truncate table users cascade`);
});
after(async () => {
  await client.end();
});

describe("who can read what", () => {
  it("shows signed-out visitors and guests public posts only", async () => {
    const member = await mkUser();
    const guest = await mkUser({ tier: "guest" });
    await createPost(db, member, post("Public hello"));
    await createPost(db, member, post("Members only hello", { visibility: "members" }));

    assert.deepEqual((await listFeed(db, null)).posts.map((p) => p.body), ["Public hello"]);
    assert.deepEqual((await listFeed(db, guest)).posts.map((p) => p.body), ["Public hello"]);
    assert.equal((await listFeed(db, member)).posts.length, 2);
  });

  it("lets founders and admins see members-only posts, but not suspended accounts", async () => {
    const author = await mkUser();
    await createPost(db, author, post("Inner circle", { visibility: "members" }));
    const founder = await mkUser({ tier: "founder" });
    const admin = await mkUser({ tier: "guest", role: "admin" });
    const suspended = await mkUser({ status: "suspended" });
    assert.equal((await listFeed(db, founder)).posts.length, 1);
    assert.equal((await listFeed(db, admin)).posts.length, 1);
    assert.equal((await listFeed(db, suspended)).posts.length, 0);
  });

  it("hides moderated posts from everyone except admins", async () => {
    const author = await mkUser();
    const admin = await mkUser({ role: "admin" });
    const { id } = await createPost(db, author, post("Questionable"));
    await setContentHidden(db, admin, { kind: "post", id, hidden: true });

    assert.equal((await listFeed(db, author)).posts.length, 0);
    assert.equal((await listFeed(db, null)).posts.length, 0);
    const forAdmin = (await listFeed(db, admin)).posts;
    assert.equal(forAdmin.length, 1);
    assert.equal(forAdmin[0].status, "hidden");

    await setContentHidden(db, admin, { kind: "post", id, hidden: false });
    assert.equal((await listFeed(db, author)).posts.length, 1);
  });

  it("filters by city and category, and pages with a cursor", async () => {
    const m = await mkUser();
    await createPost(db, m, post("Vegas one"));
    await createPost(db, m, post("Miami one", { city: "Miami", category: "gear" }));
    for (let i = 0; i < 3; i++) await createPost(db, m, post(`Vegas more ${i}`));

    assert.equal((await listFeed(db, m, { city: "Miami" })).posts.length, 1);
    assert.equal((await listFeed(db, m, { category: "gear" })).posts[0].body, "Miami one");

    const first = await listFeed(db, m, { limit: 2 });
    assert.equal(first.posts.length, 2);
    assert.equal(first.hasMore, true);
    const second = await listFeed(db, m, { limit: 2, before: first.posts[1].createdAt });
    assert.equal(second.posts.length, 2);
    const seen = new Set([...first.posts, ...second.posts].map((p) => p.id));
    assert.equal(seen.size, 4, "no post repeats across pages");
  });
});

describe("who can write", () => {
  it("refuses signed-out visitors, guests and suspended members", async () => {
    const member = await mkUser();
    const { id } = await createPost(db, member, post("Anchor"));
    const guest = await mkUser({ tier: "guest" });
    const suspended = await mkUser({ status: "suspended" });

    assert.equal(await code(createPost(db, null, post("x"))), "unauthorized");
    for (const who of [guest, suspended]) {
      assert.equal(await code(createPost(db, who, post("x"))), "forbidden");
      assert.equal(await code(createComment(db, who, { postId: id, body: "x" })), "forbidden");
      assert.equal(await code(toggleReaction(db, who, id)), "forbidden");
      assert.equal(await code(reportContent(db, who, { postId: id, reason: "spam spam" })), "forbidden");
    }
  });

  it("validates posts", async () => {
    const m = await mkUser();
    assert.equal(await code(createPost(db, m, post("   "))), "invalid");
    assert.equal(await code(createPost(db, m, post("x".repeat(2001)))), "invalid");
    assert.equal(await code(createPost(db, m, post("hi", { city: "Atlantis" }))), "invalid");
    assert.equal(await code(createPost(db, m, post("hi", { cigarId: "not-a-cigar" }))), "invalid");
    assert.equal(await code(createPost(db, m, post("", { category: "smoke_session" }))), "invalid");
  });

  it("stores a Smoke Session with its rating, thirds and pairing", async () => {
    const m = await mkUser();
    const session = { rating: 4, thirds: ["Cedar", "Coffee", "Cocoa"], pairing: "Bourbon" };
    await createPost(db, m, post("", { category: "smoke_session", cigarId: "four-kicks", session }));
    const [p] = (await listFeed(db, m)).posts;
    assert.equal(p.sessionRating, 4);
    assert.deepEqual(p.sessionThirds, ["Cedar", "Coffee", "Cocoa"]);
    assert.equal(p.sessionPairing, "Bourbon");
    assert.equal(await code(createPost(db, m, post("", { category: "smoke_session", cigarId: "four-kicks", session: { ...session, rating: 6 } }))), "invalid");
    assert.equal(await code(createPost(db, m, post("", { category: "smoke_session", cigarId: "four-kicks", session: { ...session, pairing: "Motor oil" } }))), "invalid");
  });

  it("rate-limits posting", async () => {
    const m = await mkUser();
    for (let i = 0; i < 10; i++) await createPost(db, m, post(`p${i}`));
    assert.equal(await code(createPost(db, m, post("one too many"))), "rate_limited");
  });

  it("keeps members-only posts out of reach for comments and reactions by guests", async () => {
    const m = await mkUser();
    const { id } = await createPost(db, m, post("Private", { visibility: "members" }));
    const guest = await mkUser({ tier: "guest" });
    // A guest is refused before visibility is even checked, and nothing leaks either way.
    assert.equal(await code(createComment(db, guest, { postId: id, body: "hi" })), "forbidden");
    assert.equal((await listFeed(db, guest)).posts.length, 0);
  });

  it("toggles lights and counts them", async () => {
    const a = await mkUser();
    const b = await mkUser();
    const { id } = await createPost(db, a, post("Light me"));
    assert.deepEqual(await toggleReaction(db, a, id), { lit: true });
    assert.deepEqual(await toggleReaction(db, b, id), { lit: true });
    let [p] = (await listFeed(db, a)).posts;
    assert.equal(p.lights, 2);
    assert.equal(p.lit, true);
    assert.deepEqual(await toggleReaction(db, a, id), { lit: false });
    [p] = (await listFeed(db, a)).posts;
    assert.equal(p.lights, 1);
    assert.equal(p.lit, false);
    assert.equal(await code(toggleReaction(db, a, "not-a-uuid")), "invalid");
  });

  it("threads replies, hides moderated ones from members, and shows them to admins", async () => {
    const a = await mkUser();
    const b = await mkUser();
    const admin = await mkUser({ role: "admin" });
    const { id } = await createPost(db, a, post("Thread"));
    const c1 = await createComment(db, b, { postId: id, body: "First" });
    await createComment(db, a, { postId: id, body: "Second" });
    assert.equal(await code(createComment(db, b, { postId: id, body: "  " })), "invalid");

    await setContentHidden(db, admin, { kind: "comment", id: c1.id, hidden: true });
    assert.deepEqual((await listComments(db, b, [id])).map((c) => c.body), ["Second"]);
    assert.equal((await listComments(db, admin, [id])).length, 2);
    assert.equal((await listFeed(db, b)).posts[0].replyCount, 1);
  });
});

describe("deleting", () => {
  it("lets authors delete their own, blocks others, and lets admins delete anything", async () => {
    const a = await mkUser();
    const b = await mkUser();
    const admin = await mkUser({ role: "admin" });
    const p1 = await createPost(db, a, post("mine"));
    const p2 = await createPost(db, a, post("also mine"));
    assert.equal(await code(deletePost(db, b, p1.id)), "forbidden");
    assert.equal(await code(deletePost(db, null, p1.id)), "unauthorized");
    assert.equal(await code(deletePost(db, a, p1.id)), "ok");
    assert.equal(await code(deletePost(db, admin, p2.id)), "ok");
    assert.equal(await code(deletePost(db, admin, p2.id)), "not_found");
  });

  it("stops a suspended member from deleting their own content", async () => {
    const a = await mkUser();
    const { id } = await createPost(db, a, post("mine"));
    await db.update(schema.users).set({ status: "suspended" }).where(sql`id = ${a.id}`);
    assert.equal(await code(deletePost(db, { ...a, status: "suspended" }, id)), "forbidden");
  });

  it("applies the same rules to replies", async () => {
    const a = await mkUser();
    const b = await mkUser();
    const { id } = await createPost(db, a, post("host"));
    const c = await createComment(db, a, { postId: id, body: "mine" });
    assert.equal(await code(deleteComment(db, b, c.id)), "forbidden");
    assert.equal(await code(deleteComment(db, a, c.id)), "ok");
  });
});

describe("reports and moderation", () => {
  it("queues a report once per reporter, lists it for admins only, and clears it when content is hidden", async () => {
    const author = await mkUser();
    const reporter = await mkUser();
    const admin = await mkUser({ role: "admin" });
    const { id } = await createPost(db, author, post("Rude post"));

    await reportContent(db, reporter, { postId: id, reason: "This is rude" });
    await reportContent(db, reporter, { postId: id, reason: "Still rude" }); // duplicate, ignored
    assert.equal(await code(listOpenReports(db, reporter)), "forbidden");
    const queue = await listOpenReports(db, admin);
    assert.equal(queue.length, 1);
    assert.equal(queue[0].targetBody, "Rude post");

    assert.equal(await code(setContentHidden(db, reporter, { kind: "post", id, hidden: true })), "forbidden");
    await setContentHidden(db, admin, { kind: "post", id, hidden: true });
    assert.equal((await listOpenReports(db, admin)).length, 0);
  });

  it("lets admins dismiss a report without hiding anything", async () => {
    const author = await mkUser();
    const reporter = await mkUser();
    const admin = await mkUser({ role: "admin" });
    const { id } = await createPost(db, author, post("Fine post"));
    await reportContent(db, reporter, { postId: id, reason: "I disagree" });
    const [r] = await listOpenReports(db, admin);
    await resolveReport(db, admin, r.id);
    assert.equal((await listOpenReports(db, admin)).length, 0);
    assert.equal((await listFeed(db, author)).posts.length, 1);
  });

  it("will not take a report on something the reporter cannot see", async () => {
    const author = await mkUser();
    const { id } = await createPost(db, author, post("Hidden gem", { visibility: "members" }));
    const guest = await mkUser({ tier: "guest" });
    assert.equal(await code(reportContent(db, guest, { postId: id, reason: "nope nope" })), "forbidden");
  });
});

describe("running the club", () => {
  it("lets only admins manage tiers and suspensions", async () => {
    const admin = await mkUser({ role: "admin" });
    const member = await mkUser();
    const guest = await mkUser({ tier: "guest" });

    assert.equal(await code(listAccounts(db, member)), "forbidden");
    assert.equal(await code(setUserTier(db, member, guest.id, "member")), "forbidden");
    assert.equal(await code(setUserTier(db, admin, guest.id, "platinum")), "invalid");
    assert.equal(await code(setUserTier(db, admin, guest.id, "member")), "ok");
    assert.equal((await listAccounts(db, admin)).find((u) => u.id === guest.id)?.tier, "member");

    assert.equal(await code(setUserStatus(db, admin, admin.id, "suspended")), "invalid");
    assert.equal(await code(setUserStatus(db, admin, member.id, "suspended")), "ok");
    assert.equal((await listAccounts(db, admin)).find((u) => u.id === member.id)?.status, "suspended");
  });
});
