import type { CountryCode } from "../countries";
import bg from "./bg";
import mk from "./mk";
import sq from "./sq";
import sr from "./sr";
import type { Dictionary } from "./types";

/**
 * Shipping thresholds in the top bar are illustrations of the mockup's
 * "free over €60" line, converted roughly with the placeholder rates.
 * They are not a live delivery policy.
 */
const dictionaries: Record<CountryCode, Dictionary> = {
  mk,
  bg,
  "sr-rs": sr,
  "sq-al": sq,
};

export function getDictionary(country: CountryCode): Dictionary {
  return dictionaries[country];
}

export type { Dictionary };
