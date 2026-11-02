import { categoryKeys } from "../../categories";
import { countries, countryCodes, type CountryCode } from "../../countries";
import type { CategoryKey } from "../../types";
import { bgCategory, bgCity } from "./bg";
import { mkCategory, mkCity } from "./mk";
import { sqCategory, sqCity } from "./sq";
import { srCategory, srCity } from "./sr";
import type { PlaceCopy } from "./types";

const categoryCopy: Record<CountryCode, Record<CategoryKey, PlaceCopy>> = {
  mk: mkCategory,
  bg: bgCategory,
  "sr-rs": srCategory,
  "sq-al": sqCategory,
};

const cityCopy: Record<CountryCode, Record<CategoryKey, Record<string, PlaceCopy>>> = {
  mk: mkCity,
  bg: bgCity,
  "sr-rs": srCity,
  "sq-al": sqCity,
};

const seen = new Map<string, string>();
const problems: string[] = [];

function claim(value: string, label: string, min: number) {
  const trimmed = value.trim();
  if (trimmed.length < min) {
    problems.push(`short ${trimmed.length} < ${min}: ${label}`);
  }
  const prior = seen.get(trimmed);
  if (prior) {
    problems.push(`duplicate: ${label} == ${prior}`);
  } else {
    seen.set(trimmed, label);
  }
}

for (const country of countryCodes) {
  for (const key of categoryKeys) {
    const category = categoryCopy[country][key];
    claim(category.title, `${country} ${key} title`, 12);
    claim(category.description, `${country} ${key} description`, 80);
    claim(category.lead, `${country} ${key} lead`, 80);
    for (const paragraph of category.paragraphs) {
      claim(paragraph, `${country} ${key} paragraph`, 80);
    }
    for (const city of countries[country].cities) {
      const page = cityCopy[country][key][city];
      if (!page) {
        throw new Error(`Missing city copy ${country} ${key} ${city}`);
      }
      claim(page.title, `${country} ${key} ${city} title`, 12);
      claim(page.description, `${country} ${key} ${city} description`, 80);
      claim(page.lead, `${country} ${key} ${city} lead`, 80);
      for (const paragraph of page.paragraphs) {
        claim(paragraph, `${country} ${key} ${city} paragraph`, 80);
      }
    }
  }
}

if (problems.length > 0) {
  throw new Error(`Landing copy problems:\n${problems.join("\n")}`);
}

export function categoryLanding(country: CountryCode, key: CategoryKey): PlaceCopy {
  return categoryCopy[country][key];
}

export function cityLanding(
  country: CountryCode,
  key: CategoryKey,
  city: string,
): PlaceCopy {
  const page = cityCopy[country][key][city];
  if (!page) {
    throw new Error(`Missing city copy ${country} ${key} ${city}`);
  }
  return page;
}

export type { PlaceCopy };
