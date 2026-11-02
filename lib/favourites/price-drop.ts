import { eq } from "drizzle-orm";
import type { CountryCode } from "../countries";
import { getDb } from "../db/client";
import { favourites, profiles, user } from "../db/schema";
import { formatMoney } from "../money";
import { sendEmail } from "../mail";
import { listingPath } from "../paths";
import { absoluteUrl } from "../seo";
import type { Listing } from "../types";

/**
 * Email people who saved this piece when the seller lowers the price
 * in the same currency. Missing mail keys skip the send.
 */
export async function notifyPriceDrop(listing: Listing, previousAmount: number, sellerEmail: string) {
  if (listing.priceAmount >= previousAmount) return;
  const rows = await getDb()
    .select({ email: user.email })
    .from(favourites)
    .innerJoin(profiles, eq(profiles.id, favourites.userId))
    .innerJoin(user, eq(user.id, profiles.authUserId))
    .where(eq(favourites.listingId, listing.id));

  const next = formatMoney(listing.priceAmount, listing.country);
  const previous = formatMoney(previousAmount, listing.country);
  const url = absoluteUrl(listingPath(listing.country as CountryCode, listing.slug));
  const seen = new Set<string>();
  for (const row of rows) {
    const email = row.email?.trim();
    if (!email || email === sellerEmail || seen.has(email)) continue;
    seen.add(email);
    await sendEmail({
      to: email,
      subject: `Price: ${listing.title}`,
      text: `The price of “${listing.title}” is now ${next}. It was ${previous}.\n${url}\n`,
    });
  }
}
