import { and, eq } from "drizzle-orm";
import type { CountryCode } from "../countries";
import { getDb } from "../db/client";
import { toListing, toUser } from "../db/map";
import { listings, profiles } from "../db/schema";
import type { CategoryKey, Listing, ListingDraft, User } from "../types";
import { slugifyName } from "../auth/handle";
import { byNewest, searchListings } from "./listing-query";
import type { ListingRepository } from "./repository";

/**
 * Postgres implementation of the listing seam.
 * Callers decide when a database is configured. This class expects
 * DATABASE_URL and lets connection and missing-table errors throw.
 * Public catalogue reads catch those in `readPublicCatalogue`.
 */
export class PostgresListingRepository implements ListingRepository {
  async listByCountry(country: CountryCode): Promise<Listing[]> {
    const rows = await getDb()
      .select()
      .from(listings)
      .where(eq(listings.country, country));
    return rows.map(toListing).sort(byNewest);
  }

  async listByCategory(
    country: CountryCode,
    category: CategoryKey,
  ): Promise<Listing[]> {
    const all = await this.listByCountry(country);
    return all.filter((listing) => listing.category === category);
  }

  async getBySlug(country: CountryCode, slug: string): Promise<Listing | null> {
    const rows = await getDb()
      .select()
      .from(listings)
      .where(and(eq(listings.country, country), eq(listings.slug, slug)));
    const row = rows[0];
    return row ? toListing(row) : null;
  }

  async getUser(id: string): Promise<User | null> {
    const rows = await getDb().select().from(profiles).where(eq(profiles.id, id));
    const row = rows[0];
    return row ? toUser(row) : null;
  }

  async getUserByHandle(country: CountryCode, handle: string): Promise<User | null> {
    const rows = await getDb()
      .select()
      .from(profiles)
      .where(and(eq(profiles.country, country), eq(profiles.handle, handle)));
    const row = rows[0];
    return row ? toUser(row) : null;
  }

  async listSellers(country: CountryCode): Promise<User[]> {
    const items = await this.listByCountry(country);
    const ids = new Set(items.map((listing) => listing.sellerId));
    const sellers: User[] = [];
    for (const id of ids) {
      const user = await this.getUser(id);
      if (user && user.country === country) sellers.push(user);
    }
    return sellers.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  }

  async search(country: CountryCode, query: string): Promise<Listing[]> {
    const all = await this.listByCountry(country);
    return searchListings(all, query);
  }

  async listBySeller(sellerId: string): Promise<Listing[]> {
    const rows = await getDb().select().from(listings).where(eq(listings.sellerId, sellerId));
    return rows.map(toListing).sort(byNewest);
  }

  async getById(id: string): Promise<Listing | null> {
    const rows = await getDb().select().from(listings).where(eq(listings.id, id));
    const row = rows[0];
    return row ? toListing(row) : null;
  }

  async createListing(sellerId: string, draft: ListingDraft): Promise<Listing> {
    const id = `lst_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
    const slug = await uniqueSlug(draft.country, slugifyName(draft.title));
    const rows = await getDb()
      .insert(listings)
      .values(rowFromDraft(id, slug, sellerId, draft))
      .returning();
    const row = rows[0];
    if (!row) throw new Error("Could not save the listing.");
    return toListing(row);
  }

  async updateListing(id: string, sellerId: string, draft: ListingDraft): Promise<Listing | null> {
    const current = await this.getById(id);
    if (!current || current.sellerId !== sellerId) return null;
    const slug =
      current.country === draft.country
        ? current.slug
        : await uniqueSlug(draft.country, slugifyName(draft.title));
    const rows = await getDb()
      .update(listings)
      .set({
        ...rowFromDraft(id, slug, sellerId, draft),
        createdAt: current.createdAt,
        status: current.status,
        photo: current.photo,
      })
      .where(and(eq(listings.id, id), eq(listings.sellerId, sellerId)))
      .returning();
    const row = rows[0];
    return row ? toListing(row) : null;
  }
}

function rowFromDraft(id: string, slug: string, sellerId: string, draft: ListingDraft) {
  return {
    id,
    slug,
    country: draft.country,
    sellerId,
    title: draft.title,
    description: draft.description,
    category: draft.category,
    priceAmount: draft.priceAmount,
    currency: draft.currency,
    size: draft.size,
    era: draft.brand || draft.condition,
    condition: draft.condition,
    city: draft.city,
    status: "available" as const,
    photo: "floral-dress" as const,
    createdAt: new Date().toISOString().slice(0, 10),
    brand: draft.brand || null,
    photoUrl: draft.photoUrl,
    freeShipping: draft.freeShipping,
    freeShippingOver: draft.freeShippingOver,
  };
}

async function uniqueSlug(country: CountryCode, base: string): Promise<string> {
  const db = getDb();
  let slug = base || "piece";
  for (let n = 2; n < 50; n += 1) {
    const rows = await db
      .select({ id: listings.id })
      .from(listings)
      .where(and(eq(listings.country, country), eq(listings.slug, slug)));
    if (rows.length === 0) return slug;
    slug = `${base}-${n}`.slice(0, 48);
  }
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}
