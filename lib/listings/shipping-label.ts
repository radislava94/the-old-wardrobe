import type { Dictionary } from "../i18n";
import { formatMoney } from "../money";
import type { Listing } from "../types";

/**
 * Plain sentences. A bundle threshold is not written as free shipping
 * of the piece itself. When the seller set neither, say shipping is extra.
 */
export function shippingLabels(listing: Listing, dict: Dictionary): string[] {
  const lines: string[] = [];
  if (listing.freeShipping) lines.push(dict.listing.shippingFree);
  if (listing.freeShippingOver != null) {
    lines.push(
      dict.listing.shippingOver(formatMoney(listing.freeShippingOver, listing.country)),
    );
  }
  if (lines.length === 0) lines.push(dict.listing.shippingNone);
  return lines;
}
