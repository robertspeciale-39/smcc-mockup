import { defineConfig } from "drizzle-kit";

try {
  process.loadEnvFile(".env.local"); // so `npm run db:migrate` sees DATABASE_URL without extra steps
} catch {
  /* no .env.local, rely on the shell environment */
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
