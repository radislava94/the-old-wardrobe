import { countries, type CountryCode } from "../countries";
import type { CurrencyCode } from "../types";

const countryForCurrency: Record<CurrencyCode, CountryCode> = {
  MKD: "mk",
  EUR: "bg",
  RSD: "sr-rs",
  ALL: "sq-al",
};

/** Fee amounts keep euro cents. The other three currencies are whole units. */
export function formatStoredMoney(amount: number, currency: CurrencyCode): string {
  const country = countries[countryForCurrency[currency]];
  if (currency === "EUR") {
    return new Intl.NumberFormat(country.intlLocale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  const digits = new Intl.NumberFormat(country.intlLocale, {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `${digits} ${country.currencyLabel}`;
}
