"use server";

import { redirect } from "next/navigation";
import { isCountry, type CountryCode } from "../countries";
import { courierChoices } from "../couriers";
import { profileForAuthUser } from "../auth/profile";
import { getSession } from "../auth/session";
import { listingPath, signInPath } from "../paths";
import { placeCodOrder, setOrderStatus } from "./place";

export async function placeOrder(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const slug = String(formData.get("slug") ?? "");
  const path = slug ? listingPath(country, slug) : `/${country}/account`;
  const session = await getSession();
  if (!session) redirect(`${signInPath(country)}?next=${encodeURIComponent(path)}`);
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));
  const courierName = String(formData.get("courier") ?? "");
  if (!(courierChoices[country] as readonly string[]).includes(courierName)) {
    redirect(`${path}?order=courier`);
  }
  const listingIds = formData.getAll("listingId").map(String).filter(Boolean);
  let id: string;
  try {
    id = await placeCodOrder({
      buyerId: profile.id,
      listingIds,
      courierName,
      country,
    });
  } catch {
    redirect(`${path}?order=fields`);
  }
  redirect(`/${country}/order/${id}`);
}

export async function updateOrderStatus(formData: FormData) {
  const countryRaw = String(formData.get("country") ?? "");
  const country: CountryCode = isCountry(countryRaw) ? countryRaw : "mk";
  const orderId = String(formData.get("orderId") ?? "");
  const next = String(formData.get("next") ?? "");
  if (next !== "paid" && next !== "refused" && next !== "cancelled") {
    redirect(`/${country}/order/${orderId}`);
  }
  const session = await getSession();
  if (!session) redirect(signInPath(country));
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(country));
  await setOrderStatus({ orderId, actorId: profile.id, next });
  redirect(`/${country}/order/${orderId}`);
}
