"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getSession } from "../auth/session";
import { ensureProfile, uniqueHandle } from "../auth/profile";
import { slugifyName } from "../auth/handle";
import { countries, isCountry, type CountryCode } from "../countries";
import { listingsRepo } from "../data";
import { getDb } from "../db/client";
import { profiles } from "../db/schema";
import { categoryKeys } from "../categories";
import { listingPath, sellPath, signInPath } from "../paths";
import type { CategoryKey, ListingDraft } from "../types";
import { notifyPriceDrop } from "../favourites/price-drop";
import { storeListingPhoto } from "./photos";

function fail(country: CountryCode, id: string | null, code: string): never {
  const path = id ? `${sellPath(country)}/${id}` : sellPath(country);
  redirect(`${path}?error=${code}`);
}

export async function saveListing(formData: FormData) {
  const session = await getSession();
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  if (!session) redirect(`${signInPath(country)}?next=${encodeURIComponent(sellPath(country))}`);

  const id = String(formData.get("id") ?? "").trim() || null;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("story") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const size = String(formData.get("size") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const brand = String(formData.get("brand") ?? "").trim();
  const condition = String(formData.get("condition") ?? "").trim();
  const price = Number(formData.get("price"));
  const sellerKind = formData.get("sellerKind") === "business" ? "business" : "private";
  const freeShipping = formData.get("freeShipping") === "on";
  const overRaw = String(formData.get("freeShippingOver") ?? "").trim();
  const freeShippingOver = overRaw ? Number(overRaw) : null;

  if (!isCountry(countryRaw)) fail(country, id, "fields");
  if (!categoryKeys.includes(category as CategoryKey)) fail(country, id, "fields");
  if (title.length < 1 || title.length > 80) fail(country, id, "fields");
  if (description.length < 1 || description.length > 600) fail(country, id, "fields");
  if (size.length < 1 || size.length > 12) fail(country, id, "fields");
  if (brand.length > 40 || condition.length < 1 || condition.length > 80) fail(country, id, "fields");
  if (!Number.isInteger(price) || price < 1) fail(country, id, "fields");
  if (
    freeShippingOver !== null &&
    (!Number.isInteger(freeShippingOver) || freeShippingOver < 1)
  ) {
    fail(country, id, "fields");
  }
  const allowedCities = countries[country].cities as readonly string[];
  if (!allowedCities.includes(city)) fail(country, id, "fields");

  const profile = await ensureProfile(session.user, country);
  let handle = profile.handle;
  if (profile.country !== country) {
    handle = await uniqueHandle(country, slugifyName(profile.name), profile.id);
  }
  await getDb()
    .update(profiles)
    .set({ country, city: profile.city || city, sellerKind, handle })
    .where(eq(profiles.id, profile.id));

  let photoUrl = String(formData.get("existingPhoto") ?? "").trim() || null;
  const file = formData.get("photo");
  if (file instanceof File && file.size > 0) {
    try {
      photoUrl = await storeListingPhoto(file);
    } catch (error) {
      const code = error instanceof Error ? error.message : "photo";
      fail(country, id, code === "photo-type" || code === "photo-size" ? code : "photo");
    }
  }
  if (!photoUrl) fail(country, id, "photo");

  const draft: ListingDraft = {
    country,
    title,
    description,
    category: category as CategoryKey,
    priceAmount: price,
    currency: countries[country].currency,
    size,
    condition,
    city,
    brand,
    photoUrl,
    freeShipping,
    freeShippingOver,
  };

  const previous = id ? await listingsRepo.getById(id) : null;
  const saved = id
    ? await listingsRepo.updateListing(id, profile.id, draft)
    : await listingsRepo.createListing(profile.id, draft);
  if (!saved) fail(country, id, "forbidden");
  if (
    previous &&
    previous.currency === saved.currency &&
    saved.priceAmount < previous.priceAmount
  ) {
    await notifyPriceDrop(saved, previous.priceAmount, session.user.email);
  }
  redirect(listingPath(saved.country, saved.slug));
}
