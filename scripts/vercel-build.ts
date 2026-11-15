import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import postgres from "postgres";

/**
 * Production Vercel builds are the only place this runs migrations.
 * Preview and development also receive DATABASE_URL, and that URL is the
 * production database, so the mere presence of a URL must not be enough.
 */
export function shouldMigrate(env: Record<string, string | undefined>): boolean {
  return env.VERCEL_ENV === "production" && Boolean(env.DATABASE_URL?.trim());
}

function redact(text: string): string {
  return text
    .replace(/postgres(?:ql)?:\/\/\S+/gi, "postgres://[redacted]")
    .replace(/([?&]password=)[^&\s'")]+/gi, "$1[redacted]");
}

function run(command: string, args: string[]): number {
  const child = spawnSync(command, args, {
    encoding: "utf8",
    env: process.env,
    shell: false,
  });
  if (child.stdout) process.stdout.write(redact(child.stdout));
  if (child.stderr) process.stderr.write(redact(child.stderr));
  if (child.error) {
    console.error(redact(child.error.message));
    return 1;
  }
  return child.status ?? 1;
}

async function visibilityColumnPresent(): Promise<boolean> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return false;
  const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 10 });
  try {
    const rows = await sql<{ present: boolean }[]>`
      select exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'listings'
          and column_name = 'visibility'
      ) as present
    `;
    return rows[0]?.present === true;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function main(): Promise<void> {
  if (shouldMigrate(process.env)) {
    console.log("production migrate: applying pending migrations with npm run db:migrate");
    const status = run("npm", ["run", "db:migrate"]);
    if (status !== 0) {
      console.error("production migrate: failed. Not starting next build.");
      process.exit(status);
    }
    let present = false;
    try {
      present = await visibilityColumnPresent();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(redact(message));
      console.error("production migrate: visibility check failed. Not starting next build.");
      process.exit(1);
    }
    if (!present) {
      console.error("production migrate: listings.visibility is missing after migrate. Not starting next build.");
      process.exit(1);
    }
    console.log("production migrate: listings.visibility is present.");
  } else if (process.env.VERCEL_ENV === "production") {
    console.log("production migrate: skipped because DATABASE_URL is not set.");
  } else {
    console.log(
      `production migrate: skipped because VERCEL_ENV is ${process.env.VERCEL_ENV ?? "unset"}.`,
    );
  }

  const buildStatus = run("npx", ["--no-install", "next", "build"]);
  process.exit(buildStatus);
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(redact(message));
    console.error("production migrate: failed. Not starting next build.");
    process.exit(1);
  });
}
