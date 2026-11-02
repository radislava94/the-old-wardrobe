"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "../auth";
import { ensureProfile, uniqueHandle } from "../auth/profile";
import { slugifyName } from "../auth/handle";
import { getSession } from "../auth/session";
import { isCountry, type CountryCode } from "../countries";
import { getDb } from "../db/client";
import { profiles } from "../db/schema";
import { accountPath } from "../paths";

export async function updateProfile(formData: FormData) {
  const session = await getSession();
  const current = String(formData.get("currentCountry") ?? "");
  if (!session || !isCountry(current)) redirect("/");
  const nextCountry = String(formData.get("country") ?? "");
  if (!isCountry(nextCountry)) redirect(`${accountPath(current)}?error=country`);
  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const sellerKind = formData.get("sellerKind") === "business" ? "business" : "private";
  const phoneVerified = formData.get("phoneVerified") === "on";
  if (name.length < 1 || name.length > 80 || city.length > 80 || bio.length > 600) {
    redirect(`${accountPath(current)}?error=fields`);
  }

  const profile = await ensureProfile(session.user, current);
  const handle =
    nextCountry === profile.country
      ? profile.handle
      : await uniqueHandle(nextCountry, slugifyName(name), profile.id);

  await getDb()
    .update(profiles)
    .set({ name, city, country: nextCountry, bio, handle, sellerKind, phoneVerified })
    .where(eq(profiles.id, profile.id));
  await getAuth().api.updateUser({
    body: { name },
    headers: await headers(),
  });
  redirect(`${accountPath(nextCountry as CountryCode)}?saved=1`);
}

export async function deleteAccount(formData: FormData) {
  const session = await getSession();
  const country = String(formData.get("country") ?? "");
  if (!session || !isCountry(country)) redirect("/");
  const typed = String(formData.get("confirm") ?? "").trim().toLowerCase();
  if (typed !== session.user.email.toLowerCase()) {
    redirect(`${accountPath(country)}?error=confirm`);
  }
  const password = String(formData.get("password") ?? "");
  try {
    await getAuth().api.deleteUser({
      body: { password: password || undefined },
      headers: await headers(),
    });
  } catch (error) {
    console.error(error);
    redirect(`${accountPath(country)}?error=delete`);
  }
  redirect(`/${country}`);
}
