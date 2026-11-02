import { migrate } from "drizzle-orm/postgres-js/migrator";
import { closeDb, getDb } from "../lib/db/client";
import "./load-env";

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and start Postgres with docker compose up -d.",
    );
    process.exit(1);
  }
  await migrate(getDb(), { migrationsFolder: "./drizzle" });
  console.log("Migrations applied.");
  await closeDb();
}

main().catch(async (error: unknown) => {
  console.error(error);
  await closeDb();
  process.exit(1);
});
