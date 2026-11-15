import { eq } from "drizzle-orm";
import { getDb } from "../db/client";
import { bundleItems, bundles, listings, profiles } from "../db/schema";
import { toListing } from "../db/map";

export async function bundlesForBuyer(buyerId: string) {
  const db = getDb();
  const groups = await db
    .select({
      id: bundles.id,
      sellerId: bundles.sellerId,
      sellerName: profiles.name,
    })
    .from(bundles)
    .innerJoin(profiles, eq(profiles.id, bundles.sellerId))
    .where(eq(bundles.buyerId, buyerId));

  const result = [];
  for (const group of groups) {
    const rows = await db
      .select({ listing: listings })
      .from(bundleItems)
      .innerJoin(listings, eq(listings.id, bundleItems.listingId))
      .where(eq(bundleItems.bundleId, group.id));
    result.push({
      ...group,
      items: rows.map((row) => toListing(row.listing)),
    });
  }
  return result;
}
