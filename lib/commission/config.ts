import type { CurrencyCode } from "../types";

/**
 * Suggested figures from the remittance note. Not a locked price decision.
 * Launch promo is on until the flag is turned off or the end date passes.
 */
export const commissionConfig = {
  launchPromo: {
    enabled: true,
    /** ISO date (YYYY-MM-DD). Null means the flag alone controls the promo. */
    endsOn: null as string | null,
  },
  welcomeSales: 3,
  rate: 0.05,
  threshold: { MKD: 500, EUR: 8.13, RSD: 950, ALL: 740 } as Record<CurrencyCode, number>,
  cap: { MKD: 600, EUR: 9.76, RSD: 1140, ALL: 890 } as Record<CurrencyCode, number>,
  remitTo: "seller" as const,
};

export type RateReason = "launch_promo" | "welcome_sale" | "under_threshold" | "standard";

export function launchPromoActive(today = new Date().toISOString().slice(0, 10)): boolean {
  const promo = commissionConfig.launchPromo;
  if (!promo.enabled) return false;
  if (!promo.endsOn) return true;
  return today <= promo.endsOn;
}
