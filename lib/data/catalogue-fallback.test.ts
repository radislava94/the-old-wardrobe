import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ListingDraft } from "../types";

const dbState = vi.hoisted(() => {
  const state = {
    scenario: "throw" as "throw" | "ready" | "empty",
    error: new Error("unset") as unknown,
    queries: 0,
    chain(getResult: () => Promise<unknown>): unknown {
      const proxy: object = new Proxy(function query() {}, {
        apply() {
          return proxy;
        },
        get(_target, property) {
          if (property === "then") {
            return (
              onFulfilled?: ((value: unknown) => unknown) | null,
              onRejected?: ((reason: unknown) => unknown) | null,
            ) => getResult().then(onFulfilled, onRejected);
          }
          if (property === "catch") {
            return (onRejected?: ((reason: unknown) => unknown) | null) => getResult().catch(onRejected);
          }
          if (property === "finally") {
            return (onFinally?: (() => void) | null) => getResult().finally(onFinally);
          }
          return () => proxy;
        },
      });
      return proxy;
    },
  };
  return state;
});

vi.mock("../db/client", () => ({
  getDb() {
    const fail = () => dbState.chain(() => Promise.reject(dbState.error));
    if (dbState.scenario === "throw") {
      return {
        execute: () => Promise.reject(dbState.error),
        select() {
          dbState.queries += 1;
          return fail();
        },
        insert: fail,
        update: fail,
      };
    }
    return {
      execute: async () => [{ listings: null, profiles: null, reviews: null }],
      select() {
        dbState.queries += 1;
        if (dbState.scenario === "empty") return dbState.chain(() => Promise.resolve([]));
        return fail();
      },
      insert: fail,
      update: fail,
    };
  },
}));

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

import { resetCatalogueFallbackForTests } from "./catalogue-fallback";
import { resetPublishSchemaForTests } from "../db/publish-schema";
import { listingsRepo, reviewsRepo } from "./index";
import { MemoryListingRepository } from "./memory";
import { MemoryReviewRepository } from "./review-memory";

const draft: ListingDraft = {
  country: "mk",
  title: "Test piece",
  description: "A piece that must not be stored.",
  category: "dresses",
  priceAmount: 1200,
  currency: "MKD",
  size: "M",
  condition: "Worn",
  city: "Скопје",
  brand: "",
  photoUrl: null,
  freeShipping: false,
  freeShippingOver: null,
};

const previousDatabaseUrl = process.env.DATABASE_URL;

function queryFailure(code: string, message: string): Error {
  const cause = new Error(message);
  cause.name = "PostgresError";
  Object.assign(cause, { code });
  const error = new Error('Failed query: select "id" from "listings"\nparams: ');
  error.name = "DrizzleQueryError";
  Object.assign(error, { cause });
  return error;
}

function driverFailure(code: string, message: string): Error {
  return Object.assign(new Error(message), { code, errno: code });
}

async function expectPlaceholderCatalogue(): Promise<void> {
  const listings = new MemoryListingRepository();
  const reviews = new MemoryReviewRepository();
  const items = await listings.listByCountry("mk");
  expect(items.length).toBeGreaterThan(0);
  expect(await listingsRepo.listByCountry("mk")).toEqual(items);
  expect(await listingsRepo.getBySlug("mk", "ponco-heklani-resi")).toEqual(
    await listings.getBySlug("mk", "ponco-heklani-resi"),
  );
  expect(await listingsRepo.getUser("ana")).toEqual(await listings.getUser("ana"));
  const sampleReviews = await reviews.listBySeller("ana");
  expect(sampleReviews.length).toBeGreaterThan(0);
  expect(await reviewsRepo.listBySeller("ana")).toEqual(sampleReviews);
  const sampleSummary = await reviews.summariesFor(["ana"]);
  expect(sampleSummary.ana?.count).toBeGreaterThan(0);
  expect(await reviewsRepo.summariesFor(["ana"])).toEqual(sampleSummary);
  expect(await reviewsRepo.areFirstParty()).toBe(false);
}

