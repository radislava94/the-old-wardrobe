import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export { account, session, user, verification } from "./auth-schema";

/**
 * Marketplace people. One row buys and sells.
 * Auth accounts (added with Better Auth) point here; the seeded
 * sellers and buyers have no login.
 */
export const profiles = pgTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    handle: text("handle").notNull(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull(),
    memberSince: date("member_since", { mode: "string" }).notNull(),
    bio: text("bio").notNull(),
    /** Set when this person signs in. Seeded sellers stay null. */
    authUserId: text("auth_user_id").unique(),
    /** Private persons and businesses use the same account. */
    sellerKind: text("seller_kind").notNull().default("private"),
    /** Placeholder only. Nothing sends an SMS. */
    phoneVerified: boolean("phone_verified").notNull().default(false),
  },
  (table) => [
    uniqueIndex("profiles_country_handle").on(table.country, table.handle),
    check(
      "profiles_country",
      sql`${table.country} in ('mk', 'bg', 'sr-rs', 'sq-al')`,
    ),
    check("profiles_seller_kind", sql`${table.sellerKind} in ('private', 'business')`),
  ],
);

export const listings = pgTable(
  "listings",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    country: text("country").notNull(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    priceAmount: integer("price_amount").notNull(),
    currency: text("currency").notNull(),
    size: text("size").notNull(),
    era: text("era").notNull(),
    condition: text("condition").notNull(),
    city: text("city").notNull(),
    status: text("status").notNull(),
    photo: text("photo").notNull(),
    createdAt: date("created_at", { mode: "string" }).notNull(),
    brand: text("brand"),
    photoUrl: text("photo_url"),
    /** This piece ships free. Separate from a bundle threshold. */
    freeShipping: boolean("free_shipping").notNull().default(false),
    /** Bundle total, in `currency`, at which shipping becomes free. */
    freeShippingOver: integer("free_shipping_over"),
  },
  (table) => [
    uniqueIndex("listings_country_slug").on(table.country, table.slug),
    index("listings_country_created").on(table.country, table.createdAt),
    index("listings_seller").on(table.sellerId),
    check(
      "listings_country",
      sql`${table.country} in ('mk', 'bg', 'sr-rs', 'sq-al')`,
    ),
    check(
      "listings_currency",
      sql`${table.currency} in ('MKD', 'EUR', 'RSD', 'ALL')`,
    ),
    check(
      "listings_category",
      sql`${table.category} in ('dresses', 'coats', 'knitwear', 'denim', 'accessories')`,
    ),
    check("listings_status", sql`${table.status} in ('available', 'sold')`),
    check("listings_price_positive", sql`${table.priceAmount} > 0`),
    check(
      "listings_free_shipping_over",
      sql`${table.freeShippingOver} is null or ${table.freeShippingOver} > 0`,
    ),
  ],
);

/**
 * `firstParty` is false for the seeded sample copy. Pages may add
 * aggregateRating only when every stored review was collected from a buyer.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: text("id").primaryKey(),
    sellerId: text("seller_id")
      .notNull()
      .references(() => profiles.id),
    buyerId: text("buyer_id")
      .notNull()
      .references(() => profiles.id),
    orderId: text("order_id").notNull(),
    listingId: text("listing_id")
      .notNull()
      .references(() => listings.id),
    stars: integer("stars").notNull(),
    comment: text("comment").notNull(),
    createdAt: date("created_at", { mode: "string" }).notNull(),
    country: text("country").notNull(),
    firstParty: boolean("first_party").notNull().default(false),
  },
  (table) => [
    uniqueIndex("reviews_order_id").on(table.orderId),
    index("reviews_seller").on(table.sellerId),
    check("reviews_stars_range", sql`${table.stars} between 1 and 5`),
    check(
      "reviews_country",
      sql`${table.country} in ('mk', 'bg', 'sr-rs', 'sq-al')`,
    ),
  ],
);
