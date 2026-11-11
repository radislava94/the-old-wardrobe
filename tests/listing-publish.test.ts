import assert from "node:assert/strict";
import test from "node:test";
import { createMemoryPublishStore, memoryBlob } from "../lib/listings/publish-memory";
import {
  deletePhoto,
  exposedPhotoUrls,
  preparePhoto,
  saveForSeller,
  verifyPhoto,
} from "../lib/listings/publish";
import type { SaveListingInput, StoredListing } from "../lib/listings/publish-types";

const seller = "seller-a";
const other = "seller-b";

function jpeg(size: number): Uint8Array {
  const bytes = new Uint8Array(size);
  bytes[0] = 0xff;
  bytes[1] = 0xd8;
  bytes[2] = 0xff;
  return bytes;
}

function gif(): Uint8Array {
  return new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00]);
}

function input(overrides: Partial<SaveListingInput> = {}): SaveListingInput {
  return {
    intent: "publish",
    country: "mk",
    title: "Пончо",
    story: "Топло парче од таванот.",
    category: "knitwear",
    size: "M",
    city: "Скопје",
    brand: "",
    condition: "Носено со љубов",
    price: 1500,
    freeShipping: false,
    freeShippingOver: null,
    photoIds: [],
    ...overrides,
  };
}

function harness() {
  const store = createMemoryPublishStore();
  const objects = new Map<string, { bytes: Uint8Array; url: string }>();
  const blob = memoryBlob(objects);
  return { store, objects, blob };
}

async function draftListing(
  store: ReturnType<typeof createMemoryPublishStore>,
  blob: ReturnType<typeof memoryBlob>,
  owner = seller,
) {
  const saved = await saveForSeller(store, blob, owner, input({ intent: "draft" }));
  assert.equal(saved.ok, true);
  if (!saved.ok) throw new Error("draft");
  return saved.listing;
}

async function readyPhoto(
  store: ReturnType<typeof createMemoryPublishStore>,
  objects: Map<string, { bytes: Uint8Array; url: string }>,
  blob: ReturnType<typeof memoryBlob>,
  listingId: string,
  bytes: Uint8Array,
  owner = seller,
) {
  const prepared = await preparePhoto(store, owner, listingId);
  assert.equal(prepared.ok, true);
  if (!prepared.ok || !("pathname" in prepared)) throw new Error("prepare");
  objects.set(prepared.pathname, { bytes, url: `https://${prepared.photoId}.public.blob.vercel-storage.com/x` });
  const verified = await verifyPhoto(store, blob, owner, listingId, prepared.photoId);
  assert.equal(verified.ok, true);
  return prepared.photoId;
}

test("anonymous", async () => {
  const { store, blob } = harness();
  const result = await saveForSeller(store, blob, null, input({ intent: "draft" }));
  assert.deepEqual(result, { ok: false, error: { code: "unauthenticated" } });
  assert.equal(store.read().listings.size, 0);
});

test("other owner", async () => {
  const { store, blob } = harness();
  const listing = await draftListing(store, blob, seller);
  const before = store.read().listings.get(listing.id) as StoredListing;
  const result = await saveForSeller(
    store,
    blob,
    other,
    input({ id: listing.id, intent: "draft", title: "Туѓо" }),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "forbidden");
  assert.equal(store.read().listings.get(listing.id)?.title, before.title);
  assert.equal(store.read().listings.get(listing.id)?.sellerId, seller);
});

test("0 photos", async () => {
  const { store, blob } = harness();
  const published = await saveForSeller(store, blob, seller, input({ intent: "publish" }));
  assert.equal(published.ok, false);
  if (!published.ok) {
    assert.equal(published.error.code, "photo");
    assert.equal(published.error.photos?.[0]?.code, "photo-count");
  }
  assert.equal((await store.publicListings("mk")).length, 0);
  const drafted = await saveForSeller(store, blob, seller, input({ intent: "draft" }));
  assert.equal(drafted.ok, true);
  assert.equal((await store.publicListings("mk")).length, 0);
});

test("1 photo", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  const photoId = await readyPhoto(store, objects, blob, listing.id, jpeg(32));
  const result = await saveForSeller(
    store,
    blob,
    seller,
    input({ id: listing.id, intent: "publish", photoIds: [photoId] }),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.photos?.[0]?.code, "photo-count");
  assert.equal(store.read().listings.get(listing.id)?.visibility, "draft");
  assert.equal((await store.publicListings("mk")).length, 0);
});

test("2 photos", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  const ids = [
    await readyPhoto(store, objects, blob, listing.id, jpeg(32)),
    await readyPhoto(store, objects, blob, listing.id, jpeg(64)),
  ];
  const result = await saveForSeller(
    store,
    blob,
    seller,
    input({ id: listing.id, intent: "publish", photoIds: ids }),
  );
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.photos?.[0]?.code, "photo-count");
  assert.equal((await store.publicListings("mk")).length, 0);
});

