"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../auth/session";
import { profileForAuthUser } from "../auth/profile";
import { getDb } from "../db/client";
import { favourites, listings, profiles, user } from "../db/schema";
import { sendEmail } from "../mail";
import { listingPath, signInPath } from "../paths";
import type { CountryCode } from "../countries";
import { isCountry } from "../countries";
import { absoluteUrl } from "../seo";
import { savedListingMail } from "../mail-copy";

export async function toggleFavourite(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const slug = String(formData.get("slug") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const back = listingPath(country, slug);
  const session = await getSession();
  if (!session) redirect(`${signInPath(country)}?next=${encodeURIComponent(back)}`);
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));

  const db = getDb();
  const existing = await db
    .select({ id: favourites.id })
    .from(favourites)
    .where(and(eq(favourites.userId, profile.id), eq(favourites.listingId, listingId)));

  if (existing[0]) {
    await db.delete(favourites).where(eq(favourites.id, existing[0].id));
  } else {
    await db.insert(favourites).values({
      id: `fav_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
      userId: profile.id,
      listingId,
      createdAt: new Date().toISOString().slice(0, 10),
    });
    await tellSeller(listingId, profile.name);
  }
  revalidatePath(back);
  revalidatePath(`/${country}/account`);
}

async function tellSeller(listingId: string, buyerName: string) {
  const db = getDb();
  const rows = await db
    .select({
      title: listings.title,
      slug: listings.slug,
      country: listings.country,
      sellerId: listings.sellerId,
    })
    .from(listings)
    .where(eq(listings.id, listingId));
  const listing = rows[0];
  if (!listing) return;
  const sellers = await db
    .select({ authUserId: profiles.authUserId, id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, listing.sellerId));
  const seller = sellers[0];
  if (!seller) return;
  const authId = seller.authUserId ?? seller.id;
  const emails = await db.select({ email: user.email }).from(user).where(eq(user.id, authId));
  const email = emails[0]?.email;
  if (!email) return;
  const path = listingPath(listing.country as CountryCode, listing.slug);
  const mail = savedListingMail(listing.country, buyerName, listing.title, absoluteUrl(path));
  await sendEmail({ to: email, subject: mail.subject, text: mail.text });
}
