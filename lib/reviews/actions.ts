"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { profileForAuthUser } from "../auth/profile";
import { getSession } from "../auth/session";
import { isCountry, type CountryCode } from "../countries";
import { getDb } from "../db/client";
import { listings, orderItems, orders, reviews } from "../db/schema";
import { signInPath } from "../paths";

function sameSitePath(value: string, country: CountryCode): string {
  if (value.startsWith(`/${country}/`) && !value.includes("://") && !value.startsWith("//")) {
    return value;
  }
  return `/${country}`;
}

/** A paid order unlocks one review. Refused and cancelled orders do not. */
export async function submitReview(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const next = sameSitePath(String(formData.get("next") ?? ""), country);
  const session = await getSession();
  if (!session) redirect(`${signInPath(country)}?next=${encodeURIComponent(next)}`);
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));

  const orderId = String(formData.get("orderId") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const stars = Number(formData.get("stars"));
  const comment = String(formData.get("comment") ?? "").trim();
  if (!Number.isInteger(stars) || stars < 1 || stars > 5 || comment.length < 1 || comment.length > 600) {
    redirect(`${next}${next.includes("?") ? "&" : "?"}review=fields`);
  }

  const db = getDb();
  const found = await db.select().from(orders).where(eq(orders.id, orderId));
  const order = found[0];
  if (!order || order.buyerId !== profile.id || order.codStatus !== "paid") {
    redirect(`${next}${next.includes("?") ? "&" : "?"}review=closed`);
  }
  const pieces = await db
    .select({ listingId: orderItems.listingId })
    .from(orderItems)
    .where(and(eq(orderItems.orderId, order.id), eq(orderItems.listingId, listingId)));
  if (pieces.length === 0) redirect(`${next}${next.includes("?") ? "&" : "?"}review=fields`);

  const piece = await db
    .select({ country: listings.country })
    .from(listings)
    .where(eq(listings.id, listingId));
  const pieceCountry = piece[0]?.country;
  if (!pieceCountry || !isCountry(pieceCountry)) {
    redirect(`${next}${next.includes("?") ? "&" : "?"}review=fields`);
  }

  try {
    await db.insert(reviews).values({
      id: `rev_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
      sellerId: order.sellerId,
      buyerId: profile.id,
      orderId: order.id,
      listingId,
      stars,
      comment,
      createdAt: new Date().toISOString().slice(0, 10),
      country: pieceCountry,
      firstParty: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("reviews_order_id") || message.includes("unique")) {
      redirect(`${next}${next.includes("?") ? "&" : "?"}review=saved`);
    }
    throw error;
  }
  redirect(`${next}${next.includes("?") ? "&" : "?"}review=saved`);
}
