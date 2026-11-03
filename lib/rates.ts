import type { CurrencyCode } from "./types";

/**
 * PLACEHOLDER exchange rates — not for settlement, checkout, or payouts.
 *
 * Replace this whole table with a maintained source (a central-bank fix
 * or the payments provider) before a buyer is shown a converted price
 * on a real order.
 *
 * Each value is how many units of that currency equal 1 euro.
 * Figures are intentionally round late-2026 reference levels.
 *
 * Bulgaria lists in EUR directly. The euro replaced the lev on
 * 1 January 2026, so there is no BGN rate here.
 */
export const UNITS_PER_EUR: Record<CurrencyCode, number> = {
  EUR: 1,
  MKD: 61.5, // TODO: replace with the live NBRM mid rate
  RSD: 117, // TODO: replace with the live NBS mid rate
  ALL: 98, // TODO: replace with the live Bank of Albania mid rate
};

/**
 * Convert `amount` from one currency to another via the placeholder euro table.
 * Same-currency calls return the original amount, with no rounding.
 * Cross-currency results are rounded to a whole unit (these markets
 * don't show cents on a wardrobe tag).
 */
export function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
): number {
  if (from === to) return amount;
  const inEur = amount / UNITS_PER_EUR[from];
  return Math.round(inEur * UNITS_PER_EUR[to]);
}
