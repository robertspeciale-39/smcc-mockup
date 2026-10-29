# Phase 2 setup: Google sign-in and the Board database

This is the one-time setup that turns on real accounts and the real Board. Allow about 45 minutes the first time.
You will do four things: create a database, create Google sign-in credentials, give Vercel the settings, and run the
database setup once. Menu names in Google, Vercel and Neon change from time to time, so if a label is slightly
different, look for the closest match.

**What is live after this:** Google sign-in, the Board (posts, Smoke Sessions, replies, "Light it", categories, city
filter, members-only posts), reporting, and host tools for approving members and moderating.
**What is still sample data:** Meetups, Members directory, Cigar of the Month, Profile, Cigar Finder, prices, and the
podcast. Billing is not switched on, so a host approves each member by hand.

## How access works

| Who | What they can do |
| --- | --- |
| Not signed in | Read public Board posts |
| **Guest** (signed in with Google, not yet approved) | Same as above. This is where every new account starts |
| **Member** and **Founders Circle** | Post, reply, light posts, report, and read members-only posts |
| **Host** (admin) | Everything above, plus the Host tools page: approve members, hide or restore posts and replies, close reports, suspend accounts |
| **Suspended** | Cannot sign in |

Hosts are the email addresses you list in `ADMIN_EMAILS`. They become hosts (and Founders Circle members) the next time
they sign in.

---

## Part A: Create the database (Neon, through Vercel)

1. Go to vercel.com and open your `smcc-mockup` project.
2. Click the **Storage** tab, then **Create Database**.
3. Choose **Neon** (Postgres). Accept the free plan, pick the region closest to Las Vegas (a US West region), and click **Create** or **Continue**.
4. When asked which project to connect, pick `smcc-mockup` and select **Production** (and **Preview** if offered).
5. Vercel adds a setting named `DATABASE_URL` to your project automatically. You can confirm it under **Settings**, then **Environment Variables**.

If you would rather skip the Vercel integration, create a free project at neon.com, copy its **pooled** connection string,
and add it yourself in Part C as `DATABASE_URL`.

## Part B: Create the Google sign-in credentials

