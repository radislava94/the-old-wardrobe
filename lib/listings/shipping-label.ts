import type { Dictionary } from "../i18n";
import type { Listing } from "../types";

/**
 * Shipping is never included. The seller packs the parcel and sends it
 * with a courier. Stored free-shipping flags are not shown.
 */
export function shippingLabels(_listing: Listing, dict: Dictionary): string[] {
  return [dict.listing.shippingNone];
}
