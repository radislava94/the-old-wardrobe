"use client";

import { useState } from "react";
import { FeeLines } from "@/components/fee-lines";
import { receiveAmount, type FeePreviewCopy } from "@/components/sell-form";
import { commissionConfig } from "@/lib/commission/config";
import { formatStoredMoney } from "@/lib/commission/format";
import { saleQuote } from "@/lib/commission/quote";
import type { CurrencyCode } from "@/lib/types";

/** Price quote on the sell page before sign-in. It does not publish a listing. */
export function FeeQuote({
  currency,
  freeSalesLeft,
  priceLabel,
  shippingLabel,
  fees,
}: {
  currency: CurrencyCode;
  freeSalesLeft: number;
  priceLabel: string;
  shippingLabel: string;
  fees: FeePreviewCopy;
}) {
  const [price, setPrice] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const amount = Number(price);
  const quoted =
    Number.isFinite(amount) && amount > 0
      ? saleQuote({ merchandiseTotal: amount, currency, freeSalesLeft, freeShipping })
      : null;

  return (
    <div className="sell-form fee-quote">
      <label>
        <span>{priceLabel}</span>
        <input
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
      </label>
      <label className="choice">
        <input
          type="checkbox"
          checked={freeShipping}
          onChange={(event) => setFreeShipping(event.target.checked)}
        />
        <span>{shippingLabel}</span>
      </label>
      <FeeLines
        freeLeft={fees.freeLeft}
        youReceive={
          quoted
            ? receiveAmount(
                fees.youReceivePattern,
                formatStoredMoney(quoted.sellerPayoutAmount, quoted.currency),
              )
            : fees.enterPrice
        }
        platformFee={quoted ? formatStoredMoney(quoted.commissionAmount, quoted.currency) : undefined}
        cap={formatStoredMoney(quoted?.capAmount ?? commissionConfig.cap[currency], currency)}
        courier={quoted ? (freeShipping ? fees.courierSeller : fees.courierBuyer) : undefined}
        reason={quoted ? fees.reasons[quoted.rateReason] : undefined}
        labels={{
          platformFee: fees.platformFee,
          cap: fees.cap,
          courierCharge: fees.courierCharge,
        }}
      />
    </div>
  );
}
