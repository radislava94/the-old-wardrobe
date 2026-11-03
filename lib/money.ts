import { countries, type CountryCode } from "./countries";
import { convert } from "./rates";
import type { CurrencyCode } from "./types";

export function formatMoney(amount: number, country: CountryCode): string {
  const locale = countries[country].intlLocale;
  const rounded = Math.round(amount);
  const digits = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 0,
  }).format(rounded);

  if (countries[country].currency === "EUR") {
    return `€${digits}`;
  }

  // TODO: confirm Albanian price tags should read "L" rather than "Lekë".
  return `${digits} ${countries[country].currencyLabel}`;
}

export function priceFor(
  listing: { priceAmount: number; currency: CurrencyCode },
  country: CountryCode,
): { amount: number; currency: CurrencyCode; formatted: string } {
  const currency = countries[country].currency;
  const amount = convert(listing.priceAmount, listing.currency, currency);
  return { amount, currency, formatted: formatMoney(amount, country) };
}

/** Euro equivalent for the quiet "placeholder rate" line. Null when already EUR. */
export function euroEquivalent(
  amount: number,
  currency: CurrencyCode,
): number | null {
  if (currency === "EUR") return null;
  return convert(amount, currency, "EUR");
}

export function formatEuro(amount: number): string {
  const digits = new Intl.NumberFormat("en-IE", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  return `€${digits}`;
}
