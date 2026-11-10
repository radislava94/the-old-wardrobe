import { databaseEnabled } from "../db/runtime";
import type { CountryCode } from "../countries";
import type { CategoryKey, Listing, ListingDraft, RatingSummary, Review, User } from "../types";
import { readPublicCatalogue } from "./catalogue-fallback";
import { MemoryListingRepository } from "./memory";
import { PostgresListingRepository } from "./postgres";
import type { ListingRepository } from "./repository";
import { MemoryReviewRepository } from "./review-memory";
import { PostgresReviewRepository } from "./review-postgres";
import type { ReviewRepository } from "./review-repository";

export type { ListingRepository } from "./repository";
export type { ReviewRepository } from "./review-repository";

const memoryListings = new MemoryListingRepository();
const postgresListings = new PostgresListingRepository();
const memoryReviews = new MemoryReviewRepository();
const postgresReviews = new PostgresReviewRepository();

async function listingStore(): Promise<ListingRepository> {
  return (await databaseEnabled()) ? postgresListings : memoryListings;
}

function publicListings<T>(read: (store: ListingRepository) => Promise<T>): Promise<T> {
  return readPublicCatalogue(
    () => read(postgresListings),
    () => read(memoryListings),
  );
}

/**
 * Pages keep calling `listingsRepo`. Postgres is used when DATABASE_URL
 * is set and the catalogue tables can be read. Otherwise the placeholder
 * catalog is served from memory, so `npm run build` needs no database
 * and a missing or unreachable database does not 500 a shop page.
 *
 * `listBySeller`, `getById`, `createListing`, and `updateListing` do not
 * fall back. The account page and the sell flow must fail honestly.
 */
export const listingsRepo: ListingRepository = {
  listByCountry(country: CountryCode): Promise<Listing[]> {
    return publicListings((store) => store.listByCountry(country));
  },
  listByCategory(country: CountryCode, category: CategoryKey): Promise<Listing[]> {
    return publicListings((store) => store.listByCategory(country, category));
  },
  getBySlug(country: CountryCode, slug: string): Promise<Listing | null> {
    return publicListings((store) => store.getBySlug(country, slug));
  },
  getUser(id: string): Promise<User | null> {
    return publicListings((store) => store.getUser(id));
  },
  getUserByHandle(country: CountryCode, handle: string): Promise<User | null> {
    return publicListings((store) => store.getUserByHandle(country, handle));
  },
  listSellers(country: CountryCode): Promise<User[]> {
    return publicListings((store) => store.listSellers(country));
  },
  search(country: CountryCode, query: string): Promise<Listing[]> {
    return publicListings((store) => store.search(country, query));
  },
  listBySeller(sellerId: string): Promise<Listing[]> {
    return listingStore().then((store) => store.listBySeller(sellerId));
  },
  getById(id: string): Promise<Listing | null> {
    return listingStore().then((store) => store.getById(id));
  },
  createListing(sellerId: string, draft: ListingDraft): Promise<Listing> {
    return listingStore().then((store) => store.createListing(sellerId, draft));
  },
  updateListing(id: string, sellerId: string, draft: ListingDraft): Promise<Listing | null> {
    return listingStore().then((store) => store.updateListing(id, sellerId, draft));
  },
};

function publicReviews<T>(read: (store: ReviewRepository) => Promise<T>): Promise<T> {
  return readPublicCatalogue(
    () => read(postgresReviews),
    () => read(memoryReviews),
  );
}

/**
 * Sample reviews stay non-first-party until a repository enforces
 * one review per completed order. Both stores honour that flag.
 * These reads follow the same placeholder fallback as the catalogue.
 */
export const reviewsRepo: ReviewRepository = {
  areFirstParty(): Promise<boolean> {
    return publicReviews((store) => store.areFirstParty());
  },
  listBySeller(sellerId: string): Promise<Review[]> {
    return publicReviews((store) => store.listBySeller(sellerId));
  },
  summariesFor(sellerIds: string[]): Promise<Record<string, RatingSummary>> {
    return publicReviews((store) => store.summariesFor(sellerIds));
  },
};
