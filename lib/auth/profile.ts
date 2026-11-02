import { and, eq } from "drizzle-orm";
import { isCountry, type CountryCode } from "../countries";
import { getDb } from "../db/client";
import { profiles } from "../db/schema";
import { slugifyName } from "./handle";

export function countryFromCookie(value: string | undefined, fallback: CountryCode): CountryCode {
  if (value && isCountry(value)) return value;
  return fallback;
}

async function uniqueHandle(country: CountryCode, base: string, exceptId?: string): Promise<string> {
  const db = getDb();
  let handle = base;
  for (let n = 2; n < 50; n += 1) {
    const rows = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(and(eq(profiles.country, country), eq(profiles.handle, handle)));
    const taken = rows.some((row) => row.id !== exceptId);
    if (!taken) return handle;
    handle = `${base}-${n}`.slice(0, 40);
  }
  return `${base}-${exceptId ?? "new"}`.slice(0, 40);
}

/**
 * One profile per login. The same account buys and sells.
 * Seeded wardrobe people have no auth user id and are left alone.
 */
export async function ensureProfile(
  person: { id: string; name: string; email: string },
  country: CountryCode,
) {
  const db = getDb();
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.authUserId, person.id));
  const found = existing[0];
  if (found) return found;

  const handle = await uniqueHandle(country, slugifyName(person.name || person.email));
  await db
    .insert(profiles)
    .values({
      id: person.id,
      authUserId: person.id,
      handle,
      name: person.name || person.email,
      city: "",
      country,
      memberSince: new Date().toISOString().slice(0, 10),
      bio: "",
    })
    .onConflictDoNothing();

  const created = await db.select().from(profiles).where(eq(profiles.id, person.id));
  const row = created[0];
  if (!row) throw new Error("Could not create a profile for this account.");
  return row;
}

export async function profileForAuthUser(userId: string) {
  const rows = await getDb().select().from(profiles).where(eq(profiles.authUserId, userId));
  return rows[0] ?? null;
}

export async function deleteMarketplaceData(userId: string) {
  const db = getDb();
  const profile = await profileForAuthUser(userId);
  if (!profile) return;
  const { favourites, listings, reviews } = await import("../db/schema");
  const { or, inArray } = await import("drizzle-orm");
  const owned = await db
    .select({ id: listings.id })
    .from(listings)
    .where(eq(listings.sellerId, profile.id));
  const listingIds = owned.map((row) => row.id);
  await db
    .delete(favourites)
    .where(
      listingIds.length
        ? or(eq(favourites.userId, profile.id), inArray(favourites.listingId, listingIds))
        : eq(favourites.userId, profile.id),
    );
  await db
    .delete(reviews)
    .where(
      listingIds.length
        ? or(
            eq(reviews.sellerId, profile.id),
            eq(reviews.buyerId, profile.id),
            inArray(reviews.listingId, listingIds),
          )
        : or(eq(reviews.sellerId, profile.id), eq(reviews.buyerId, profile.id)),
    );
  await db.delete(listings).where(eq(listings.sellerId, profile.id));
  await db.delete(profiles).where(eq(profiles.id, profile.id));
}

export { uniqueHandle };
