"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCountry, type CountryCode } from "../countries";
import { getDb } from "../db/client";
import { bundleItems, bundles, listings } from "../db/schema";
import { profileForAuthUser } from "../auth/profile";
import { getSession } from "../auth/session";
import { listingPath, signInPath } from "../paths";

export async function addToBundle(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const slug = String(formData.get("slug") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const path = listingPath(country, slug);
  const session = await getSession();
  if (!session) redirect(`${signInPath(country)}?next=${encodeURIComponent(path)}`);
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));

  const db = getDb();
  const rows = await db.select().from(listings).where(eq(listings.id, listingId));
  const listing = rows[0];
  if (!listing || listing.status === "sold" || listing.sellerId === profile.id) {
    redirect(`${path}?bundle=fields`);
  }

  const existing = await db
    .select({ id: bundles.id })
    .from(bundles)
    .where(and(eq(bundles.buyerId, profile.id), eq(bundles.sellerId, listing.sellerId)));
  let bundleId = existing[0]?.id;
  if (!bundleId) {
    bundleId = `bnd_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
    await db.insert(bundles).values({
      id: bundleId,
      buyerId: profile.id,
      sellerId: listing.sellerId,
      createdAt: new Date().toISOString().slice(0, 10),
    });
  }
  await db
    .insert(bundleItems)
    .values({ bundleId, listingId })
    .onConflictDoNothing();
  revalidatePath(path);
  revalidatePath(`/${country}/account`);
  redirect(`${path}?bundle=added`);
}

export async function removeFromBundle(formData: FormData) {
  const bundleId = String(formData.get("bundleId") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const session = await getSession();
  if (!session) redirect(signInPath(country));
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));
  const db = getDb();
  const owned = await db
    .select({ id: bundles.id })
    .from(bundles)
    .where(and(eq(bundles.id, bundleId), eq(bundles.buyerId, profile.id)));
  if (owned[0]) {
    await db
      .delete(bundleItems)
      .where(and(eq(bundleItems.bundleId, bundleId), eq(bundleItems.listingId, listingId)));
  }
  revalidatePath(`/${country}/account`);
}
