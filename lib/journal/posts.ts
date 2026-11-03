import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { categoryKeys } from "../categories";
import { countries, countryCodes, isCountry, type CountryCode } from "../countries";
import type { CategoryKey } from "../types";

export type JournalPost = {
  country: CountryCode;
  slug: string;
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  published: string;
  /**
   * Shared only by true equivalents. A topic that exists in one country
   * must not be reused for a different subject.
   */
  topic: string;
  categories: CategoryKey[];
  cities: string[];
  body: string;
};

const root = path.join(process.cwd(), "content", "blog");
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function asString(value: unknown, file: string, field: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${file}: ${field} must be a non-empty string`);
  }
  return value.trim();
}

function asPublished(value: unknown, file: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, "0");
    const day = String(value.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  const text = asString(value, file, "published");
  return text;
}

function asList(value: unknown, file: string, field: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${file}: ${field} must be a non-empty list`);
  }
  return value.map((item, index) => {
    if (typeof item !== "string" || item.trim().length === 0) {
      throw new Error(`${file}: ${field}[${index}] must be a non-empty string`);
    }
    return item.trim();
  });
}

function readCountry(country: CountryCode): JournalPost[] {
  const dir = path.join(root, country);
  const files = readdirSync(dir).filter((name) => name.endsWith(".mdx"));
  return files.map((name) => {
    const slug = name.slice(0, -".mdx".length);
    const file = `${country}/${name}`;
    if (!slugPattern.test(slug)) {
      throw new Error(`${file}: filename must be a latin slug`);
    }
    const raw = readFileSync(path.join(dir, name), "utf8");
    const parsed = matter(raw);
    const title = asString(parsed.data.title, file, "title");
    const description = asString(parsed.data.description, file, "description");
    const published = asPublished(parsed.data.published, file);
    const topic = asString(parsed.data.topic, file, "topic");
    if (!datePattern.test(published)) {
      throw new Error(`${file}: published must be YYYY-MM-DD`);
    }
    if (!slugPattern.test(topic)) {
      throw new Error(`${file}: topic must be a latin id`);
    }
    const categories = asList(parsed.data.categories, file, "categories");
    for (const key of categories) {
      if (!categoryKeys.includes(key as CategoryKey)) {
        throw new Error(`${file}: unknown category ${key}`);
      }
    }
    const cities = asList(parsed.data.cities, file, "cities");
    for (const city of cities) {
      if (!countries[country].cities.includes(city)) {
        throw new Error(`${file}: unknown city ${city}`);
      }
    }
    const body = parsed.content.trim();
    if (body.length < 400) {
      throw new Error(`${file}: body is too short (${body.length})`);
    }
    return {
      country,
      slug,
      title,
      description,
      published,
      topic,
      categories: categories as CategoryKey[],
      cities,
      body,
    };
  });
}

let cached: JournalPost[] | null = null;

export function allPosts(): JournalPost[] {
  if (cached) return cached;
  const posts = countryCodes.flatMap((country) => readCountry(country));
  const seenTopic = new Set<string>();
  for (const post of posts) {
    const key = `${post.country}:${post.topic}`;
    if (seenTopic.has(key)) {
      throw new Error(`Duplicate topic ${post.topic} in ${post.country}`);
    }
    seenTopic.add(key);
  }
  cached = posts;
  return posts;
}

export function postsForCountry(country: CountryCode): JournalPost[] {
  return allPosts()
    .filter((post) => post.country === country)
    .sort((a, b) => (a.published < b.published ? 1 : -1));
}

export function postBySlug(country: CountryCode, slug: string): JournalPost | null {
  return allPosts().find((post) => post.country === country && post.slug === slug) ?? null;
}

/** Posts that are the same subject. One per country at most. */
export function equivalents(topic: string): JournalPost[] {
  return countryCodes.flatMap((country) => {
    const match = allPosts().filter((post) => post.country === country && post.topic === topic);
    return match;
  });
}

export function journalCountry(value: string): CountryCode | null {
  return isCountry(value) ? value : null;
}
