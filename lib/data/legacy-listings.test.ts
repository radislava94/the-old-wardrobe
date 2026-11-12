import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { listingPhotos, listings } from "../db/schema";
import { resetPublishSchemaForTests } from "../db/publish-schema";

type Row = Record<string, unknown>;

const dbState = vi.hoisted(() => ({
  schema: {
    visibility: false,
    photos_compliant: false,
    listing_photos: false,
  } as Row | null,
  rows: [] as Row[],
  photos: [] as Row[],
  executes: 0,
  selects: [] as string[],
  /** Reject selects that name a publish column. */
  failPublishColumn: false,
  /** Reject every listing select. */
  failAll: null as Error | null,
}));

function undefinedColumn(column = "visibility"): Error {
  const cause = new Error(`column "${column}" does not exist`);
  cause.name = "PostgresError";
  Object.assign(cause, { code: "42703" });
  const error = new Error(`Failed query: select "${column}" from "listings"`);
  error.name = "DrizzleQueryError";
  Object.assign(error, { cause });
  return error;
}

function sqlQuery(query: SQL): { sql: string; params: unknown[] } {
  const queryWithParams = new PgDialect().sqlToQuery(query);
  return { sql: queryWithParams.sql, params: queryWithParams.params };
}

vi.mock("../db/client", () => ({
  getDb() {
    return {
      execute: async () => {
        dbState.executes += 1;
        return dbState.schema ? [dbState.schema] : [];
      },
      select(fields?: Record<string, unknown>) {
        const keys = fields ? Object.keys(fields) : [];
        dbState.selects.push(keys.join(","));
        const namesPublishColumn = keys.includes("visibility") || keys.includes("photosCompliant");
        return {
          from(table: unknown) {
            return {
              where(condition?: SQL) {
                if (dbState.failAll) return Promise.reject(dbState.failAll);
                if (dbState.failPublishColumn && namesPublishColumn) {
                  return Promise.reject(undefinedColumn());
                }
                if (table === listingPhotos) return Promise.resolve(dbState.photos);
                if (table !== listings) return Promise.resolve([]);
                const { sql, params } = condition ? sqlQuery(condition) : { sql: "", params: [] };
                let rows = dbState.rows;
                const slug = params.find((param) => dbState.rows.some((row) => row.slug === param));
                if (typeof slug === "string") rows = rows.filter((row) => row.slug === slug);
                if (sql.includes('"visibility"')) {
                  rows = rows.filter((row) => row.visibility === "public" || row.visibility === "sold");
                }
                return Promise.resolve(rows);
              },
            };
          },
        };
      },
    };
  },
}));

import { PostgresListingRepository } from "./postgres";

const legacyRow = {
  id: "mk-poncho",
  slug: "ponco-heklani-resi",
  country: "mk",
  sellerId: "ana",
  title: "Пончо со хеклани реси",
  description: "Топло парче.",
  category: "knitwear",
  priceAmount: 1800,
  currency: "MKD",
  size: "M",
  era: "80-ти",
  condition: "носено",
  city: "Скопје",
  status: "available",
  photo: "poncho",
  createdAt: "2024-11-02",
  brand: null,
  photoUrl: "https://photos.example/poncho.jpg",
  freeShipping: false,
  freeShippingOver: null,
};

function withPublish<T extends Row>(row: T, visibility: string, photosCompliant = false) {
  return { ...row, visibility, photosCompliant };
}

beforeEach(() => {
  resetPublishSchemaForTests();
  dbState.schema = {
    visibility: false,
    photos_compliant: false,
    listing_photos: false,
  };
  dbState.rows = [{ ...legacyRow }];
  dbState.photos = [];
  dbState.executes = 0;
  dbState.selects = [];
  dbState.failPublishColumn = false;
  dbState.failAll = null;
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  resetPublishSchemaForTests();
  vi.restoreAllMocks();
});

describe("listing reads before the publish migration", () => {
  it("returns the existing row and does not name the new columns", async () => {
    const repo = new PostgresListingRepository();
    const items = await repo.listByCountry("mk");
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe(legacyRow.title);
    expect(items[0]?.photoUrl).toBe(legacyRow.photoUrl);
    expect(items[0]?.visibility).toBe("public");
    expect(items[0]?.photosCompliant).toBe(false);
    expect(dbState.selects[0]?.split(",")).not.toContain("visibility");
    expect(dbState.selects[0]?.split(",")).not.toContain("photosCompliant");
    expect(await repo.getBySlug("mk", legacyRow.slug)).toMatchObject({
      id: legacyRow.id,
      photoUrl: legacyRow.photoUrl,
    });
  });

  it("remembers the probe across reads in the same window", async () => {
    const repo = new PostgresListingRepository();
    await repo.listByCountry("mk");
    await repo.listByCountry("bg");
    expect(dbState.executes).toBe(1);
  });

  it("hides drafts once visibility exists", async () => {
    dbState.schema = { visibility: true, photos_compliant: true, listing_photos: true };
    dbState.rows = [
      withPublish(legacyRow, "public"),
      withPublish({ ...legacyRow, id: "mk-draft", slug: "draft-piece", title: "Необјавено" }, "draft"),
    ];
    const repo = new PostgresListingRepository();
    const items = await repo.listByCountry("mk");
    expect(items.map((item) => item.id)).toEqual(["mk-poncho"]);
    expect(await repo.getBySlug("mk", "draft-piece")).toBeNull();
    expect(dbState.selects[0]?.split(",")).toContain("visibility");
  });

  it("keeps a legacy photo when the photo table is not there yet", async () => {
    dbState.schema = { visibility: true, photos_compliant: true, listing_photos: false };
    dbState.rows = [withPublish(legacyRow, "public", true)];
    const repo = new PostgresListingRepository();
    const items = await repo.listByCountry("mk");
    expect(items[0]?.photoUrl).toBe(legacyRow.photoUrl);
    expect(items[0]?.photosCompliant).toBe(false);
  });

  it("uses a verified photo when the publish tables are present", async () => {
    dbState.schema = { visibility: true, photos_compliant: true, listing_photos: true };
    dbState.rows = [withPublish(legacyRow, "public", true)];
    dbState.photos = [{ listingId: legacyRow.id, url: "https://blob.example/ready.jpg", status: "ready" }];
    const repo = new PostgresListingRepository();
    const items = await repo.listByCountry("mk");
    expect(items[0]?.photoUrl).toBe("https://blob.example/ready.jpg");
    expect(items[0]?.photosCompliant).toBe(true);
  });

  it("retries without the new columns when the probe is stale", async () => {
    dbState.schema = { visibility: true, photos_compliant: true, listing_photos: true };
    dbState.failPublishColumn = true;
    const repo = new PostgresListingRepository();
    const items = await repo.listByCountry("mk");
    expect(items[0]?.photoUrl).toBe(legacyRow.photoUrl);
    expect(dbState.selects.some((keys) => keys.split(",").includes("visibility"))).toBe(true);
    expect(dbState.selects.some((keys) => !keys.split(",").includes("visibility"))).toBe(true);
    dbState.executes = 0;
    dbState.selects = [];
    await repo.listByCountry("mk");
    expect(dbState.executes).toBe(0);
    expect(dbState.selects[0]?.split(",")).not.toContain("visibility");
  });

  it("does not loop when a pre-migration column is missing too", async () => {
    const error = undefinedColumn("photo_url");
    dbState.failAll = error;
    const repo = new PostgresListingRepository();
    await expect(repo.listByCountry("mk")).rejects.toBe(error);
    expect(dbState.selects).toHaveLength(1);
  });
});
