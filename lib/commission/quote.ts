import type { CurrencyCode } from "../types";
import { commissionConfig } from "./config";
import { priceCommission, type PricedCommission } from "./price";

/** Same check the order uses. Shipping is not part of the merchandise total. */
export function saleQuote(input: {
  merchandiseTotal: number;
  currency: CurrencyCode;
  freeSalesLeft: number;
  freeShipping: boolean;
}): PricedCommission & { freeShipping: boolean } {
  const priced = priceCommission({
    merchandiseTotal: input.merchandiseTotal,
    currency: input.currency,
    completedWelcomeSales: Math.max(0, commissionConfig.welcomeSales - input.freeSalesLeft),
  });
  return { ...priced, freeShipping: input.freeShipping };
}
