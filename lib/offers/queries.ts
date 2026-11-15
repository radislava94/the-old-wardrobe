import { desc, eq, or } from "drizzle-orm";
import { getDb } from "../db/client";
import { listings, offers, profiles } from "../db/schema";

export async function saversOf(listingId: string) {
  const { favourites } = await import("../db/schema");
  return getDb()
    .select({
      userId: profiles.id,
      name: profiles.name,
    })
    .from(favourites)
    .innerJoin(profiles, eq(profiles.id, favourites.userId))
    .where(eq(favourites.listingId, listingId));
}

export async function offersForProfile(profileId: string) {
  return getDb()
    .select({
      id: offers.id,
      amount: offers.amount,
      currency: offers.currency,
      kind: offers.kind,
      status: offers.status,
      note: offers.note,
      createdAt: offers.createdAt,
      title: listings.title,
      slug: listings.slug,
      country: listings.country,
      direction: offers.fromUserId,
      toUserId: offers.toUserId,
    })
    .from(offers)
    .innerJoin(listings, eq(listings.id, offers.listingId))
    .where(or(eq(offers.fromUserId, profileId), eq(offers.toUserId, profileId)))
    .orderBy(desc(offers.createdAt));
}
