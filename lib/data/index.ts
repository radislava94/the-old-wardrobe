import { MemoryListingRepository } from "./memory";
import { MemoryReviewRepository } from "./review-memory";
import type { ListingRepository } from "./repository";
import type { ReviewRepository } from "./review-repository";

export type { ListingRepository } from "./repository";
export type { ReviewRepository } from "./review-repository";

/** Replace the class, not the call sites, when Postgres (Neon) arrives. */
export const listingsRepo: ListingRepository = new MemoryListingRepository();

/**
 * Sample reviews. `areFirstParty()` is false until a repository enforces
 * one review per completed order from that seller.
 */
export const reviewsRepo: ReviewRepository = new MemoryReviewRepository();
