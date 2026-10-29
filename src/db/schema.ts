import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import {
  CATEGORIES,
  CONTENT_STATUSES,
  REPORT_STATUSES,
  ROLES,
  TIERS,
  USER_STATUSES,
  VISIBILITIES,
} from "./enums";

export const tierEnum = pgEnum("user_tier", TIERS);
export const roleEnum = pgEnum("user_role", ROLES);
export const userStatusEnum = pgEnum("user_status", USER_STATUSES);
export const categoryEnum = pgEnum("post_category", CATEGORIES);
export const visibilityEnum = pgEnum("post_visibility", VISIBILITIES);
export const contentStatusEnum = pgEnum("content_status", CONTENT_STATUSES);
export const reportStatusEnum = pgEnum("report_status", REPORT_STATUSES);

// ---------------------------------------------------------------------------
// Auth.js tables (users + accounts). Sessions are signed cookies, so there is no sessions table.
// The extra columns on users (tier, role, status, city) are the club's own.
// ---------------------------------------------------------------------------
export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date", withTimezone: true }),
  image: text("image"),
  tier: tierEnum("tier").notNull().default("guest"),
  role: roleEnum("role").notNull().default("user"),
  status: userStatusEnum("status").notNull().default("active"),
  city: text("city").notNull().default("Las Vegas"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

// ---------------------------------------------------------------------------
// The Board
// ---------------------------------------------------------------------------
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    category: categoryEnum("category").notNull().default("general"),
    city: text("city").notNull(),
    visibility: visibilityEnum("visibility").notNull().default("public"),
    status: contentStatusEnum("status").notNull().default("published"),
    // A tagged cigar from the club catalog. Phase 2 will point this at a catalog table.
    cigarId: text("cigar_id"),
    // Smoke Session fields. All null on ordinary posts.
    sessionRating: smallint("session_rating"),
    sessionThirds: jsonb("session_thirds").$type<[string, string, string]>(),
    sessionPairing: text("session_pairing"),
    hiddenBy: text("hidden_by").references(() => users.id, { onDelete: "set null" }),
    hiddenAt: timestamp("hidden_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("posts_feed_idx").on(t.status, t.visibility, t.createdAt.desc()),
    index("posts_author_idx").on(t.authorId, t.createdAt.desc()),
    check("posts_rating_range", sql`${t.sessionRating} is null or (${t.sessionRating} between 1 and 5)`),
  ],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    status: contentStatusEnum("status").notNull().default("published"),
    hiddenBy: text("hidden_by").references(() => users.id, { onDelete: "set null" }),
    hiddenAt: timestamp("hidden_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("comments_post_idx").on(t.postId, t.createdAt)],
);

// "Light it": one lightweight reaction per member per post.
export const reactions = pgTable(
  "reactions",
  {
    postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
);

// Member reports feed the admin moderation queue.
export const reports = pgTable(
  "reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    reporterId: text("reporter_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
    commentId: uuid("comment_id").references(() => comments.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    status: reportStatusEnum("status").notNull().default("open"),
    resolvedBy: text("resolved_by").references(() => users.id, { onDelete: "set null" }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reports_queue_idx").on(t.status, t.createdAt.desc()),
    check("reports_one_target", sql`(${t.postId} is null) <> (${t.commentId} is null)`),
  ],
);
