import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, sql } from "drizzle-orm";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { getDb } from "@/db";
import { accounts, users } from "@/db/schema";

declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

// Local development only: lets you sign in as a seeded person without Google.
// It can never switch on in a production build, even if DEV_LOGIN is set by mistake.
export const devLoginEnabled = process.env.NODE_ENV !== "production" && process.env.DEV_LOGIN === "1";

const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

// The config is built per request so nothing touches the database at import time (builds work without one).
export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const db = getDb();

  return {
    adapter: DrizzleAdapter(db, { usersTable: users, accountsTable: accounts }),
    // The session is a signed cookie holding only the user id. Role, tier and status are
    // read fresh from the database on each request (see lib/dal.ts), so a suspension or
    // promotion takes effect immediately instead of when a cookie expires.
    session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 },
    pages: { signIn: "/signin", error: "/signin" },
    providers: [
      Google, // reads AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET
      ...(devLoginEnabled
        ? [
            Credentials({
              id: "dev",
              name: "Dev login",
              credentials: { email: {} },
              async authorize(creds) {
                const email = String(creds?.email ?? "").trim().toLowerCase();
                const [u] = await db.select().from(users).where(eq(users.email, email)).limit(1);
                return u ? { id: u.id, email: u.email, name: u.name } : null;
              },
            }),
          ]
        : []),
    ],
    callbacks: {
      async signIn({ account, profile, user }) {
        // Only accept Google accounts whose email Google has verified.
        if (account?.provider === "google" && profile?.email_verified !== true) return false;
        if (user.email) {
          const [u] = await db
            .select({ status: users.status })
            .from(users)
            .where(eq(users.email, user.email.toLowerCase()))
            .limit(1);
          if (u?.status === "suspended") return false;
        }
        return true;
      },
      jwt({ token, user }) {
        if (user?.id) token.sub = user.id;
        return token;
      },
      session({ session, token }) {
        if (token.sub) session.user.id = token.sub;
        return session;
      },
    },
    events: {
      // Anyone listed in ADMIN_EMAILS becomes an admin and Founders Circle member on sign-in.
      // This is how the first host gets in; after that, admins approve everyone else.
      async signIn({ user }) {
        const email = user.email?.toLowerCase();
        if (!user.id || !email || !adminEmails().includes(email)) return;
        await db
          .update(users)
          .set({ role: "admin", tier: "founder", emailVerified: sql`coalesce(${users.emailVerified}, now())` })
          .where(eq(users.id, user.id));
      },
    },
  };
});
