import type { Dictionary } from "../i18n";
import type { Listing } from "../types";

/**
 * Shipping is never free. Cards and listings say it is not included,
 * even when an older row still has a free-shipping flag.
 */
export function shippingLabels(listing: Listing, dict: Dictionary): string[] {
  void listing;
  return [dict.listing.shippingNone];
}