async function expectHonestFailure(error: unknown): Promise<void> {
  await expect(listingsRepo.listBySeller("ana")).rejects.toBe(error);
  await expect(listingsRepo.getById("mk-poncho")).rejects.toBe(error);
  await expect(listingsRepo.createListing("ana", draft)).rejects.toBe(error);
  await expect(listingsRepo.updateListing("mk-poncho", "ana", draft)).rejects.toBe(error);
}

beforeEach(() => {
  resetCatalogueFallbackForTests();
  resetPublishSchemaForTests();
  dbState.scenario = "throw";
  dbState.error = new Error("unset");
  dbState.queries = 0;
  process.env.DATABASE_URL = "postgres://wardrobe:wardrobe@127.0.0.1:5432/wardrobe";
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  resetCatalogueFallbackForTests();
  if (previousDatabaseUrl === undefined) delete process.env.DATABASE_URL;
  else process.env.DATABASE_URL = previousDatabaseUrl;
  vi.restoreAllMocks();
});

describe("public catalogue fallback", () => {
  it.each([
    ["a missing listings table", queryFailure("42P01", 'relation "listings" does not exist')],
    ["a missing profiles table", queryFailure("42P01", 'relation "profiles" does not exist')],
    ["a missing reviews table", queryFailure("42P01", 'relation "reviews" does not exist')],
    [
      "an unreachable database",
      queryFailure("ECONNREFUSED", "connect ECONNREFUSED 127.0.0.1:5432"),
    ],
    [
      "an unreachable database that times out",
      driverFailure("CONNECT_TIMEOUT", "write CONNECT_TIMEOUT 127.0.0.1:5432"),
    ],
  ])("serves the placeholder catalogue for %s", async (_label, error) => {
    dbState.scenario = "throw";
    dbState.error = error;
    await expectPlaceholderCatalogue();
    expect(dbState.queries).toBe(0);
    await expectHonestFailure(error);
  });

  it("still falls back when a catalogue query raises a missing-table error", async () => {
    const error = queryFailure("42P01", 'relation "reviews" does not exist');
    dbState.scenario = "ready";
    dbState.error = error;
    await expectPlaceholderCatalogue();
    expect(dbState.queries).toBeGreaterThan(0);
    await expectHonestFailure(error);
  });

  it("still falls back when a catalogue query names a column that does not exist", async () => {
    const error = queryFailure("42703", 'column "visibility" does not exist');
    dbState.scenario = "ready";
    dbState.error = error;
    await expectPlaceholderCatalogue();
    expect(dbState.queries).toBeGreaterThan(0);
    await expectHonestFailure(error);
  });

  it("does not replace a reachable catalogue with the placeholder", async () => {
    dbState.scenario = "empty";
    expect(await listingsRepo.listByCountry("mk")).toEqual([]);
    expect(await listingsRepo.getBySlug("mk", "ponco-heklani-resi")).toBeNull();
    expect(await reviewsRepo.listBySeller("ana")).toEqual([]);
    expect((await reviewsRepo.summariesFor(["ana"])).ana?.count).toBe(0);
  });

  it("does not hide an unrelated database error", async () => {
    const error = queryFailure("23505", "duplicate key value violates unique constraint");
    dbState.scenario = "ready";
    dbState.error = error;
    await expect(listingsRepo.listByCountry("mk")).rejects.toBe(error);
    await expect(listingsRepo.createListing("ana", draft)).rejects.toBe(error);
  });

  it("keeps the placeholder catalogue when DATABASE_URL is unset and still refuses to save", async () => {
    delete process.env.DATABASE_URL;
    dbState.scenario = "throw";
    dbState.error = queryFailure("42P01", 'relation "listings" does not exist');
    await expectPlaceholderCatalogue();
    expect(dbState.queries).toBe(0);
    await expect(listingsRepo.createListing("ana", draft)).rejects.toThrow(/DATABASE_URL/);
    await expect(listingsRepo.updateListing("mk-poncho", "ana", draft)).rejects.toThrow(/DATABASE_URL/);
  });
});
