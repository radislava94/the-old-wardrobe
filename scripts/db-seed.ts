import { inArray, sql } from "drizzle-orm";
import { listings as catalogListings, users } from "../lib/data/catalog";
import { reviews as catalogReviews } from "../lib/data/reviews-catalog";
import { closeDb, getDb } from "../lib/db/client";
import { listings, profiles, reviews } from "../lib/db/schema";
import "./load-env";

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "DATABASE_URL is not set. Copy .env.example to .env.local and start Postgres with docker compose up -d.",
    );
    process.exit(1);
  }

  const db = getDb();

  await db
    .insert(profiles)
    .values(
      users.map((user) => ({
        id: user.id,
        handle: user.handle,
        name: user.name,
        city: user.city,
        country: user.country,
        memberSince: user.memberSince,
        bio: user.bio,
      })),
    )
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        handle: sql`excluded.handle`,
        name: sql`excluded.name`,
        city: sql`excluded.city`,
        country: sql`excluded.country`,
        memberSince: sql`excluded.member_since`,
        bio: sql`excluded.bio`,
      },
    });

  await db
    .insert(listings)
    .values(
      catalogListings.map((listing) => ({
        id: listing.id,
        slug: listing.slug,
        country: listing.country,
        sellerId: listing.sellerId,
        title: listing.title,
        description: listing.description,
        category: listing.category,
        priceAmount: listing.priceAmount,
        currency: listing.currency,
        size: listing.size,
        era: listing.era,
        condition: listing.condition,
        city: listing.city,
        status: listing.status,
        photo: listing.photo,
        createdAt: listing.createdAt,
        brand: listing.brand ?? null,
      })),
    )
    .onConflictDoUpdate({
      target: listings.id,
      set: {
        slug: sql`excluded.slug`,
        country: sql`excluded.country`,
        sellerId: sql`excluded.seller_id`,
        title: sql`excluded.title`,
        description: sql`excluded.description`,
        category: sql`excluded.category`,
        priceAmount: sql`excluded.price_amount`,
        currency: sql`excluded.currency`,
        size: sql`excluded.size`,
        era: sql`excluded.era`,
        condition: sql`excluded.condition`,
        city: sql`excluded.city`,
        status: sql`excluded.status`,
        photo: sql`excluded.photo`,
        createdAt: sql`excluded.created_at`,
        brand: sql`excluded.brand`,
      },
    });

  await db
    .insert(reviews)
    .values(
      catalogReviews.map((review) => ({
        id: review.id,
        sellerId: review.sellerId,
        buyerId: review.buyerId,
        orderId: review.orderId,
        listingId: review.listingId,
        stars: review.stars,
        comment: review.comment,
        createdAt: review.createdAt,
        country: review.country,
        firstParty: false,
      })),
    )
    .onConflictDoUpdate({
      target: reviews.id,
      set: {
        sellerId: sql`excluded.seller_id`,
        buyerId: sql`excluded.buyer_id`,
        orderId: sql`excluded.order_id`,
        listingId: sql`excluded.listing_id`,
        stars: sql`excluded.stars`,
        comment: sql`excluded.comment`,
        createdAt: sql`excluded.created_at`,
        country: sql`excluded.country`,
        firstParty: sql`excluded.first_party`,
      },
    });

  const listingIds = catalogListings.map((listing) => listing.id);
  const reviewIds = catalogReviews.map((review) => review.id);
  const userIds = users.map((user) => user.id);
  const [storedListings, storedReviews, storedUsers] = await Promise.all([
    db.select({ id: listings.id }).from(listings).where(inArray(listings.id, listingIds)),
    db.select({ id: reviews.id }).from(reviews).where(inArray(reviews.id, reviewIds)),
    db.select({ id: profiles.id }).from(profiles).where(inArray(profiles.id, userIds)),
  ]);

  if (storedUsers.length !== users.length) {
    throw new Error(`Seeded ${storedUsers.length} profiles, expected ${users.length}.`);
  }
  if (storedListings.length !== catalogListings.length) {
    throw new Error(
      `Seeded ${storedListings.length} listings, expected ${catalogListings.length}.`,
    );
  }
  if (storedReviews.length !== catalogReviews.length) {
    throw new Error(`Seeded ${storedReviews.length} reviews, expected ${catalogReviews.length}.`);
  }

  console.log(
    `Seeded ${storedUsers.length} profiles, ${storedListings.length} listings, ${storedReviews.length} reviews.`,
  );
  await closeDb();
}

main().catch(async (error: unknown) => {
  console.error(error);
  await closeDb();
  process.exit(1);
});
