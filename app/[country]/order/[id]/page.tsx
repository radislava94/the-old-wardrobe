import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { updateOrderStatus } from "@/lib/orders/actions";
import { profileForAuthUser } from "@/lib/auth/profile";
import { getSession } from "@/lib/auth/session";
import { isCountry } from "@/lib/countries";
import { getDb } from "@/lib/db/client";
import { orderItems, orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getDictionary } from "@/lib/i18n";
import { FeeLines } from "@/components/fee-lines";
import { formatStoredMoney } from "@/lib/commission/format";
import { formatMoney } from "@/lib/money";
import { signInPath } from "@/lib/paths";
import type { CurrencyCode } from "@/lib/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Order",
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ country: string; id: string }>;
}) {
  const { country: raw, id } = await params;
  if (!isCountry(raw)) notFound();
  const session = await getSession();
  if (!session) redirect(signInPath(raw));
  const profile = await profileForAuthUser(session.user.id);
  if (!profile) redirect(signInPath(raw));
  const rows = await getDb().select().from(orders).where(eq(orders.id, id));
  const order = rows[0];
  if (!order || (order.buyerId !== profile.id && order.sellerId !== profile.id)) notFound();
  const items = await getDb().select().from(orderItems).where(eq(orderItems.orderId, id));
  const dict = getDictionary(raw);
  const currency = order.currency as CurrencyCode;
  const cash = formatMoney(Number(order.buyerCashDue), raw);
  const statusLabel = {
    pending: dict.order.pending,
    paid: dict.order.paid,
    refused: dict.order.refused,
    cancelled: dict.order.cancelled,
  }[order.codStatus] ?? order.codStatus;

  return (
    <section className="page-block">
      <div className="wrap sell-layout">
        <p className="eyebrow">{dict.order.yourOrders}</p>
        <h1>{id}</h1>
        <p className="lead">
          {statusLabel}
          {order.courierName ? ` · ${order.courierName}` : ""}
        </p>
        <ul className="own-listings">
          {items.map((item) => (
            <li key={item.listingId}>
              <span>{item.title}</span>
              <span>{formatMoney(Number(item.priceAmount), raw)}</span>
            </li>
          ))}
        </ul>
        <p>
          <strong>{dict.order.buyerPays}:</strong> {cash} {currency}
        </p>
        <p className="hint">{dict.order.noFee}</p>
        <FeeLines
          youReceive={
            order.sellerId === profile.id
              ? dict.fees.youReceive(formatStoredMoney(Number(order.sellerPayoutAmount), currency))
              : dict.fees.sellerReceives(formatStoredMoney(Number(order.sellerPayoutAmount), currency))
          }
          platformFee={formatStoredMoney(Number(order.commissionAmount), currency)}
          cap={formatStoredMoney(Number(order.capAmount), currency)}
          courier={
            order.shippingAmount != null && Number(order.shippingAmount) > 0
              ? formatStoredMoney(Number(order.shippingAmount), currency)
              : order.shippingPaidBy === "seller"
                ? dict.fees.courierSeller
                : dict.fees.courierBuyer
          }
          reason={
            order.rateReason in dict.fees.reasons
              ? dict.fees.reasons[order.rateReason as keyof typeof dict.fees.reasons]
              : undefined
          }
          labels={{
            platformFee: dict.fees.platformFee,
            cap: dict.fees.cap,
            courierCharge: dict.fees.courierCharge,
          }}
        />
        <p className="hint">
          {order.shippingPaidBy === "seller" ? dict.order.shippingFree : dict.order.shippingExtra}
        </p>
        <p className="hint">{dict.order.remit}</p>
        {order.codStatus === "pending" && order.sellerId === profile.id ? (
          <div className="sell-row">
            <form action={updateOrderStatus}>
              <input type="hidden" name="country" value={raw} />
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="next" value="paid" />
              <button className="btn btn-primary" type="submit">
                {dict.order.markPaid}
              </button>
            </form>
            <form action={updateOrderStatus}>
              <input type="hidden" name="country" value={raw} />
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="next" value="refused" />
              <button className="btn btn-ghost" type="submit">
                {dict.order.markRefused}
              </button>
            </form>
          </div>
        ) : null}
        {order.codStatus === "pending" && order.buyerId === profile.id ? (
          <form action={updateOrderStatus}>
            <input type="hidden" name="country" value={raw} />
            <input type="hidden" name="orderId" value={order.id} />
            <input type="hidden" name="next" value="cancelled" />
            <button className="btn btn-ghost" type="submit">
              {dict.order.cancel}
            </button>
          </form>
        ) : null}
        <p className="hint">
          <Link href={`/${raw}/account`}>{dict.account.nav}</Link>
        </p>
      </div>
    </section>
  );
}
