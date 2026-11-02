import type { RatingSummary, Review } from "../types";

/**
 * Storage seam for seller reviews.
 *
 * Write rule for a future Postgres implementation — do not relax it:
 * a review can be stored only when the buyer has a completed order
 * from that seller, and only one review is allowed per order.
 * Buyers rate the seller, not the marketplace.
 *
 * `areFirstParty()` stays false while the rows are sample copy.
 * Google's review-snippet guidelines allow `aggregateRating` only for
 * ratings the site collected itself. Placeholder text is not that,
 * so pages must omit `aggregateRating` until this returns true.
 * Seller ratings are never copied onto Product JSON-LD.
 */
export interface ReviewRepository {
  areFirstParty(): Promise<boolean>;
  listBySeller(sellerId: string): Promise<Review[]>;
  summariesFor(sellerIds: string[]): Promise<Record<string, RatingSummary>>;
}
