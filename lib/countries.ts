import type { CurrencyCode } from "./types";

export const countryCodes = ["mk", "bg", "sr-rs", "sq-al"] as const;

export type CountryCode = (typeof countryCodes)[number];

export type Country = {
  code: CountryCode;
  /** BCP 47 tag used on `<html lang>` and in-page `lang`. */
  htmlLang: string;
  /** hreflang value. Serbian stays `sr-RS` as requested; the page itself is Latin. */
  hreflang: string;
  ogLocale: string;
  /** Locale passed to `Intl` so Serbian months and numbers stay in Latin script. */
  intlLocale: string;
  /** English name, used on the country picker chrome. */
  name: string;
  /** Name in the country's own language. */
  nativeName: string;
  /** Language name in that language, for the picker card. */
  languageName: string;
  currency: CurrencyCode;
  /** Short label after the amount. EUR is rendered as a prefixed € instead. */
  currencyLabel: string;
  /** Currency name in the local language. */
  currencyName: string;
  /** Short switcher label. */
  short: string;
  cities: readonly string[];
};

export const countries: Record<CountryCode, Country> = {
  mk: {
    code: "mk",
    htmlLang: "mk",
    hreflang: "mk-MK",
    ogLocale: "mk_MK",
    intlLocale: "mk-MK",
    name: "North Macedonia",
    nativeName: "Северна Македонија",
    languageName: "македонски",
    currency: "MKD",
    currencyLabel: "ден",
    currencyName: "денар",
    short: "MK",
    cities: ["Скопје", "Битола"],
  },
  bg: {
    code: "bg",
    htmlLang: "bg",
    hreflang: "bg-BG",
    ogLocale: "bg_BG",
    intlLocale: "bg-BG",
    name: "Bulgaria",
    nativeName: "България",
    languageName: "български",
    currency: "EUR",
    currencyLabel: "€",
    currencyName: "евро",
    short: "BG",
    cities: ["София", "Пловдив"],
  },
  "sr-rs": {
    code: "sr-rs",
    htmlLang: "sr-Latn",
    hreflang: "sr-RS",
    ogLocale: "sr_RS",
    intlLocale: "sr-Latn-RS",
    name: "Serbia",
    nativeName: "Srbija",
    languageName: "srpski",
    currency: "RSD",
    currencyLabel: "RSD",
    currencyName: "dinar",
    short: "RS",
    cities: ["Beograd", "Novi Sad"],
  },
  "sq-al": {
    code: "sq-al",
    htmlLang: "sq",
    hreflang: "sq-AL",
    ogLocale: "sq_AL",
    intlLocale: "sq-AL",
    name: "Albania",
    nativeName: "Shqipëria",
    languageName: "shqip",
    currency: "ALL",
    currencyLabel: "L",
    currencyName: "lek",
    short: "AL",
    cities: ["Tiranë", "Durrës"],
  },
};

export function isCountry(value: string): value is CountryCode {
  return (countryCodes as readonly string[]).includes(value);
}
