import type { CountryCode } from "./countries";
import type { CategoryKey } from "./types";

export const categoryKeys: CategoryKey[] = [
  "dresses",
  "coats",
  "knitwear",
  "denim",
  "accessories",
];

/**
 * Localized URL slugs. Latin letters only, so a link survives every keyboard.
 * The visible category name lives in the dictionary, not here.
 */
export const categorySlugs: Record<
  CountryCode,
  Record<CategoryKey, string>
> = {
  mk: {
    dresses: "fustani",
    coats: "kaputi",
    knitwear: "pleteni",
    denim: "farmerki",
    accessories: "dodatoci",
  },
  bg: {
    dresses: "rokli",
    coats: "palta",
    knitwear: "pletiva",
    denim: "danki",
    accessories: "aksesoari",
  },
  "sr-rs": {
    dresses: "haljine",
    coats: "kaputi",
    knitwear: "trikotaza",
    denim: "farmerke",
    accessories: "dodaci",
  },
  "sq-al": {
    dresses: "fustane",
    coats: "pallto",
    knitwear: "trikotazh",
    denim: "xhins",
    accessories: "aksesor",
  },
};

export function categorySlug(country: CountryCode, key: CategoryKey): string {
  return categorySlugs[country][key];
}

export function categoryFromSlug(
  country: CountryCode,
  slug: string,
): CategoryKey | null {
  const match = categoryKeys.find((key) => categorySlugs[country][key] === slug);
  return match ?? null;
}