test("3 ready photos", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  const ids = [];
  for (const size of [32, 64, 96]) ids.push(await readyPhoto(store, objects, blob, listing.id, jpeg(size)));
  const result = await saveForSeller(
    store,
    blob,
    seller,
    input({ id: listing.id, intent: "publish", photoIds: ids }),
  );
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.deepEqual(result.listing.photoIds, ids);
  const stored = store.read().listings.get(listing.id);
  assert.equal(stored?.visibility, "public");
  assert.equal(stored?.photosCompliant, true);
  assert.equal((await store.publicListings("mk")).length, 1);
  const photos = [...store.read().photos.values()].filter((photo) => photo.listingId === listing.id);
  assert.equal(exposedPhotoUrls(stored!, photos).length, 3);
});

test("spoofed MIME", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  const prepared = await preparePhoto(store, seller, listing.id);
  assert.equal(prepared.ok, true);
  if (!prepared.ok || !("pathname" in prepared)) return;
  objects.set(prepared.pathname, {
    bytes: gif(),
    url: "https://spoof.public.blob.vercel-storage.com/x",
  });
  const verified = await verifyPhoto(store, blob, seller, listing.id, prepared.photoId);
  assert.equal(verified.ok, false);
  if (!verified.ok) assert.equal(verified.error.photos?.[0]?.code, "photo-spoofed");
  const photo = store.read().photos.get(prepared.photoId);
  assert.equal(photo?.status, "failed");
  assert.equal(photo?.url, null);
  assert.equal(exposedPhotoUrls(store.read().listings.get(listing.id)!, [photo!]).length, 0);
});

test("oversize", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  const prepared = await preparePhoto(store, seller, listing.id);
  assert.equal(prepared.ok, true);
  if (!prepared.ok || !("pathname" in prepared)) return;
  objects.set(prepared.pathname, {
    bytes: jpeg(4_500_001),
    url: "https://big.public.blob.vercel-storage.com/x",
  });
  const verified = await verifyPhoto(store, blob, seller, listing.id, prepared.photoId);
  assert.equal(verified.ok, false);
  if (!verified.ok) assert.equal(verified.error.photos?.[0]?.code, "photo-size");
  assert.equal(store.read().photos.get(prepared.photoId)?.status, "failed");
});

test("4_500_000 bytes is still a photo", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  const id = await readyPhoto(store, objects, blob, listing.id, jpeg(4_500_000));
  assert.equal(store.read().photos.get(id)?.status, "ready");
  assert.equal(store.read().photos.get(id)?.byteSize, 4_500_000);
});

test("foreign or missing URL", async () => {
  const { store, objects, blob } = harness();
  const mine = await draftListing(store, blob, seller);
  const theirs = await draftListing(store, blob, other);
  const foreignPhoto = await readyPhoto(store, objects, blob, theirs.id, jpeg(40), other);
  const before = store.read().listings.get(mine.id)?.title;
  const foreign = await saveForSeller(
    store,
    blob,
    seller,
    input({ id: mine.id, intent: "draft", photoIds: [foreignPhoto], url: "https://evil.example/a.jpg" }),
  );
  assert.equal(foreign.ok, false);
  if (!foreign.ok) assert.equal(foreign.error.photos?.[0]?.code, "photo-foreign");
  assert.equal(store.read().listings.get(mine.id)?.title, before);

  const missing = await saveForSeller(
    store,
    blob,
    seller,
    input({ id: mine.id, intent: "draft", photoIds: ["pht_missing"] }),
  );
  assert.equal(missing.ok, false);
  if (!missing.ok) assert.equal(missing.error.photos?.[0]?.code, "photo-missing");
  assert.equal(store.read().listings.get(mine.id)?.title, before);
});

test("deleted or incomplete blob", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  const gone = await preparePhoto(store, seller, listing.id);
  assert.equal(gone.ok, true);
  if (!gone.ok || !("pathname" in gone)) return;
  const deletedId = await readyPhoto(store, objects, blob, listing.id, jpeg(48));
  await deletePhoto(store, seller, listing.id, deletedId);
  objects.delete(gone.pathname);
  const result = await saveForSeller(
    store,
    blob,
    seller,
    input({ id: listing.id, intent: "publish", photoIds: [gone.photoId, deletedId] }),
  );
  assert.equal(result.ok, false);
  if (!result.ok) {
    const codes = result.error.photos?.map((photo) => photo.code) ?? [];
    assert.ok(codes.includes("photo-incomplete"));
  }
  assert.equal(store.read().listings.get(listing.id)?.visibility, "draft");
});

