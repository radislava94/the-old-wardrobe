import type { CountryCode } from "../countries";
import bg from "./bg";
import mk from "./mk";
import sq from "./sq";
import sr from "./sr";
import type { Dictionary } from "./types";

/**
 * The top bar is the same three facts in every country: sellers have
 * buyer ratings, the buyer pays the courier when the parcel arrives,
 * and a listing can be reported.
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
