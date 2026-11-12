import { sql } from "drizzle-orm";
import { databaseEnabled } from "../db/runtime";
import { getDb } from "../db/client";

/**
 * Public catalogue reads use Postgres when it can answer.
 * If the database cannot be reached, or `listings`, `profiles`, or
 * `reviews` is missing, or a catalogue query names a column that is
 * not there, those reads serve the in-memory placeholder catalog
 * instead of failing the page. A database that only lacks the columns
 * from `drizzle/0003_publish.sql` does not land here: listing reads
 * omit those columns and keep the existing rows.
 *
 * Account, session, and sell paths do not use this helper. They keep
 * talking to Postgres and surface the failure.
 *
 * `databaseEnabled()` is called outside the probe's try/catch.
 * `cookies()` inside it is how Next opts a page out of static
 * generation. That error must propagate.
 */

const CACHE_MS = 10_000;

const MISSING_TABLE_CODES = new Set([
  "42P01", // undefined_table
  "3F000", // invalid_schema_name
]);

const MISSING_COLUMN_CODES = new Set([
  "42703", // undefined_column
]);

const UNREACHABLE_CODES = new Set([
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "EPIPE",
  "ECONNABORTED",
  "CONNECT_TIMEOUT",
  "CONNECTION_CLOSED",
  "CONNECTION_ENDED",
  "CONNECTION_DESTROYED",
  "08000",
  "08001",
  "08003",
  "08004",
  "08006",
  "08007",
  "57P01",
  "57P02",
  "57P03",
  "53300",
  "3D000",
  "28P01",
  "28000",
]);

type ErrorRecord = {
  code?: unknown;
  errno?: unknown;
  message?: unknown;
  cause?: unknown;
  errors?: unknown;
};

let cached: { mode: "postgres" | "memory"; at: number } | null = null;

export function resetCatalogueFallbackForTests(): void {
  cached = null;
}

export function catalogueUnavailable(error: unknown): boolean {
  return failureKind(error) !== null;
}

export async function readPublicCatalogue<T>(
  read: () => Promise<T>,
  fallback: () => Promise<T>,
): Promise<T> {
  if (!(await databaseEnabled())) return fallback();
  if ((await catalogueMode()) === "memory") return fallback();
  try {
    return await read();
  } catch (error) {
    if (!catalogueUnavailable(error)) throw error;
    remember("memory");
    report(error);
    return fallback();
  }
}

async function catalogueMode(): Promise<"postgres" | "memory"> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached.mode;
  try {
    await assertCatalogueTables();
    remember("postgres");
    return "postgres";
  } catch (error) {
    if (!catalogueUnavailable(error)) throw error;
    remember("memory");
    report(error);
    return "memory";
  }
}

/**
 * Succeeds when all three relations exist, including when they are empty.
 * A missing relation fails here with `42P01`, the same error the shop saw
 * when migrations had not been applied. `where false` does not read rows.
 */
async function assertCatalogueTables(): Promise<void> {
  await getDb().execute(sql`
    select
      (select 1 from listings where false) as listings,
      (select 1 from profiles where false) as profiles,
      (select 1 from reviews where false) as reviews
  `);
}

function remember(mode: "postgres" | "memory"): void {
  cached = { mode, at: Date.now() };
}

function report(error: unknown): void {
  const kind = failureKind(error);
  const code = kind?.code ? ` (${kind.code})` : "";
  const reason =
    kind?.kind === "missing-table"
      ? "missing catalogue table"
      : kind?.kind === "missing-column"
        ? "missing catalogue column"
        : "unreachable database";
  console.error(`Catalogue database is unavailable${code}: ${reason}. Serving the placeholder catalogue.`);
}

export function isUndefinedColumn(error: unknown): boolean {
  return failureKind(error)?.kind === "missing-column";
}

function failureKind(
  error: unknown,
): { kind: "missing-table" | "missing-column" | "unreachable"; code: string } | null {
  const seen = new Set<unknown>();
  const pending = [error];
  while (pending.length > 0) {
    const current = pending.pop();
    if (typeof current === "string") {
      const fromMessage = messageKind(current);
      if (fromMessage) return { kind: fromMessage, code: "" };
      continue;
    }
    if (current == null || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    const record = current as ErrorRecord;
    for (const value of [record.code, record.errno]) {
      if (typeof value !== "string" || !value) continue;
      if (MISSING_TABLE_CODES.has(value)) return { kind: "missing-table", code: value };
      if (MISSING_COLUMN_CODES.has(value)) return { kind: "missing-column", code: value };
      if (UNREACHABLE_CODES.has(value)) return { kind: "unreachable", code: value };
    }
    if (typeof record.message === "string") {
      const fromMessage = messageKind(record.message);
      if (fromMessage) {
        return { kind: fromMessage, code: typeof record.code === "string" ? record.code : "" };
      }
    }
    if ("cause" in record) pending.push(record.cause);
    if (Array.isArray(record.errors)) pending.push(...record.errors);
  }
  return null;
}

function messageKind(message: string): "missing-table" | "missing-column" | "unreachable" | null {
  if (/column ["'][\w.]+["'] does not exist/i.test(message)) return "missing-column";
  if (/relation ["'][\w.]+["'] does not exist/i.test(message)) return "missing-table";
  if (/schema ["'][\w.]+["'] does not exist/i.test(message)) return "missing-table";
  if (
    /database ["'][^"']+["'] does not exist/i.test(message) ||
    /\b(ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|CONNECT_TIMEOUT|CONNECTION_CLOSED|CONNECTION_DESTROYED)\b/.test(
      message,
    ) ||
    /password authentication failed/i.test(message) ||
    /the database system is (starting up|shutting down)/i.test(message) ||
    /could not connect to server/i.test(message)
  ) {
    return "unreachable";
  }
  return null;
}
