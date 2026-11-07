import { eq, inArray } from "drizzle-orm";
import { getDb } from "../db/client";
import { toReview } from "../db/map";
import { reviews } from "../db/schema";
import { emptySummary, summarize } from "../ratings";
import type { RatingSummary, Review } from "../types";
import type { ReviewRepository } from "./review-repository";

/**
 * Postgres reviews. Seeded rows are sample copy (`first_party` false),
 * so `areFirstParty()` stays false until every stored review was
 * collected from a buyer. A paid order can store one review. Refused
 * and cancelled orders cannot. Product pages still omit aggregateRating.
 */
export class PostgresReviewRepository implements ReviewRepository {
  async areFirstParty(): Promise<boolean> {
    const rows = await getDb().select({ firstParty: reviews.firstParty }).from(reviews);
    if (rows.length === 0) return false;
    return rows.every((row) => row.firstParty);
  }

  async listBySeller(sellerId: string): Promise<Review[]> {
    const rows = await getDb()
      .select()
      .from(reviews)
      .where(eq(reviews.sellerId, sellerId));
    return rows
      .map(toReview)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async summariesFor(sellerIds: string[]): Promise<Record<string, RatingSummary>> {
    const wanted = [...new Set(sellerIds)];
    const summaries: Record<string, RatingSummary> = {};
    for (const id of wanted) summaries[id] = emptySummary();
    if (wanted.length === 0) return summaries;

    const rows = await getDb()
      .select()
      .from(reviews)
      .where(inArray(reviews.sellerId, wanted));
    const grouped = new Map<string, Review[]>();
    for (const id of wanted) grouped.set(id, []);
    for (const review of rows.map(toReview)) {
      grouped.get(review.sellerId)?.push(review);
    }
    for (const id of wanted) {
      summaries[id] = summarize(grouped.get(id) ?? []);
    }
    return summaries;
  }
}
