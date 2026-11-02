import type { CountryCode } from "../countries";
import type { CategoryKey, Listing, User } from "../types";

/**
 * Storage seam. Pages talk only to this interface.
 * `MemoryListingRepository` serves the placeholder catalog.
 * A Postgres (Neon) implementation can replace it later without
 * changing the pages: same methods, same types, one User for
 * buying and selling.
 */
export interface ListingRepository {
  /** Every listing in this country, newest first, sold pieces included. */
  listByCountry(country: CountryCode): Promise<Listing[]>;
  listByCategory(country: CountryCode, category: CategoryKey): Promise<Listing[]>;
  getBySlug(country: CountryCode, slug: string): Promise<Listing | null>;
  getUser(id: string): Promise<User | null>;
  /** Case-insensitive substring match on the listing's own text. */
  search(country: CountryCode, query: string): Promise<Listing[]>;
}
