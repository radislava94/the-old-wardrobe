import { describe, expect, it } from "vitest";
import { shouldMigrate } from "../scripts/vercel-build";

describe("shouldMigrate", () => {
  it("migrates only for a production deploy that has a database URL", () => {
    expect(shouldMigrate({ VERCEL_ENV: "production", DATABASE_URL: "postgres://db.example/app" })).toBe(true);
  });

  it("does not migrate when the database URL is missing, empty, or blank", () => {
    expect(shouldMigrate({ VERCEL_ENV: "production" })).toBe(false);
    expect(shouldMigrate({ VERCEL_ENV: "production", DATABASE_URL: "" })).toBe(false);
    expect(shouldMigrate({ VERCEL_ENV: "production", DATABASE_URL: "   " })).toBe(false);
  });

  it("does not migrate preview, development, CI, or an unset Vercel environment", () => {
    const url = "postgres://db.example/app";
    expect(shouldMigrate({ VERCEL_ENV: "preview", DATABASE_URL: url })).toBe(false);
    expect(shouldMigrate({ VERCEL_ENV: "development", DATABASE_URL: url })).toBe(false);
    expect(shouldMigrate({ DATABASE_URL: url })).toBe(false);
    expect(shouldMigrate({ VERCEL_ENV: "production-ish", DATABASE_URL: url })).toBe(false);
  });
});
