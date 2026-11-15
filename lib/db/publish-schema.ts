import { sql } from "drizzle-orm";
import { getDb } from "./client";

/**
 * `drizzle/0003_publish.sql` adds `listings.visibility`,
 * `listings.photos_compliant`, and `listing_photos`. Production can
 * be serving the earlier catalogue before that migration is applied.
 * Public reads detect the gap and keep using the existing columns.
 * Publishing still needs the migration: `npm run db:migrate`.
 */
export type PublishSchema = {
  visibility: boolean;
  photosCompliant: boolean;
  listingPhotos: boolean;
};

export const PUBLISH_SCHEMA_READY: PublishSchema = {
  visibility: true,
  photosCompliant: true,
  listingPhotos: true,
};

export const PUBLISH_SCHEMA_LEGACY: PublishSchema = {
  visibility: false,
  photosCompliant: false,
  listingPhotos: false,
};

const CACHE_MS = 10_000;

let cached: { schema: PublishSchema; at: number } | null = null;
let warned = false;

export function resetPublishSchemaForTests(): void {
  cached = null;
  warned = false;
}

export function cachePublishSchema(schema: PublishSchema): void {
  cached = { schema, at: Date.now() };
}

export function clearPublishSchemaCache(): void {
  cached = null;
}

/** True when this select would name a column or table from 0003. */
export function selectsPublishColumns(schema: PublishSchema): boolean {
  return schema.visibility || schema.photosCompliant;
}

export function parsePublishSchema(row: unknown): PublishSchema | null {
  if (!row || typeof row !== "object") return null;
  const record = row as Record<string, unknown>;
  const visibility = booleanOf(record.visibility);
  const photosCompliant = booleanOf(record.photos_compliant);
  const listingPhotos = booleanOf(record.listing_photos);
  if (visibility === null || photosCompliant === null || listingPhotos === null) return null;
  return { visibility, photosCompliant, listingPhotos };
}

export async function readPublishSchema(): Promise<PublishSchema> {
  const now = Date.now();
  if (cached && now - cached.at < CACHE_MS) return cached.schema;
  const result = await getDb().execute(sql`
    select
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'listings'
          and column_name = 'visibility'
      ) as visibility,
      exists (
        select 1 from information_schema.columns
        where table_schema = 'public'
          and table_name = 'listings'
          and column_name = 'photos_compliant'
      ) as photos_compliant,
      exists (
        select 1 from information_schema.tables
        where table_schema = 'public'
          and table_name = 'listing_photos'
      ) as listing_photos
  `);
  const schema = parsePublishSchema(firstRow(result));
  // An unrecognised probe result is treated as the migrated schema for
  // this call only. The following select still retries without the new
  // columns if Postgres reports one is missing.
  if (!schema) return PUBLISH_SCHEMA_READY;
  cachePublishSchema(schema);
  if (!schema.visibility || !schema.photosCompliant || !schema.listingPhotos) warnMissing(schema);
  return schema;
}

function firstRow(result: unknown): unknown {
  if (Array.isArray(result)) return result[0];
  if (result && typeof result === "object" && "rows" in result) {
    const rows = (result as { rows?: unknown }).rows;
    if (Array.isArray(rows)) return rows[0];
  }
  return null;
}

function booleanOf(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (value === "t" || value === "true" || value === "1") return true;
  if (value === "f" || value === "false" || value === "0") return false;
  return null;
}

function warnMissing(schema: PublishSchema): void {
  if (warned) return;
  warned = true;
  const missing = [
    schema.visibility ? null : "listings.visibility",
    schema.photosCompliant ? null : "listings.photos_compliant",
    schema.listingPhotos ? null : "listing_photos",
  ].filter((item): item is string => item !== null);
  console.warn(
    `Publish migration is not applied (missing ${missing.join(", ")}). Public pages keep the existing listings. Run npm run db:migrate against the production database before publishing.`,
  );
}
