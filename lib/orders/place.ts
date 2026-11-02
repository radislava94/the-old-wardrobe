import { and, eq, inArray, sql } from "drizzle-orm";
import type { CountryCode } from "../countries";
import { commissionConfig } from "../commission/config";
import { priceCommission } from "../commission/price";
import { getDb } from "../db/client";
import { listings, orderItems, orders } from "../db/schema";
import { sendEmail } from "../mail";
import { absoluteUrl } from "../seo";
import type { CurrencyCode } from "../types";

export async function completedWelcomeSales(sellerId: string): Promise<number> {
  const rows = await getDb()
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(
      and(
        eq(orders.sellerId, sellerId),
        eq(orders.codStatus, "paid"),
        eq(orders.rateReason, "welcome_sale"),
      ),
    );
  return Number(rows[0]?.count ?? 0);
}

export async function placeCodOrder(input: {
  buyerId: string;
  listingIds: string[];
  courierName: string;
  country: CountryCode;
}) {
  const ids = [...new Set(input.listingIds)];
  if (ids.length === 0) throw new Error("empty");
  const db = getDb();
  const rows = await db.select().from(listings).where(inArray(listings.id, ids));
  if (rows.length !== ids.length) throw new Error("missing");
  const sellerId = rows[0]?.sellerId;
  if (!sellerId || rows.some((row) => row.sellerId !== sellerId)) throw new Error("seller");
  if (sellerId === input.buyerId) throw new Error("self");
  const currency = rows[0]?.currency as CurrencyCode;
  if (rows.some((row) => row.currency !== currency)) throw new Error("currency");
  if (rows.some((row) => row.status !== "available")) throw new Error("sold");

  const merchandiseTotal = rows.reduce((sum, row) => sum + row.priceAmount, 0);
  const allFree = rows.every((row) => row.freeShipping);
  const priced = priceCommission({
    merchandiseTotal,
    currency,
    completedWelcomeSales: await completedWelcomeSales(sellerId),
  });

  const id = `ord_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
  await db.insert(orders).values({
    id,
    buyerId: input.buyerId,
    sellerId,
    merchandiseTotal: priced.merchandiseTotal.toFixed(2),
    shippingAmount: allFree ? "0.00" : null,
    shippingPaidBy: allFree ? "seller" : "buyer",
    buyerCashDue: priced.merchandiseTotal.toFixed(2),
    commissionAmount: priced.commissionAmount.toFixed(2),
    sellerPayoutAmount: priced.sellerPayoutAmount.toFixed(2),
    currency,
    commissionRate: priced.commissionRate.toFixed(4),
    thresholdAmount: priced.thresholdAmount.toFixed(2),
    capAmount: priced.capAmount.toFixed(2),
    rateReason: priced.rateReason,
    remitTo: commissionConfig.remitTo,
    codStatus: "pending",
    courierName: input.courierName,
    createdAt: new Date().toISOString().slice(0, 10),
  });
  await db.insert(orderItems).values(
    rows.map((row) => ({
      orderId: id,
      listingId: row.id,
      title: row.title,
      priceAmount: row.priceAmount.toFixed(2),
    })),
  );

  const sellerEmail = await sellerAddress(sellerId);
  if (sellerEmail) {
    await sendEmail({
      to: sellerEmail,
      subject: `Order ${id}`,
      text: `A buyer placed a cash-on-delivery order.\nThe buyer pays the courier. No platform fee is added to that cash.\n${absoluteUrl(`/${input.country}/order/${id}`)}\n`,
    });
  }
  return id;
}

async function sellerAddress(sellerId: string): Promise<string | null> {
  const { profiles, user } = await import("../db/schema");
  const people = await getDb()
    .select({ authUserId: profiles.authUserId, id: profiles.id })
    .from(profiles)
    .where(eq(profiles.id, sellerId));
  const person = people[0];
  if (!person) return null;
  const emails = await getDb()
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, person.authUserId ?? person.id));
  return emails[0]?.email ?? null;
}

export async function setOrderStatus(input: {
  orderId: string;
  actorId: string;
  next: "paid" | "refused" | "cancelled";
}) {
  const db = getDb();
  const rows = await db.select().from(orders).where(eq(orders.id, input.orderId));
  const order = rows[0];
  if (!order || order.codStatus !== "pending") return false;
  const seller = input.next !== "cancelled" && order.sellerId === input.actorId;
  const buyer = input.next === "cancelled" && order.buyerId === input.actorId;
  if (!seller && !buyer) return false;
  const zeroFee = input.next === "refused" || input.next === "cancelled";
  await db
    .update(orders)
    .set({
      codStatus: input.next,
      ...(zeroFee
        ? {
            commissionAmount: "0.00",
            sellerPayoutAmount: order.merchandiseTotal,
          }
        : {}),
    })
    .where(eq(orders.id, order.id));
  return true;
}
