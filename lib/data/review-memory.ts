import type { RatingSummary } from "../types";
import { emptySummary, summarize } from "../ratings";
import { reviews } from "./reviews-catalog";
import type { ReviewRepository } from "./review-repository";

/**
 * In-memory stand-in. Reads the sample reviews and never writes.
 * `areFirstParty` is false: this copy was not collected from buyers.
 */
export class MemoryReviewRepository implements ReviewRepository {
  async areFirstParty(): Promise<boolean> {
    return false;
  }

  async listBySeller(sellerId: string) {
    return reviews
      .filter((review) => review.sellerId === sellerId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async summariesFor(sellerIds: string[]): Promise<Record<string, RatingSummary>> {
    const wanted = new Set(sellerIds);
    const grouped = new Map<string, typeof reviews>();
    for (const id of wanted) grouped.set(id, []);
    for (const review of reviews) {
      const bucket = grouped.get(review.sellerId);
      if (bucket) bucket.push(review);
    }
    const summaries: Record<string, RatingSummary> = {};
    for (const id of wanted) {
      summaries[id] = summarize(grouped.get(id) ?? []);
    }
    for (const id of sellerIds) {
      summaries[id] ??= emptySummary();
    }
    return summaries;
  }
}
