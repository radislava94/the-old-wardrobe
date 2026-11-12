import { eq, or } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { profileForAuthUser } from "@/lib/auth/profile";
import { getDb } from "@/lib/db/client";
import { selectListingRows } from "@/lib/data/postgres";
import { account, listings, reviews, session } from "@/lib/db/schema";

export const runtime = "nodejs";

export async function GET() {
  const current = await getSession();
  if (!current) return new Response("Sign in required", { status: 401 });

  const db = getDb();
  const profile = await profileForAuthUser(current.user.id);
  const [accounts, sessions, ownedListings, relatedReviews] = await Promise.all([
    db
      .select({
        providerId: account.providerId,
        accountId: account.accountId,
        createdAt: account.createdAt,
      })
      .from(account)
      .where(eq(account.userId, current.user.id)),
    db
      .select({
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })
      .from(session)
      .where(eq(session.userId, current.user.id)),
    profile
      ? selectListingRows(() => eq(listings.sellerId, profile.id))
      : Promise.resolve([]),
    profile
      ? db
          .select()
          .from(reviews)
          .where(or(eq(reviews.sellerId, profile.id), eq(reviews.buyerId, profile.id)))
      : Promise.resolve([]),
  ]);

  const body = {
    exportedAt: new Date().toISOString(),
    user: {
      id: current.user.id,
      name: current.user.name,
      email: current.user.email,
      emailVerified: current.user.emailVerified,
    },
    profile,
    accounts,
    sessions,
    listings: ownedListings,
    reviews: relatedReviews,
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="old-wardrobe-data.json"',
      "Cache-Control": "no-store",
    },
  });
}
