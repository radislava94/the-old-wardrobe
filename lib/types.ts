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
 * One account buys and sells. There is no separate seller profile:
 * a listing points at `sellerId`, and a future order will point at
 * the same User as the buyer.
 */
export type User = {
  id: string;
  name: string;
  city: string;
  country: CountryCode;
  /** ISO date (YYYY-MM-DD). */
  memberSince: string;
  bio: string;
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
