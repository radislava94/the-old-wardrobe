import type { CurrencyCode } from "../types";
import { commissionConfig, launchPromoActive, type RateReason } from "./config";

export type PricedCommission = {
  merchandiseTotal: number;
  commissionAmount: number;
  sellerPayoutAmount: number;
  commissionRate: number;
  thresholdAmount: number;
  capAmount: number;
  rateReason: RateReason;
  currency: CurrencyCode;
};

function roundMoney(amount: number, currency: CurrencyCode): number {
  if (currency === "EUR") return Math.round(amount * 100) / 100;
  return Math.round(amount);
}

/**
 * Check order: launch promo, then welcome sale, then under threshold, then 5% with the cap.
 * Shipping is not part of the merchandise total.
 * A welcome sale is used only when the promo is off and the total is at or above the threshold.
 */
export function priceCommission(input: {
  merchandiseTotal: number;
  currency: CurrencyCode;
  /** Completed orders already marked welcome_sale. Refused and cancelled are not in this count. */
  completedWelcomeSales: number;
  today?: string;
}): PricedCommission {
  const currency = input.currency;
  const merchandiseTotal = roundMoney(input.merchandiseTotal, currency);
  const thresholdAmount = commissionConfig.threshold[currency];
  const capAmount = commissionConfig.cap[currency];
  const base = {
    merchandiseTotal,
    thresholdAmount,
    capAmount,
    currency,
  };

  if (launchPromoActive(input.today)) {
    return {
      ...base,
      commissionAmount: 0,
      sellerPayoutAmount: merchandiseTotal,
      commissionRate: 0,
      rateReason: "launch_promo",
    };
  }

  if (
    input.completedWelcomeSales < commissionConfig.welcomeSales &&
    merchandiseTotal >= thresholdAmount
  ) {
    return {
      ...base,
      commissionAmount: 0,
      sellerPayoutAmount: merchandiseTotal,
      commissionRate: 0,
      rateReason: "welcome_sale",
    };
  }

  if (merchandiseTotal < thresholdAmount) {
    return {
      ...base,
      commissionAmount: 0,
      sellerPayoutAmount: merchandiseTotal,
      commissionRate: 0,
      rateReason: "under_threshold",
    };
  }

  const uncapped = roundMoney(merchandiseTotal * commissionConfig.rate, currency);
  const commissionAmount = Math.min(uncapped, capAmount);
  return {
    ...base,
    commissionAmount,
    sellerPayoutAmount: roundMoney(merchandiseTotal - commissionAmount, currency),
    commissionRate: commissionConfig.rate,
    rateReason: "standard",
  };
}