1. Go to console.cloud.google.com and sign in with the Google account that should own this (a club account is better than a personal one if you have one).
2. At the top, click the project picker, then **New project**. Name it `SMCC`, then **Create**, and make sure it is selected.
3. Open the menu (three lines, top left), then **APIs & Services**, then **OAuth consent screen**. This opens **Google Auth Platform**. Click **Get started**.
4. **App information:** App name `The Sunday Morning Cigar Club`, and your email as the support email. Click **Next**.
5. **Audience:** choose **External**. Click **Next**.
6. **Contact information:** your email. **Next**, accept the policy, **Create**.
7. In the left menu click **Clients**, then **Create client**.
   - **Application type:** Web application
   - **Name:** `SMCC website`
   - **Authorized redirect URIs:** click **Add URI** and add both of these (replace the first with your real address):
     - `https://YOUR-SITE-ADDRESS/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
   - Click **Create**.
8. A box shows your **Client ID** and **Client secret**. Copy both somewhere safe right now; the secret is not shown again. (If you lose it, open the client and add a new secret.)
9. In the left menu click **Audience**. Under **Publishing status** it will say **Testing**. Click **Publish app** and confirm. In Testing, only people you list as test users can sign in. The club only asks for name, email and photo, which Google does not require a review for.

> **Your site address matters.** The redirect address must match exactly, including `https` and no trailing slash.
> Vercel gives every deployment its own temporary address, and those will not work for sign-in unless you add them
> too. Sign-in is meant for your main address (the production domain, or the stable `your-project.vercel.app` one).

## Part C: Give Vercel the settings

In Vercel: your project, **Settings**, **Environment Variables**. Add each of these (choose **Production**, and
**Preview** too if you want sign-in there):

| Name | Value |
| --- | --- |
| `AUTH_SECRET` | A long random string. Generate one by running `npx auth secret` in a terminal, or `openssl rand -base64 32` |
| `AUTH_GOOGLE_ID` | The Client ID from Part B |
| `AUTH_GOOGLE_SECRET` | The Client secret from Part B |
| `ADMIN_EMAILS` | Your Google email, and any other hosts, separated by commas. For example `rob@gmail.com,friend@gmail.com` |
| `DATABASE_URL` | Already added in Part A |

Do **not** add `DEV_LOGIN`. It is a local shortcut and is ignored on Vercel anyway.

## Part D: Create the tables (run once)

This copies the Board's table layout into your new database. You run it from your own computer.

1. Install Node.js 20 or newer (nodejs.org) if you have not already.
2. Open a terminal in the project folder and run `npm install`.
3. Copy the file `.env.example` to a new file named `.env.local` (same folder).
4. In Vercel, **Settings**, **Environment Variables**, find `DATABASE_URL`, click the eye icon to reveal it, and copy it. Paste it into `.env.local` after `DATABASE_URL=`.
5. Run:
   ```
   npm run db:migrate
   ```
   You should see "migrations applied successfully". If it errors on the pooled address, use Neon's **direct** (not pooled) connection string for this one step. It is under **Connect** in the Neon dashboard.

Later, when new versions of the app add tables, you run `npm run db:migrate` again the same way.

## Part E: Deploy and sign in

1. Push the code to GitHub (as you do now). Vercel builds it automatically.
2. Open your site, click **Sign in**, then **Continue with Google**, and use the email you put in `ADMIN_EMAILS`.
3. Click your initials (top right). You should see **Host tools**. Open it.
4. Ask a friend to sign in. They appear in **Host tools** under Members, marked as waiting. Change their tier to **Member** (or **Founders Circle**) and click **Save**. They can post right away.

To add another host later, add their email to `ADMIN_EMAILS` in Vercel, redeploy, and have them sign in once.

---

## Working on it locally

You can try everything without Google by using a local database and the seeded sample people.

1. Install PostgreSQL on your computer (or use a free Neon database and a separate branch).
2. Create an empty database, for example `smcc_dev`.
3. In `.env.local` set:
   ```
   DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/smcc_dev
   AUTH_SECRET=any-long-random-string
   AUTH_GOOGLE_ID=unused
   AUTH_GOOGLE_SECRET=unused
   ADMIN_EMAILS=admin@smcc.test
   DEV_LOGIN=1
   ```
4. Run `npm run db:migrate`, then `npm run db:seed`, then `npm run dev`.
5. Open http://localhost:3000/signin. Under "Local development only" type one of these and click **Dev sign in**:
   `admin@smcc.test` (host), `marcus@smcc.test` (Founders Circle), `greg@smcc.test` (member), `guest@smcc.test` (waiting for approval), `suspended@smcc.test` (blocked).

The seed command refuses to run unless the database is on your own computer, so it cannot touch the live site.

### Tests

The permission rules (who can read, post, hide, delete) have automated tests that run against a real database.
Create a throwaway database whose name contains `test`, then:

```
TEST_DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/smcc_test npm test
```

On Windows PowerShell use `$env:TEST_DATABASE_URL="..."; npm test`. The tests empty that database each run, which is why
the name must contain `test`.

---

## Troubleshooting

| What you see | What it means |
| --- | --- |
| Google says `redirect_uri_mismatch` | The address in Part B step 7 does not exactly match the site you are on. Fix it in Google (changes can take a few minutes) |
| "Sign-in isn't set up correctly yet" | A setting from Part C is missing or misspelled in Vercel. Redeploy after fixing |
| "That Google account couldn't be signed in" | The account is suspended, or Google has not verified its email |
| Google says "Access blocked" or only some people can sign in | The consent screen is still in **Testing**. Publish it (Part B step 9) |
| Signed in but the Board shows an error | The tables do not exist yet. Run Part D against the same database Vercel uses |
| Signed in as yourself but no Host tools | Your email is not in `ADMIN_EMAILS`, or you have not signed out and back in since adding it |

## Keeping it safe

- `.env.local` holds secrets and is ignored by git (see `.gitignore`). Never paste secrets into code, chat, or GitHub.
- If a secret leaks, make a new one: new client secret in Google, a fresh `AUTH_SECRET` in Vercel (this signs everyone out), and a new database password in Neon.
- Posting is limited to 10 posts and 30 replies per person per hour.
