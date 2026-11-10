import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "../db/client";
import { orderItems, orders, reviews } from "../db/schema";

export type ReviewableOrder = {
  id: string;
  items: { listingId: string; title: string }[];
};

/**
 * Paid orders only. Refused, cancelled, and pending orders do not unlock a review.
 * An order that already has a review is left out. One review per order.
 */
export async function unreviewedPaidOrders(
  buyerId: string,
  sellerId?: string,
): Promise<ReviewableOrder[]> {
  const db = getDb();
  const rows = await db
    .select({ id: orders.id })
    .from(orders)
    .where(
      sellerId
        ? and(eq(orders.buyerId, buyerId), eq(orders.codStatus, "paid"), eq(orders.sellerId, sellerId))
        : and(eq(orders.buyerId, buyerId), eq(orders.codStatus, "paid")),
    );
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id);
  const taken = await db
    .select({ orderId: reviews.orderId })
    .from(reviews)
    .where(inArray(reviews.orderId, ids));
  const used = new Set(taken.map((row) => row.orderId));
  const open = ids.filter((id) => !used.has(id));
  if (open.length === 0) return [];
  const items = await db
    .select({
      orderId: orderItems.orderId,
      listingId: orderItems.listingId,
      title: orderItems.title,
    })
    .from(orderItems)
    .where(inArray(orderItems.orderId, open));
  return open.map((id) => ({
    id,
    items: items
      .filter((item) => item.orderId === id)
      .map((item) => ({ listingId: item.listingId, title: item.title })),
  }));
}

export async function reviewExists(orderId: string): Promise<boolean> {
  const rows = await getDb()
    .select({ orderId: reviews.orderId })
    .from(reviews)
    .where(eq(reviews.orderId, orderId))
    .limit(1);
  return rows.length > 0;
}
