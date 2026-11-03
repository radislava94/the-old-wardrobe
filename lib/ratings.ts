import type { RatingSummary, StarScore } from "./types";

const scores: StarScore[] = [1, 2, 3, 4, 5];

export function emptySummary(): RatingSummary {
  return {
    average: 0,
    count: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

export function summarize(reviews: { stars: StarScore }[]): RatingSummary {
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<StarScore, number>;
  for (const review of reviews) breakdown[review.stars] += 1;
  const count = reviews.length;
  const total = reviews.reduce((sum, review) => sum + review.stars, 0);
  return {
    average: count === 0 ? 0 : total / count,
    count,
    breakdown,
  };
}

/** Nearest half star, for the inked row. 0 when nobody has reviewed. */
export function starFill(summary: RatingSummary): number {
  if (summary.count === 0) return 0;
  return Math.round(summary.average * 2) / 2;
}

export function formatRating(average: number, locale: string): string {
  return average.toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function starScores(): StarScore[] {
  return [...scores].reverse();
}
