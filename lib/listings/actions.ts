"use server";

import { and, eq, ne } from "drizzle-orm";
import { getSession } from "../auth/session";
import { ensureProfile } from "../auth/profile";
import { getDb } from "../db/client";
import { listingPhotos, profiles } from "../db/schema";
import { createDbPublishStore, vercelBlobReader } from "./publish-db";
import {
  deletePhoto,
  preparePhoto,
  publishError,
  saveForSeller,
  verifyPhoto,
} from "./publish";
import type { PublishResult, SaveListingInput } from "./publish-types";

function store() {
  return createDbPublishStore();
}

export async function saveListing(input: SaveListingInput): Promise<PublishResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: { code: "unauthenticated" } };
  if (input.country === "mk" || input.country === "bg" || input.country === "sr-rs" || input.country === "sq-al") {
    await ensureProfile(session.user, input.country);
  }
  const result = await saveForSeller(store(), vercelBlobReader(), session.user.id, input);
  if (
    result.ok &&
    (input.country === "mk" || input.country === "bg" || input.country === "sr-rs" || input.country === "sq-al")
  ) {
    await getDb()
      .update(profiles)
      .set({
        sellerKind: input.sellerKind === "business" ? "business" : "private",
        ...(input.city.trim() ? { city: input.city.trim() } : {}),
      })
      .where(eq(profiles.id, session.user.id));
  }
  return result;
}

export async function prepareListingPhoto(listingId: string) {
  const session = await getSession();
  if (!session) return publishError("unauthenticated");
  return preparePhoto(store(), session.user.id, listingId);
}

export async function verifyListingPhoto(listingId: string, photoId: string) {
  const session = await getSession();
  if (!session) return publishError("unauthenticated");
  return verifyPhoto(store(), vercelBlobReader(), session.user.id, listingId, photoId);
}

export async function removeListingPhoto(listingId: string, photoId: string) {
  const session = await getSession();
  if (!session) return publishError("unauthenticated");
  return deletePhoto(store(), session.user.id, listingId, photoId);
}

export async function listOwnedPhotos(listingId: string): Promise<{ id: string; status: string }[]> {
  const session = await getSession();
  if (!session) return [];
  const rows = await getDb()
    .select({ id: listingPhotos.id, status: listingPhotos.status, ownerId: listingPhotos.ownerId })
    .from(listingPhotos)
    .where(and(eq(listingPhotos.listingId, listingId), ne(listingPhotos.status, "deleted")));
  return rows.filter((row) => row.ownerId === session.user.id).map((row) => ({ id: row.id, status: row.status }));
}
