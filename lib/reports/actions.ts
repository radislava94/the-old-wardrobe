"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { profileForAuthUser } from "../auth/profile";
import { getSession } from "../auth/session";
import { isCountry, type CountryCode } from "../countries";
import { getDb } from "../db/client";
import { listingReports, listings } from "../db/schema";
import { listingPath, signInPath } from "../paths";

const reasons = ["not_as_described", "prohibited", "other"] as const;

/** Stores one report for this person and this listing. */
export async function reportListing(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const slug = String(formData.get("slug") ?? "");
  const listingId = String(formData.get("listingId") ?? "");
  const path = slug ? listingPath(country, slug) : `/${country}`;
  const session = await getSession();
  if (!session) redirect(`${signInPath(country)}?next=${encodeURIComponent(path)}`);
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));

  const reason = String(formData.get("reason") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  if (!reasons.includes(reason as (typeof reasons)[number]) || note.length > 600 || !listingId) {
    redirect(`${path}?report=fields`);
  }

  const db = getDb();
  const found = await db.select({ id: listings.id }).from(listings).where(eq(listings.id, listingId));
  if (!found[0]) redirect(`${path}?report=fields`);

  const existing = await db
    .select({ id: listingReports.id })
    .from(listingReports)
    .where(and(eq(listingReports.listingId, listingId), eq(listingReports.reporterId, profile.id)))
    .limit(1);
  if (existing[0]) redirect(`${path}?report=already`);

  await db.insert(listingReports).values({
    id: `rpt_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
    listingId,
    reporterId: profile.id,
    reason,
    note: note || null,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  redirect(`${path}?report=stored`);
}
