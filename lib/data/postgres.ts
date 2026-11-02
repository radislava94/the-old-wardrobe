import { and, eq } from "drizzle-orm";
import type { CountryCode } from "../countries";
import { getDb } from "../db/client";
import { toListing, toUser } from "../db/map";
import { listings, profiles } from "../db/schema";
import type { CategoryKey, Listing, User } from "../types";
import { byNewest, searchListings } from "./listing-query";
import type { ListingRepository } from "./repository";

/**
 * Postgres implementation of the listing seam.
 * Callers decide when a database is configured; this class expects
 * DATABASE_URL and does not fall back to memory.
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
}
