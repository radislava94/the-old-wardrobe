/**
 * True when a request should read Postgres.
 * With no DATABASE_URL the catalog stays in memory, including during
 * `next build`. With a URL, `cookies()` opts the page into request-time
 * rendering so the build does not open a database connection.
 * Do not catch the error from `cookies()`: Next uses it to bail out of
 * static generation.
 */
export async function databaseEnabled(): Promise<boolean> {
  if (!process.env.DATABASE_URL?.trim()) return false;
  const { cookies } = await import("next/headers");
  await cookies();
  return true;
}
