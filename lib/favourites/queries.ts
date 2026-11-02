import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { favourites, listings } from "../db/schema";

export async function isFavourite(userId: string, listingId: string): Promise<boolean> {
  const rows = await getDb()
    .select({ id: favourites.id })
    .from(favourites)
    .where(and(eq(favourites.userId, userId), eq(favourites.listingId, listingId)));
  return Boolean(rows[0]);
}

export async function savedListings(userId: string) {
  return getDb()
    .select({
      id: favourites.id,
      listingId: listings.id,
      title: listings.title,
      slug: listings.slug,
      country: listings.country,
      priceAmount: listings.priceAmount,
      currency: listings.currency,
      createdAt: favourites.createdAt,
    })
    .from(favourites)
    .innerJoin(listings, eq(listings.id, favourites.listingId))
    .where(eq(favourites.userId, userId))
    .orderBy(desc(favourites.createdAt));
}
