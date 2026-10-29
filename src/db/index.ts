import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Db = PostgresJsDatabase<typeof schema>;

// The connection is created on first use, not at import time, so `next build` works
// without a database and the pooled client is reused across requests in one server instance.
const globalForDb = globalThis as unknown as { smccDb?: Db };

export function getDb(): Db {
  if (globalForDb.smccDb) return globalForDb.smccDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. See SETUP.md.");
  // prepare:false keeps this compatible with pooled connection strings (Neon, PgBouncer).
  // max:1 suits serverless; each function instance holds a single connection.
  const client = postgres(url, { max: 1, prepare: false, idle_timeout: 20 });
  globalForDb.smccDb = drizzle(client, { schema });
  return globalForDb.smccDb;
}

export { schema };
