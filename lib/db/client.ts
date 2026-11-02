import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type Database = PostgresJsDatabase<typeof schema>;

let client: ReturnType<typeof postgres> | undefined;
let database: Database | undefined;

/**
 * Connect on first use. Importing this module does not open a socket,
 * so `next build` can load the data layer when DATABASE_URL is unset.
 *
 * `prepare: false` keeps the driver compatible with Neon's pooled
 * connection string (PgBouncer transaction mode) and with local Postgres.
 */
export function getDb(): Database {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. For local Postgres, start docker compose and copy .env.example to .env.local.",
    );
  }
  if (!database || !client) {
    client = postgres(url, {
      prepare: false,
      max: 3,
      idle_timeout: 10,
      connect_timeout: 5,
    });
    database = drizzle(client, { schema });
  }
  return database;
}

export async function closeDb(): Promise<void> {
  const current = client;
  client = undefined;
  database = undefined;
  if (current) await current.end({ timeout: 5 });
}
