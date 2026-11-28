import type { RatingSummary } from "../types";
import { emptySummary } from "../ratings";
import type { ReviewRepository } from "./review-repository";

/**
 * In-memory stand-in. The sample sentences in the catalog are not
 * buyer ratings, so this store shows none. `areFirstParty` stays false.
 */
export class MemoryReviewRepository implements ReviewRepository {
  async areFirstParty(): Promise<boolean> {
    return false;
  }

  async listBySeller(_sellerId: string) {
    return [];
  }

  async summariesFor(sellerIds: string[]): Promise<Record<string, RatingSummary>> {
    const summaries: Record<string, RatingSummary> = {};
    for (const id of sellerIds) summaries[id] = emptySummary();
    return summaries;
  }
}
