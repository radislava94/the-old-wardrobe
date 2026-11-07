import { categoryKeys } from "../categories";
import { countries, isCountry, type CountryCode } from "../countries";
import { slugifyName } from "../auth/handle";
import { MAX_PHOTO_BYTES, sha256, sniffImage } from "./image-bytes";
import type {
  BlobReader,
  PhotoCode,
  PublishError,
  PublishResult,
  PublishStore,
  PublishTx,
  SaveListingInput,
  StoredListing,
  StoredPhoto,
} from "./publish-types";

const READY_REQUIRED = 3;
const MAX_PHOTOS = 8;

export function publishError(
  code: PublishError["error"]["code"],
  extra?: { fields?: { field: string; code: string }[]; photos?: { id?: string; code: PhotoCode }[] },
): PublishError {
  return { ok: false, error: { code, ...extra } };
}

export function validateFields(input: SaveListingInput): { field: string; code: string }[] {
  const fields: { field: string; code: string }[] = [];
  if (!isCountry(input.country)) fields.push({ field: "country", code: "fields" });
  if (!categoryKeys.includes(input.category as (typeof categoryKeys)[number])) {
    fields.push({ field: "category", code: "fields" });
  }
  const title = input.title.trim();
  const story = input.story.trim();
  const size = input.size.trim();
  const brand = input.brand.trim();
  const condition = input.condition.trim();
  if (title.length < 1 || title.length > 80) fields.push({ field: "title", code: "fields" });
  if (story.length < 1 || story.length > 600) fields.push({ field: "story", code: "fields" });
  if (size.length < 1 || size.length > 12) fields.push({ field: "size", code: "fields" });
  if (brand.length > 40) fields.push({ field: "brand", code: "fields" });
  if (condition.length < 1 || condition.length > 80) fields.push({ field: "condition", code: "fields" });
  if (!Number.isInteger(input.price) || input.price < 1) fields.push({ field: "price", code: "fields" });
  if (isCountry(input.country)) {
    const cities = countries[input.country].cities as readonly string[];
    if (!cities.includes(input.city.trim())) fields.push({ field: "city", code: "fields" });
  }
  if (
    input.freeShippingOver !== null &&
    (!Number.isInteger(input.freeShippingOver) || input.freeShippingOver < 1)
  ) {
    fields.push({ field: "freeShippingOver", code: "fields" });
  }
  return fields;
}

function clientSentUrl(input: SaveListingInput): boolean {
  return Boolean(input.photoUrl?.trim() || input.uploadedPhoto?.trim() || input.url?.trim());
}

function countsTowardCap(photo: StoredPhoto): boolean {
  return photo.status === "pending" || photo.status === "ready";
}

function readyPhotos(photos: StoredPhoto[]): StoredPhoto[] {
  return photos.filter((photo) => photo.status === "ready");
}

/** URLs leave the server only for a ready photo on a public or sold listing. */
export function exposedPhotoUrls(listing: StoredListing, photos: StoredPhoto[]): string[] {
  if (listing.visibility === "draft" || !listing.photosCompliant) return [];
  return photos
    .filter((photo) => photo.status === "ready" && photo.url)
    .map((photo) => photo.url as string);
}

export function pathnameFor(sellerId: string, listingId: string, photoId: string): string {
  return `listings/${sellerId}/${listingId}/${photoId}`;
}

