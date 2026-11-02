import { databaseEnabled } from "../db/runtime";
import type { CountryCode } from "../countries";
import type { CategoryKey, Listing, RatingSummary, Review, User } from "../types";
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

async function reviewStore(): Promise<ReviewRepository> {
  return (await databaseEnabled()) ? postgresReviews : memoryReviews;
}

/**
 * Pages keep calling `listingsRepo`. Postgres is used when DATABASE_URL
 * is set; otherwise the placeholder catalog is served from memory so
 * `npm run build` does not need a database.
 */
export const listingsRepo: ListingRepository = {
  listByCountry(country: CountryCode): Promise<Listing[]> {
    return listingStore().then((store) => store.listByCountry(country));
  },
  listByCategory(country: CountryCode, category: CategoryKey): Promise<Listing[]> {
    return listingStore().then((store) => store.listByCategory(country, category));
  },
  getBySlug(country: CountryCode, slug: string): Promise<Listing | null> {
    return listingStore().then((store) => store.getBySlug(country, slug));
  },
  getUser(id: string): Promise<User | null> {
    return listingStore().then((store) => store.getUser(id));
  },
  getUserByHandle(country: CountryCode, handle: string): Promise<User | null> {
    return listingStore().then((store) => store.getUserByHandle(country, handle));
  },
  listSellers(country: CountryCode): Promise<User[]> {
    return listingStore().then((store) => store.listSellers(country));
  },
  search(country: CountryCode, query: string): Promise<Listing[]> {
    return listingStore().then((store) => store.search(country, query));
  },
};

/**
 * Sample reviews stay non-first-party until a repository enforces
 * one review per completed order. Both stores honour that flag.
 */
export const reviewsRepo: ReviewRepository = {
  areFirstParty(): Promise<boolean> {
    return reviewStore().then((store) => store.areFirstParty());
  },
  listBySeller(sellerId: string): Promise<Review[]> {
    return reviewStore().then((store) => store.listBySeller(sellerId));
  },
  summariesFor(sellerIds: string[]): Promise<Record<string, RatingSummary>> {
    return reviewStore().then((store) => store.summariesFor(sellerIds));
  },
};
