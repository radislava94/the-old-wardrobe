import assert from "node:assert/strict";
import test from "node:test";
import {
  aiAvailability,
  applyDescription,
  applyPriceWarning,
  draftRequestAllowed,
  requestDescriptionDraft,
  type DraftListing,
  type DraftPhoto,
} from "../lib/listings/ai-draft";
import { DESCRIPTION_MODEL } from "../lib/listings/ai-gateway";

globalThis.fetch = () => {
  throw new Error("model invoked");
};

const seller = "usr_seller";

function listing(): DraftListing {
  return Object.freeze({
    description: "Старата приказна останува.",
    sellerId: seller,
    country: "mk",
  });
}

function photo(): DraftPhoto {
  return {
    id: "pht_1",
    status: "ready",
    contentType: "image/jpeg",
    bytes: Uint8Array.of(0xff, 0xd8, 0xff),
  };
}

test("disabled", () => {
  const availability = aiAvailability({ AI_DRAFT: "off", AI_GATEWAY_API_KEY: "present" });
  assert.deepEqual(availability, { available: false, reason: "disabled" });
  assert.equal(draftRequestAllowed(availability), false);
});

test("unconfigured", () => {
  assert.deepEqual(aiAvailability({}), { available: false, reason: "unconfigured" });
  assert.deepEqual(aiAvailability({ AI_DRAFT: "on" }), { available: false, reason: "unconfigured" });
  assert.deepEqual(aiAvailability({ AI_GATEWAY_API_KEY: "present" }), {
    available: false,
    reason: "unconfigured",
  });
  assert.equal(draftRequestAllowed(aiAvailability({})), false);
});

test("ai-off does not call a model and does not write the listing", async () => {
  const row = listing();
  let called = false;
  const result = await requestDescriptionDraft({
    env: { AI_DRAFT: "off", AI_GATEWAY_API_KEY: "present" },
    sellerId: seller,
    listing: row,
    photos: [photo()],
    run: async () => {
      called = true;
      return { description: "Нова", wearVisible: true, comparable: true };
    },
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "ai-off");
  assert.equal(called, false);
  assert.equal(row.description, "Старата приказна останува.");
});

test("a suggestion is not written onto the listing", async () => {
  const row = listing();
  const result = await requestDescriptionDraft({
    env: { AI_DRAFT: "on", AI_GATEWAY_API_KEY: "test-only" },
    sellerId: seller,
    listing: row,
    photos: [photo()],
    run: async () => ({
      description: "A long dark coat with a wide collar.",
      wearVisible: true,
      comparable: true,
    }),
  });
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.suggestion.description, "A long dark coat with a wide collar.");
  assert.ok(result.suggestion.priceWarning);
  assert.notEqual(result.suggestion.description, result.suggestion.priceWarning?.text);
  assert.equal(/\d/.test(result.suggestion.priceWarning?.text ?? ""), false);
  assert.equal(row.description, "Старата приказна останува.");
  const price = "1200";
  assert.equal(applyPriceWarning(price, result.suggestion), price);
  assert.equal(applyDescription("останата", result.suggestion), result.suggestion.description);
});

test("priceWarning is omitted without wear or a comparable", async () => {
  const row = listing();
  for (const flags of [
    { wearVisible: false, comparable: true },
    { wearVisible: true, comparable: false },
    { wearVisible: false, comparable: false },
  ]) {
    const result = await requestDescriptionDraft({
      env: { AI_DRAFT: "on", AI_GATEWAY_API_KEY: "test-only" },
      sellerId: seller,
      listing: row,
      photos: [photo()],
      run: async () => ({
        description: "A long dark coat with a wide collar.",
        ...flags,
      }),
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.suggestion.priceWarning, null);
    assert.equal(row.description, "Старата приказна останува.");
  }
});

test("a number, brand, fabric, age, or condition is rejected and not saved", async () => {
  const row = listing();
  const rejected = [
    { description: "A wool coat.", wearVisible: true, comparable: true },
    { description: "From 1970.", wearVisible: false, comparable: false },
    { description: "An authentic piece.", wearVisible: false, comparable: false },
    { description: "In excellent condition.", wearVisible: true, comparable: true },
    { description: "A long coat.", wearVisible: true, comparable: true, price: 1400 },
    { description: "A long coat.", priceWarning: { text: "Lower it by 20" } },
  ];
  for (const payload of rejected) {
    const result = await requestDescriptionDraft({
      env: { AI_DRAFT: "on", AI_GATEWAY_API_KEY: "test-only" },
      sellerId: seller,
      listing: row,
      photos: [photo()],
      run: async () => payload,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "ai-invalid");
    assert.equal(row.description, "Старата приказна останува.");
  }
});

test("the named model id is not invoked", async () => {
  assert.equal(DESCRIPTION_MODEL, "google/gemini-2.5-flash");
  const row = listing();
  const result = await requestDescriptionDraft({
    env: {},
    sellerId: seller,
    listing: row,
    photos: [photo()],
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "ai-off");
  assert.equal(row.description, "Старата приказна останува.");
});
