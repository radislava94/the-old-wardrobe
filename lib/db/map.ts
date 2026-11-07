import { isCountry, type CountryCode } from "../countries";
import type {
  CategoryKey,
  CurrencyCode,
  Listing,
  ListingStatus,
  PhotoKey,
  Review,
  StarScore,
  User,
} from "../types";
import type { listings, profiles, reviews } from "./schema";

const CATEGORIES = new Set<CategoryKey>([
  "dresses",
  "coats",
  "knitwear",
  "denim",
  "accessories",
]);

const CURRENCIES = new Set<CurrencyCode>(["MKD", "EUR", "RSD", "ALL"]);

const PHOTOS = new Set<PhotoKey>([
  "beanie",
  "bomber",
  "denim",
  "floral-dress",
  "leather",
  "maxi-dress",
  "poncho",
  "trench",
]);

function countryOf(value: string): CountryCode {
  if (!isCountry(value)) throw new Error(`Unknown country in database: ${value}`);
  return value;
}

function categoryOf(value: string): CategoryKey {
  if (!CATEGORIES.has(value as CategoryKey)) {
    throw new Error(`Unknown category in database: ${value}`);
  }
  return value as CategoryKey;
}

function currencyOf(value: string): CurrencyCode {
  if (!CURRENCIES.has(value as CurrencyCode)) {
    throw new Error(`Unknown currency in database: ${value}`);
  }
  return value as CurrencyCode;
}

function statusOf(value: string): ListingStatus {
  if (value !== "available" && value !== "sold") {
    throw new Error(`Unknown listing status in database: ${value}`);
  }
  return value;
}

function photoOf(value: string): PhotoKey {
  if (!PHOTOS.has(value as PhotoKey)) {
    throw new Error(`Unknown photo in database: ${value}`);
  }
  return value as PhotoKey;
}

function starsOf(value: number): StarScore {
  if (value !== 1 && value !== 2 && value !== 3 && value !== 4 && value !== 5) {
    throw new Error(`Review stars out of range: ${value}`);
  }
  return value;
}

export function toUser(row: typeof profiles.$inferSelect): User {
  return {
    id: row.id,
    handle: row.handle,
    name: row.name,
    city: row.city,
    country: countryOf(row.country),
    memberSince: row.memberSince,
    bio: row.bio,
    sellerKind: row.sellerKind === "business" ? "business" : "private",
    phoneVerified: row.phoneVerified,
  };
}

export function toListing(row: typeof listings.$inferSelect): Listing {
  return {
    id: row.id,
    slug: row.slug,
    country: countryOf(row.country),
    sellerId: row.sellerId,
    title: row.title,
    description: row.description,
    category: categoryOf(row.category),
    priceAmount: row.priceAmount,
    currency: currencyOf(row.currency),
    size: row.size,
    era: row.era,
    condition: row.condition,
    city: row.city,
    status: row.visibility === "sold" || row.status === "sold" ? "sold" : "available",
    photo: photoOf(row.photo),
    createdAt: row.createdAt,
    visibility: row.visibility === "draft" || row.visibility === "sold" ? row.visibility : "public",
    photosCompliant: row.photosCompliant,
    moderation:
      row.moderation === "queued" || row.moderation === "kept" || row.moderation === "hidden"
        ? row.moderation
        : "clear",
    ...(row.brand ? { brand: row.brand } : {}),
    ...(row.photosCompliant ? {} : row.photoUrl ? { photoUrl: row.photoUrl } : {}),
    freeShipping: row.freeShipping,
    freeShippingOver: row.freeShippingOver,
  };
}

export function toReview(row: typeof reviews.$inferSelect): Review {
  return {
    id: row.id,
    sellerId: row.sellerId,
    buyerId: row.buyerId,
    orderId: row.orderId,
    listingId: row.listingId,
    stars: starsOf(row.stars),
    comment: row.comment,
    createdAt: row.createdAt,
    country: countryOf(row.country),
  };
}
