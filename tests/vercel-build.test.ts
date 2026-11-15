import assert from "node:assert/strict";
import test from "node:test";
import { shouldMigrate } from "../scripts/vercel-build";

test("migrates only for a production deploy that has a database URL", () => {
  assert.equal(shouldMigrate({ VERCEL_ENV: "production", DATABASE_URL: "postgres://db.example/app" }), true);
});

test("does not migrate when the database URL is missing, empty, or blank", () => {
  assert.equal(shouldMigrate({ VERCEL_ENV: "production" }), false);
  assert.equal(shouldMigrate({ VERCEL_ENV: "production", DATABASE_URL: "" }), false);
  assert.equal(shouldMigrate({ VERCEL_ENV: "production", DATABASE_URL: "   " }), false);
});

test("does not migrate preview, development, CI, or an unset Vercel environment", () => {
  const url = "postgres://db.example/app";
  assert.equal(shouldMigrate({ VERCEL_ENV: "preview", DATABASE_URL: url }), false);
  assert.equal(shouldMigrate({ VERCEL_ENV: "development", DATABASE_URL: url }), false);
  assert.equal(shouldMigrate({ DATABASE_URL: url }), false);
  assert.equal(shouldMigrate({ VERCEL_ENV: "production-ish", DATABASE_URL: url }), false);
});
