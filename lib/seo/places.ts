import { countries, countryCodes, type CountryCode } from "../countries";

/**
 * Latin city slugs, in the same order as `countries[code].cities`.
 * Category segments stay the slugs already used by the category pages
 * (`/mk/fustani`, `/bg/rokli`, …), so a city landing is that URL plus
 * the city: `/mk/fustani/skopje`.
 */
const citySlugList: Record<CountryCode, readonly string[]> = {
  mk: ["skopje", "bitola"],
  bg: ["sofia", "plovdiv"],
  "sr-rs": ["beograd", "novi-sad"],
  "sq-al": ["tirane", "durres"],
};

for (const code of countryCodes) {
  const slugs = citySlugList[code];
  if (slugs.length !== countries[code].cities.length) {
    throw new Error(`City slug count does not match cities for ${code}`);
  }
  if (new Set(slugs).size !== slugs.length) {
    throw new Error(`Duplicate city slug for ${code}`);
  }
}

export function citySlug(country: CountryCode, city: string): string | null {
  const index = countries[country].cities.indexOf(city);
  if (index < 0) return null;
  return citySlugList[country][index] ?? null;
}

export function cityFromSlug(country: CountryCode, slug: string): string | null {
  const index = citySlugList[country].indexOf(slug);
  if (index < 0) return null;
  return countries[country].cities[index] ?? null;
}

export function citySlugsFor(country: CountryCode): readonly string[] {
  return citySlugList[country];
}
