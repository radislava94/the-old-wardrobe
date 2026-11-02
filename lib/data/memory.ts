import type { CountryCode } from "../countries";
import type { CategoryKey, Listing, User } from "../types";
import { listings, users } from "./catalog";
import type { ListingRepository } from "./repository";

function byNewest(a: Listing, b: Listing): number {
  return b.createdAt.localeCompare(a.createdAt);
}

/**
 * In-memory stand-in for Postgres. Reads the placeholder catalog only.
 * Swap `listingsRepo` in `index.ts` for a Neon implementation later.
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

  async search(country: CountryCode, query: string): Promise<Listing[]> {
    const needle = query.trim().toLowerCase();
    const all = await this.listByCountry(country);
    if (!needle) return all;
    return all.filter((listing) => {
      const haystack = [
        listing.title,
        listing.description,
        listing.city,
        listing.era,
        listing.condition,
        listing.size,
        listing.brand ?? "",
        listing.category,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }
}
