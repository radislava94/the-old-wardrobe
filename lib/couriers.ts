import type { CountryCode } from "./countries";

/** Placeholder names. Checkout does not book a pickup. */
export const courierChoices: Record<CountryCode, readonly string[]> = {
  mk: ["Brza Pratka", "Pošta na Severna Makedonija", "Kargo Ekspres"],
  bg: ["Econt", "Speedy", "Bulgarian Posts"],
  "sr-rs": ["Post Express", "BEX", "D Express", "AKS", "City Express"],
  "sq-al": ["Posta Shqiptare", "Albanian Courier"],
};
