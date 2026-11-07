"use server";

import { and, eq, ne } from "drizzle-orm";
import { getSession } from "../auth/session";
import { ensureProfile } from "../auth/profile";
import { listingsRepo } from "../data";
import { getDb } from "../db/client";
import { listingPhotos, profiles } from "../db/schema";
import { notifyPriceDrop } from "../favourites/price-drop";
import { createDbPublishStore, vercelBlobReader } from "./publish-db";
import {
  deletePhoto,
  preparePhoto,
  publishError,
  saveForSeller,
  verifyPhoto,
} from "./publish";
import {
  aiAvailability,
  requestDescriptionDraft,
  type AiEnv,
  type DescriptionDraftResult,
  type DraftPhoto,
} from "./ai-draft";
import { callDescriptionModel } from "./ai-gateway";
import type { PublishResult, SaveListingInput } from "./publish-types";

function store() {
  return createDbPublishStore();
}

function databaseReady(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function blobReady(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

function databaseError(): PublishResult {
  return publishError("invalid", { fields: [{ field: "database", code: "database" }] });
}

function blobError(): PublishResult {
  return publishError("invalid", { fields: [{ field: "photo", code: "photo-blob" }] });
}

/** A thrown action becomes an error overlay and drops the submission. Return the shape instead. */
async function held<T>(run: () => Promise<T>): Promise<T | PublishResult> {
  try {
    return await run();
  } catch (error) {
    console.error(error);
    return databaseError();
  }
}

export async function saveListing(input: SaveListingInput): Promise<PublishResult> {
  if (!databaseReady()) return databaseError();
  const needsBlob = input.intent !== "draft" || (input.photoIds?.length ?? 0) > 0;
  if (needsBlob && !blobReady()) return blobError();
  return held(async () => {
    const session = await getSession();
    if (!session) return { ok: false, error: { code: "unauthenticated" } } as const;
    if (input.country === "mk" || input.country === "bg" || input.country === "sr-rs" || input.country === "sq-al") {
      await ensureProfile(session.user, input.country);
    }
    const previous = input.id ? await listingsRepo.getById(input.id) : null;
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
    if (result.ok && previous) {
      const saved = await listingsRepo.getById(result.listing.id);
      if (
        saved &&
        previous.currency === saved.currency &&
        saved.priceAmount < previous.priceAmount
      ) {
        try {
          await notifyPriceDrop(saved, previous.priceAmount, session.user.email);
        } catch (error) {
          console.error(error);
        }
      }
    }
    return result;
  });
}

export async function prepareListingPhoto(listingId: string) {
  if (!databaseReady()) return databaseError();
  if (!blobReady()) return blobError();
  return held(async () => {
    const session = await getSession();
    if (!session) return publishError("unauthenticated");
    return preparePhoto(store(), session.user.id, listingId);
  });
}

export async function verifyListingPhoto(listingId: string, photoId: string) {
  if (!databaseReady()) return databaseError();
  if (!blobReady()) return blobError();
  return held(async () => {
    const session = await getSession();
    if (!session) return publishError("unauthenticated");
    return verifyPhoto(store(), vercelBlobReader(), session.user.id, listingId, photoId);
  });
}

export async function removeListingPhoto(listingId: string, photoId: string) {
  if (!databaseReady()) return databaseError();
  return held(async () => {
    const session = await getSession();
    if (!session) return publishError("unauthenticated");
    return deletePhoto(store(), session.user.id, listingId, photoId);
  });
}

export async function listOwnedPhotos(listingId: string): Promise<{ id: string; status: string }[]> {
  if (!databaseReady()) return [];
  const session = await getSession();
  if (!session) return [];
  try {
    const rows = await getDb()
      .select({ id: listingPhotos.id, status: listingPhotos.status, ownerId: listingPhotos.ownerId })
      .from(listingPhotos)
      .where(and(eq(listingPhotos.listingId, listingId), ne(listingPhotos.status, "deleted")));
    return rows
      .filter((row) => row.ownerId === session.user.id)
      .map((row) => ({ id: row.id, status: row.status }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

function aiEnv(): AiEnv {
  return {
    AI_DRAFT: process.env.AI_DRAFT,
    AI_GATEWAY_API_KEY: process.env.AI_GATEWAY_API_KEY,
  };
}

export async function listingAiAvailability() {
  return aiAvailability(aiEnv());
}

export async function listingAiDraft(listingId: string): Promise<DescriptionDraftResult> {
  const env = aiEnv();
  if (!aiAvailability(env).available) return { ok: false, error: { code: "ai-off" } };
  if (!databaseReady()) return { ok: false, error: { code: "ai-off" } };
  const session = await getSession();
  if (!session) return { ok: false, error: { code: "unauthenticated" } };
  const listing = await listingsRepo.getById(listingId);
  if (!listing || listing.sellerId !== session.user.id) {
    return { ok: false, error: { code: "forbidden" } };
  }
  const key = env.AI_GATEWAY_API_KEY?.trim();
  if (!key) return { ok: false, error: { code: "ai-off" } };
  const rows = await getDb()
    .select()
    .from(listingPhotos)
    .where(and(eq(listingPhotos.listingId, listingId), eq(listingPhotos.status, "ready")));
  const photos: DraftPhoto[] = [];
  for (const row of rows) {
    if (row.ownerId !== session.user.id) continue;
    if (row.contentType !== "image/jpeg" && row.contentType !== "image/png" && row.contentType !== "image/webp") {
      continue;
    }
    const stored = await vercelBlobReader().read(row.pathname);
    if (!stored) continue;
    photos.push({
      id: row.id,
      status: "ready" as const,
      contentType: row.contentType,
      bytes: stored.bytes,
    });
  }
  const descriptionBefore = listing.description;
  const result = await requestDescriptionDraft({
    env,
    sellerId: session.user.id,
    listing: {
      description: listing.description,
      sellerId: listing.sellerId,
      country: listing.country,
    },
    photos,
    run: (ready) => callDescriptionModel(ready, key),
  });
  if (listing.description !== descriptionBefore) {
    return { ok: false, error: { code: "ai-invalid" } };
  }
  return result;
}
