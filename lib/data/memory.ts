import type { CountryCode } from "../countries";
import type { CategoryKey, Listing, User } from "../types";
import { listings, users } from "./catalog";
import { byNewest, searchListings } from "./listing-query";
import type { ListingRepository } from "./repository";

/**
 * Reads the placeholder catalog from memory.
 * Used when DATABASE_URL is unset (including `npm run build`).
 * The same rows are seeded into Postgres by `scripts/db-seed.ts`.
 */
export class MemoryListingRepository implements ListingRepository {
  async listByCountry(country: CountryCode): Promise<Listing[]> {
    return listings.filter((listing) => listing.country === country).sort(byNewest);
  }

  async listByCategory(
    country: CountryCode,
    category: CategoryKey,
  ): Promise<Listing[]> {
    const all = await this.listByCountry(country);
    return all.filter((listing) => listing.category === category);
  }

  async getBySlug(country: CountryCode, slug: string): Promise<Listing | null> {
    return (
      listings.find(
        (listing) => listing.country === country && listing.slug === slug,
      ) ?? null
    );
  }

  async getUser(id: string): Promise<User | null> {
    return users.find((user) => user.id === id) ?? null;
  }

  async getUserByHandle(country: CountryCode, handle: string): Promise<User | null> {
    return users.find((user) => user.country === country && user.handle === handle) ?? null;
  }

  async listSellers(country: CountryCode): Promise<User[]> {
    const ids = new Set(
      listings.filter((listing) => listing.country === country).map((listing) => listing.sellerId),
    );
    return users
      .filter((user) => user.country === country && ids.has(user.id))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }

  async search(country: CountryCode, query: string): Promise<Listing[]> {
    const all = await this.listByCountry(country);
    return searchListings(all, query);
  }
}
