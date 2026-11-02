import type { CountryCode } from "./countries";

export type CurrencyCode = "MKD" | "EUR" | "RSD" | "ALL";

export type CategoryKey =
  | "dresses"
  | "coats"
  | "knitwear"
  | "denim"
  | "accessories";

export type ListingStatus = "available" | "sold";

export type PhotoKey =
  | "beanie"
  | "bomber"
  | "denim"
  | "floral-dress"
  | "leather"
  | "maxi-dress"
  | "poncho"
  | "trench";

/**
 * One account buys and sells. A listing points at `sellerId`.
 * A review points at the same User type twice: `sellerId` and `buyerId`.
 */
export type User = {
  id: string;
  /** URL slug, unique inside the user's country. e.g. `ana-petrova`. */
  handle: string;
  name: string;
  city: string;
  country: CountryCode;
  /** ISO date (YYYY-MM-DD). */
  memberSince: string;
  bio: string;
};

/**
 * A buyer's rating of a seller after a completed order.
 * Whole stars only. The average shown on the profile is derived from these.
 *
 * Write rule, once accounts exist: the buyer must have a completed order
 * from that seller, and may leave one review per order. The placeholder
 * repository does not accept new reviews.
 */
export type Review = {
  id: string;
  sellerId: string;
  buyerId: string;
  /** Completed order this review belongs to. Unique. */
  orderId: string;
  /** The listing on that order. */
  listingId: string;
  stars: 1 | 2 | 3 | 4 | 5;
  comment: string;
  /** ISO date (YYYY-MM-DD). */
  createdAt: string;
  country: CountryCode;
};

export type StarScore = 1 | 2 | 3 | 4 | 5;

export type RatingSummary = {
  /** Mean of `stars`. 0 when there are no reviews. */
  average: number;
  count: number;
  breakdown: Record<StarScore, number>;
};

export type Listing = {
  id: string;
  slug: string;
  country: CountryCode;
  sellerId: string;
  title: string;
  description: string;
  category: CategoryKey;
  /**
   * Amount in `currency`. That currency is the seller's currency
   * (the currency of their country). Display code converts it into
   * the currency of the country section being viewed.
   */
  priceAmount: number;
  currency: CurrencyCode;
  size: string;
  /** Short card line, already in the listing's language. */
  era: string;
  /** Already in the listing's language. */
  condition: string;
  city: string;
  status: ListingStatus;
  photo: PhotoKey;
  /** ISO date (YYYY-MM-DD). */
  createdAt: string;
  brand?: string;
};