export async function preparePhoto(
  store: PublishStore,
  sellerId: string,
  listingId: string,
): Promise<PublishResult | { ok: true; photoId: string; pathname: string }> {
  return store.transact(listingId, async (tx) => {
    const listing = await tx.getListing(listingId);
    if (!listing) return publishError("forbidden");
    if (listing.sellerId !== sellerId) return publishError("forbidden");
    const photos = await tx.listPhotos(listingId);
    const used = photos.filter(countsTowardCap).length;
    if (used >= MAX_PHOTOS) {
      return publishError("photo", { photos: [{ code: "photo-count" }] });
    }
    const photoId = `pht_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
    const pathname = pathnameFor(sellerId, listingId, photoId);
    await tx.insertPhoto({
      id: photoId,
      listingId,
      ownerId: sellerId,
      status: "pending",
      contentType: null,
      byteSize: null,
      pathname,
      contentHash: null,
      url: null,
    });
    return { ok: true as const, photoId, pathname };
  });
}

type Inspect =
  | { ok: true; contentType: "image/jpeg" | "image/png" | "image/webp"; byteSize: number; hash: string }
  | { ok: false; code: PhotoCode };

async function inspectStored(blob: BlobReader, photo: StoredPhoto): Promise<Inspect> {
  const object = await blob.read(photo.pathname);
  if (!object) return { ok: false, code: "photo-incomplete" };
  if (object.bytes.byteLength <= 0 || object.bytes.byteLength > MAX_PHOTO_BYTES) {
    return { ok: false, code: "photo-size" };
  }
  const contentType = sniffImage(object.bytes);
  if (!contentType) return { ok: false, code: "photo-spoofed" };
  return {
    ok: true,
    contentType,
    byteSize: object.bytes.byteLength,
    hash: await sha256(object.bytes),
  };
}

export async function verifyPhoto(
  store: PublishStore,
  blob: BlobReader,
  sellerId: string,
  listingId: string,
  photoId: string,
): Promise<PublishResult | { ok: true; photoId: string; status: "ready" }> {
  return store.transact(listingId, async (tx) => {
    const listing = await tx.getListing(listingId);
    if (!listing || listing.sellerId !== sellerId) return publishError("forbidden");
    const photo = await tx.getPhoto(photoId);
    if (!photo) return publishError("photo", { photos: [{ id: photoId, code: "photo-missing" }] });
    if (photo.listingId !== listingId || photo.ownerId !== sellerId) {
      return publishError("photo", { photos: [{ id: photoId, code: "photo-foreign" }] });
    }
    if (photo.status === "deleted") {
      return publishError("photo", { photos: [{ id: photoId, code: "photo-incomplete" }] });
    }
    if (photo.status === "ready") return { ok: true as const, photoId, status: "ready" as const };
    const inspected = await inspectStored(blob, photo);
    if (!inspected.ok) {
      await tx.updatePhoto({ ...photo, status: "failed", url: null, contentType: null });
      return publishError("photo", { photos: [{ id: photoId, code: inspected.code }] });
    }
    const siblings = await tx.listPhotos(listingId);
    const duplicate = siblings.find(
      (other) => other.id !== photo.id && other.status === "ready" && other.contentHash === inspected.hash,
    );
    if (duplicate) {
      await tx.updatePhoto({
        ...photo,
        status: "deleted",
        contentType: inspected.contentType,
        byteSize: inspected.byteSize,
        contentHash: inspected.hash,
        url: null,
      });
      return { ok: true as const, photoId: duplicate.id, status: "ready" as const };
    }
    const object = listing.visibility === "draft" ? null : await blob.read(photo.pathname);
    await tx.updatePhoto({
      ...photo,
      status: "ready",
      contentType: inspected.contentType,
      byteSize: inspected.byteSize,
      contentHash: inspected.hash,
      url: object?.url ?? null,
    });
    return { ok: true as const, photoId, status: "ready" as const };
  });
}

function applyText(listing: StoredListing, input: SaveListingInput, country: CountryCode): StoredListing {
  return {
    ...listing,
    country,
    title: input.title.trim(),
    description: input.story.trim(),
    category: input.category as StoredListing["category"],
    priceAmount: input.price,
    currency: countries[country].currency,
    size: input.size.trim(),
    condition: input.condition.trim(),
    city: input.city.trim(),
    brand: input.brand.trim(),
    freeShipping: input.freeShipping,
    freeShippingOver: input.freeShippingOver,
    era: input.brand.trim() || input.condition.trim(),
  };
}

export async function saveForSeller(
  store: PublishStore,
  blob: BlobReader,
  sellerId: string | null,
  input: SaveListingInput,
): Promise<PublishResult> {
  if (!sellerId) return publishError("unauthenticated");
  return saveListingRecord(store, blob, sellerId, input);
}

export async function saveListingRecord(
  store: PublishStore,
  blob: BlobReader,
  sellerId: string,
  input: SaveListingInput,
): Promise<PublishResult> {
  if (clientSentUrl(input)) {
    return publishError("photo", { photos: [{ code: "photo-foreign" }] });
  }
  const fields = validateFields(input);
  if (fields.length > 0) return publishError("invalid", { fields });
  const country = input.country as CountryCode;
  const listingId = input.id ?? `lst_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
  const intent = input.intent ?? "publish";

  return store.transact(listingId, async (tx) => {
    const existing = input.id ? await tx.getListing(input.id) : null;
    if (input.id && !existing) return publishError("forbidden");
    if (existing && existing.sellerId !== sellerId) return publishError("forbidden");

    const photos = existing ? await tx.listPhotos(existing.id) : [];
    const problems: { id?: string; code: PhotoCode }[] = [];
    const requested = input.photoIds ?? [];
    for (const photoId of requested) {
      const photo = photos.find((item) => item.id === photoId) ?? (await tx.getPhoto(photoId));
      if (!photo) {
        problems.push({ id: photoId, code: "photo-missing" });
        continue;
      }
      if (!existing || photo.listingId !== existing.id || photo.ownerId !== sellerId) {
        problems.push({ id: photoId, code: "photo-foreign" });
        continue;
      }
      if (photo.status === "deleted" || photo.status === "failed") {
        problems.push({ id: photoId, code: "photo-incomplete" });
        continue;
      }
      const inspected = await inspectStored(blob, photo);
      if (!inspected.ok) {
        problems.push({ id: photoId, code: inspected.code });
        continue;
      }
      const duplicate = photos.find(
        (other) =>
          other.id !== photo.id && other.status === "ready" && other.contentHash === inspected.hash,
      );
      if (duplicate && photo.status !== "ready") {
        await tx.updatePhoto({ ...photo, status: "deleted", url: null, contentHash: inspected.hash });
        continue;
      }
      if (photo.status !== "ready") {
        const next = {
          ...photo,
          status: "ready" as const,
          contentType: inspected.contentType,
          byteSize: inspected.byteSize,
          contentHash: inspected.hash,
          url: null,
        };
        await tx.updatePhoto(next);
        const index = photos.findIndex((item) => item.id === photo.id);
        if (index >= 0) photos[index] = next;
      }
    }
    if (problems.length > 0) return publishError("photo", { photos: problems });

    const after = existing ? await tx.listPhotos(existing.id) : photos;
    const ready = readyPhotos(after);
    const readyCount = ready.length;
    const alreadyPublic = existing?.visibility === "public" || existing?.visibility === "sold";

    if (intent === "draft" && alreadyPublic && readyCount < READY_REQUIRED) {
      return publishError("photo", { photos: [{ code: "photo-count" }] });
    }
    if (intent === "publish" && readyCount < READY_REQUIRED) {
      return publishError("photo", { photos: [{ code: "photo-count" }] });
    }

    const base: StoredListing = existing ?? {
      id: listingId,
      sellerId,
      slug: await uniqueSlug(tx, country, slugifyName(input.title)),
      country,
      title: input.title.trim(),
      description: input.story.trim(),
      category: input.category as StoredListing["category"],
      priceAmount: input.price,
      currency: countries[country].currency,
      size: input.size.trim(),
      condition: input.condition.trim(),
      city: input.city.trim(),
      brand: input.brand.trim(),
      visibility: "draft",
      photosCompliant: false,
      legacyPhotoUrl: null,
      freeShipping: input.freeShipping,
      freeShippingOver: input.freeShippingOver,
      era: input.brand.trim() || input.condition.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
    };
    let next = applyText(base, input, country);
    if (!existing) {
      next = { ...next, visibility: intent === "publish" ? "public" : "draft" };
    } else if (intent === "publish" && existing.visibility !== "sold") {
      next = { ...next, visibility: "public" };
    }
    if (intent === "publish" && readyCount >= READY_REQUIRED) {
      next = { ...next, photosCompliant: true };
    }
    if (existing) await tx.updateListing(next);
    else await tx.insertListing(next);
    const live = await tx.listPhotos(next.id);
    for (const photo of live) {
      if (photo.status !== "ready" || next.visibility === "draft") {
        if (photo.url) await tx.updatePhoto({ ...photo, url: null });
        continue;
      }
      if (photo.url) continue;
      const object = await blob.read(photo.pathname);
      if (object?.url) await tx.updatePhoto({ ...photo, url: object.url });
    }
    return {
      ok: true as const,
      listing: {
        id: next.id,
        country: next.country,
        slug: next.slug,
        photoIds: ready.map((photo) => photo.id),
      },
    };
  });
}

export async function deletePhoto(
  store: PublishStore,
  sellerId: string,
  listingId: string,
  photoId: string,
): Promise<PublishResult | { ok: true; photoId: string }> {
  return store.transact(listingId, async (tx) => {
    const listing = await tx.getListing(listingId);
    if (!listing || listing.sellerId !== sellerId) return publishError("forbidden");
    const photo = await tx.getPhoto(photoId);
    if (!photo) return publishError("photo", { photos: [{ id: photoId, code: "photo-missing" }] });
    if (photo.listingId !== listingId || photo.ownerId !== sellerId) {
      return publishError("photo", { photos: [{ id: photoId, code: "photo-foreign" }] });
    }
    const photos = await tx.listPhotos(listingId);
    const readyAfter = readyPhotos(photos).filter((item) => item.id !== photoId).length;
    const publicListing = listing.visibility === "public" || listing.visibility === "sold";
    if (publicListing && photo.status === "ready" && readyAfter < READY_REQUIRED) {
      return publishError("photo", { photos: [{ id: photoId, code: "photo-count" }] });
    }
    await tx.updatePhoto({ ...photo, status: "deleted", url: null });
    return { ok: true as const, photoId };
  });
}

async function uniqueSlug(tx: PublishTx, country: CountryCode, base: string): Promise<string> {
  let slug = base || "piece";
  for (let n = 2; n < 50; n += 1) {
    if (!(await tx.slugTaken(country, slug))) return slug;
    slug = `${base}-${n}`.slice(0, 48);
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}
