"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isCountry, type CountryCode } from "../countries";
import { getDb } from "../db/client";
import { favourites, listings, offers, profiles, user } from "../db/schema";
import { profileForAuthUser } from "../auth/profile";
import { getSession } from "../auth/session";
import { accountPath, listingPath, signInPath } from "../paths";
import { offerDecisionMail } from "./mail";
import { sendEmail } from "../mail";
import { absoluteUrl } from "../seo";
import { formatMoney } from "../money";

function back(country: CountryCode, slug: string) {
  return listingPath(country, slug);
}

export async function makeOffer(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const slug = String(formData.get("slug") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const path = back(country, slug);
  const session = await getSession();
  if (!session) redirect(`${signInPath(country)}?next=${encodeURIComponent(path)}`);
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));

  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 400);
  if (!Number.isInteger(amount) || amount < 1) redirect(`${path}?offer=fields`);

  const db = getDb();
  const rows = await db.select().from(listings).where(eq(listings.id, listingId));
  const listing = rows[0];
  if (!listing || listing.status === "sold" || listing.sellerId === profile.id) {
    redirect(`${path}?offer=fields`);
  }

  await db.insert(offers).values({
    id: `off_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
    listingId,
    fromUserId: profile.id,
    toUserId: listing.sellerId,
    amount,
    currency: listing.currency,
    kind: "buyer",
    note: note || null,
    status: "pending",
    createdAt: new Date().toISOString().slice(0, 10),
  });
  revalidatePath(path);
  redirect(`${path}?offer=sent`);
}

export async function sendPrivateOffer(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const slug = String(formData.get("slug") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const path = back(country, slug);
  const session = await getSession();
  if (!session) redirect(signInPath(country));
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));

  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim().slice(0, 400);
  const targets = formData.getAll("to").map(String).filter(Boolean);
  if (!Number.isInteger(amount) || amount < 1 || targets.length === 0) {
    redirect(`${path}?offer=fields`);
  }

  const db = getDb();
  const rows = await db.select().from(listings).where(eq(listings.id, listingId));
  const listing = rows[0];
  if (!listing || listing.status === "sold" || listing.sellerId !== profile.id) {
    redirect(`${path}?offer=fields`);
  }

  const savers = await db
    .select({ userId: favourites.userId })
    .from(favourites)
    .where(eq(favourites.listingId, listingId));
  const allowed = new Set(savers.map((row) => row.userId));

  for (const toUserId of targets) {
    if (!allowed.has(toUserId) || toUserId === profile.id) continue;
    await db.insert(offers).values({
      id: `off_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
      listingId,
      fromUserId: profile.id,
      toUserId,
      amount,
      currency: listing.currency,
      kind: "seller",
      note: note || null,
      status: "pending",
      createdAt: new Date().toISOString().slice(0, 10),
    });
  }
  revalidatePath(path);
  redirect(`${path}?offer=sent`);
}

export async function respondToOffer(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const offerId = String(formData.get("offerId") ?? "");
  const decision = formData.get("decision") === "accepted" ? "accepted" : "declined";
  const session = await getSession();
  if (!session) redirect(signInPath(country));
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));

  const db = getDb();
  const rows = await db.select().from(offers).where(eq(offers.id, offerId));
  const offer = rows[0];
  if (!offer || offer.kind !== "buyer" || offer.status !== "pending" || offer.toUserId !== profile.id) {
    redirect(accountPath(country));
  }
  const listingRows = await db.select().from(listings).where(eq(listings.id, offer.listingId));
  const listing = listingRows[0];
  if (!listing || listing.sellerId !== profile.id) redirect(accountPath(country));

  await db.update(offers).set({ status: decision }).where(eq(offers.id, offer.id));

  const amount = formatMoney(offer.amount, listing.country as CountryCode);
  const url = absoluteUrl(listingPath(listing.country as CountryCode, listing.slug));
  const mail = offerDecisionMail({
    country: listing.country,
    accepted: decision === "accepted",
    title: listing.title,
    amount,
    url,
  });
  const sellerEmail = await emailForProfile(profile.id);
  const buyerEmail = await emailForProfile(offer.fromUserId);
  if (sellerEmail) await sendEmail({ to: sellerEmail, subject: mail.subject, text: mail.text });
  if (buyerEmail && buyerEmail !== sellerEmail) {
    await sendEmail({ to: buyerEmail, subject: mail.subject, text: mail.text });
  }
  redirect(`${accountPath(country)}?offer=${decision}`);
}

async function emailForProfile(profileId: string): Promise<string | null> {
  const db = getDb();
  const people = await db
    .select({ authUserId: profiles.authUserId, id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, profileId));
  const person = people[0];
  if (!person) return null;
  const emails = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, person.authUserId ?? person.id));
  return emails[0]?.email ?? null;
}
