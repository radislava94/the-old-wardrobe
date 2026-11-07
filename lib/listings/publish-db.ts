import { and, eq, sql } from "drizzle-orm";
import { get } from "@vercel/blob";
import type { CountryCode } from "../countries";
import { getDb, type Database } from "../db/client";
import { listingPhotos, listings } from "../db/schema";
import type { BlobReader, PublishStore, PublishTx, StoredListing, StoredPhoto } from "./publish-types";

type Tx = Parameters<Parameters<Database["transaction"]>[0]>[0];

function listingFrom(row: typeof listings.$inferSelect): StoredListing {
  return {
    id: row.id,
    sellerId: row.sellerId,
    slug: row.slug,
    country: row.country as CountryCode,
    title: row.title,
    description: row.description,
    category: row.category as StoredListing["category"],
    priceAmount: row.priceAmount,
    currency: row.currency as StoredListing["currency"],
    size: row.size,
    condition: row.condition,
    city: row.city,
    brand: row.brand ?? "",
    visibility: row.visibility as StoredListing["visibility"],
    photosCompliant: row.photosCompliant,
    legacyPhotoUrl: row.photoUrl,
    freeShipping: row.freeShipping,
    freeShippingOver: row.freeShippingOver,
    era: row.era,
    createdAt: row.createdAt,
  };
}

function photoFrom(row: typeof listingPhotos.$inferSelect): StoredPhoto {
  return {
    id: row.id,
    listingId: row.listingId,
    ownerId: row.ownerId,
    status: row.status as StoredPhoto["status"],
    contentType: row.contentType as StoredPhoto["contentType"],
    byteSize: row.byteSize,
    pathname: row.pathname,
    contentHash: row.contentHash,
    url: row.url,
  };
}

function adapter(tx: Tx): PublishTx {
  return {
    async getListing(id) {
      const rows = await tx.select().from(listings).where(eq(listings.id, id));
      return rows[0] ? listingFrom(rows[0]) : null;
    },
    async insertListing(row) {
      await tx.insert(listings).values({
        id: row.id,
        slug: row.slug,
        country: row.country,
        sellerId: row.sellerId,
        title: row.title,
        description: row.description,
        category: row.category,
        priceAmount: row.priceAmount,
        currency: row.currency,
        size: row.size,
        era: row.era,
        condition: row.condition,
        city: row.city,
        status: row.visibility === "sold" ? "sold" : "available",
        photo: "floral-dress",
        createdAt: row.createdAt,
        brand: row.brand || null,
        photoUrl: row.legacyPhotoUrl,
        freeShipping: row.freeShipping,
        freeShippingOver: row.freeShippingOver,
        visibility: row.visibility,
        photosCompliant: row.photosCompliant,
      });
    },
    async updateListing(row) {
      await tx
        .update(listings)
        .set({
          title: row.title,
          description: row.description,
          category: row.category,
          priceAmount: row.priceAmount,
          currency: row.currency,
          size: row.size,
          era: row.era,
          condition: row.condition,
          city: row.city,
          country: row.country,
          brand: row.brand || null,
          status: row.visibility === "sold" ? "sold" : "available",
          freeShipping: row.freeShipping,
          freeShippingOver: row.freeShippingOver,
          visibility: row.visibility,
          photosCompliant: row.photosCompliant,
        })
        .where(eq(listings.id, row.id));
    },
    async listPhotos(listingId) {
      const rows = await tx.select().from(listingPhotos).where(eq(listingPhotos.listingId, listingId));
      return rows.map(photoFrom);
    },
    async getPhoto(id) {
      const rows = await tx.select().from(listingPhotos).where(eq(listingPhotos.id, id));
      return rows[0] ? photoFrom(rows[0]) : null;
    },
    async insertPhoto(row) {
      await tx.insert(listingPhotos).values(row);
    },
    async updatePhoto(row) {
      await tx
        .update(listingPhotos)
        .set({
          status: row.status,
          contentType: row.contentType,
          byteSize: row.byteSize,
          contentHash: row.contentHash,
          url: row.url,
        })
        .where(eq(listingPhotos.id, row.id));
    },
    async slugTaken(country, slug) {
      const rows = await tx
        .select({ id: listings.id })
        .from(listings)
        .where(and(eq(listings.country, country), eq(listings.slug, slug)));
      return rows.length > 0;
    },
  };
}

const tails = new Map<string, Promise<void>>();

export function createDbPublishStore(): PublishStore {
  return {
    async publicListings() {
      return [];
    },
    transact(listingId, run) {
      const previous = tails.get(listingId) ?? Promise.resolve();
      let release = () => {};
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      tails.set(
        listingId,
        previous.then(() => gate),
      );
      return previous.then(() =>
        getDb()
          .transaction(async (tx) => {
            await tx.execute(sql`select id from listings where id = ${listingId} for update`);
            return run(adapter(tx));
          })
          .finally(release),
      );
    },
  };
}

export function vercelBlobReader(): BlobReader {
  return {
    async read(pathname) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) return null;
      const result = await get(pathname, { access: "public" });
      if (!result || result.statusCode !== 200 || !result.stream) return null;
      const bytes = new Uint8Array(await new Response(result.stream).arrayBuffer());
      return { bytes, url: result.blob.url };
    },
  };
}