test("concurrent save", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  for (let i = 0; i < 7; i += 1) {
    await readyPhoto(store, objects, blob, listing.id, jpeg(30 + i));
  }
  const pair = await Promise.all([
    preparePhoto(store, seller, listing.id),
    preparePhoto(store, seller, listing.id),
  ]);
  const accepted = pair.filter((item) => item.ok);
  const rejected = pair.filter((item) => !item.ok);
  assert.equal(accepted.length, 1);
  assert.equal(rejected.length, 1);
  if (!rejected[0]?.ok) assert.equal(rejected[0]?.error.photos?.[0]?.code, "photo-count");
  const live = [...store.read().photos.values()].filter(
    (photo) => photo.listingId === listing.id && (photo.status === "pending" || photo.status === "ready"),
  );
  assert.equal(live.length, 8);

  const tight = await draftListing(store, blob);
  const readyIds = [];
  for (const size of [40, 41, 42, 43]) {
    readyIds.push(await readyPhoto(store, objects, blob, tight.id, jpeg(size)));
  }
  const published = await saveForSeller(
    store,
    blob,
    seller,
    input({ id: tight.id, intent: "publish", photoIds: readyIds }),
  );
  assert.equal(published.ok, true);
  const [first, second] = readyIds;
  const deleted = await Promise.all([
    deletePhoto(store, seller, tight.id, first!),
    deletePhoto(store, seller, tight.id, second!),
  ]);
  const removed = deleted.filter((item) => item.ok).length;
  const blocked = deleted.filter((item) => !item.ok).length;
  assert.equal(removed, 1);
  assert.equal(blocked, 1);
  const stillReady = [...store.read().photos.values()].filter(
    (photo) => photo.listingId === tight.id && photo.status === "ready",
  );
  assert.equal(stillReady.length, 3);
  assert.equal(store.read().listings.get(tight.id)?.visibility, "public");
});

test("legacy single photo stays visible and is not compliant", async () => {
  const { store, blob } = harness();
  const id = "lst_legacy";
  await store.transact(id, async (tx) => {
    await tx.insertListing({
      id,
      sellerId: seller,
      slug: "staro-ponco",
      country: "mk",
      title: "Старо пончо",
      description: "Веќе објавено со една фотографија.",
      category: "knitwear",
      priceAmount: 1200,
      currency: "MKD",
      size: "M",
      condition: "Добро зачуван",
      city: "Скопје",
      brand: "",
      visibility: "public",
      photosCompliant: false,
      legacyPhotoUrl: "https://old.example/one.jpg",
      freeShipping: false,
      freeShippingOver: null,
      era: "1970",
      createdAt: "2026-10-01",
    });
    return { ok: true as const };
  });
  const visible = await store.publicListings("mk");
  assert.equal(visible.length, 1);
  assert.equal(visible[0]?.photosCompliant, false);
  assert.equal(visible[0]?.legacyPhotoUrl, "https://old.example/one.jpg");
  const edit = await saveForSeller(
    store,
    blob,
    seller,
    input({ id, intent: "publish", title: "Сменето" }),
  );
  assert.equal(edit.ok, false);
  if (!edit.ok) assert.equal(edit.error.photos?.[0]?.code, "photo-count");
  const after = store.read().listings.get(id);
  assert.equal(after?.visibility, "public");
  assert.equal(after?.photosCompliant, false);
  assert.equal(after?.title, "Старо пончо");
  assert.equal(after?.legacyPhotoUrl, "https://old.example/one.jpg");
});

test("a free-shipping request is stored as not free", async () => {
  const { store, blob } = harness();
  const saved = await saveForSeller(
    store,
    blob,
    seller,
    input({ intent: "draft", freeShipping: true, freeShippingOver: 4000 }),
  );
  assert.equal(saved.ok, true);
  if (!saved.ok) return;
  const row = store.read().listings.get(saved.listing.id);
  assert.equal(row?.freeShipping, false);
  assert.equal(row?.freeShippingOver, null);
});

test("draft intent does not unpublish a public listing", async () => {
  const { store, objects, blob } = harness();
  const listing = await draftListing(store, blob);
  const ids = [];
  for (const size of [20, 21, 22]) ids.push(await readyPhoto(store, objects, blob, listing.id, jpeg(size)));
  await saveForSeller(store, blob, seller, input({ id: listing.id, intent: "publish", photoIds: ids }));
  const removed = await deletePhoto(store, seller, listing.id, ids[0]!);
  assert.equal(removed.ok, false);
  assert.equal(
    [...store.read().photos.values()].filter((photo) => photo.status === "ready" && photo.listingId === listing.id)
      .length,
    3,
  );
  const result = await saveForSeller(
    store,
    blob,
    seller,
    input({ id: listing.id, intent: "draft", title: "Нацрт", photoIds: ids }),
  );
  assert.equal(result.ok, true);
  assert.equal(store.read().listings.get(listing.id)?.visibility, "public");
  assert.equal(store.read().listings.get(listing.id)?.title, "Нацрт");
  assert.equal((await store.publicListings("mk")).length, 1);
});
