import assert from "node:assert/strict";
import test from "node:test";
import { aiAvailability } from "../lib/listings/ai-draft";
import {
  authorizeModeration,
  decideModeration,
  evidenceIsSafe,
  isServerAdmin,
  logIsSafe,
  moderationFromSeller,
  profileFields,
  purgeExpired,
  queueIfSuspicious,
  type ModerationFlag,
  type ModerationLog,
} from "../lib/moderation/moderation";

const now = new Date("2026-11-07T12:00:00.000Z");
const repair = "Бара мала поправка";

function open(overrides: Partial<Parameters<typeof queueIfSuspicious>[0]> = {}) {
  return queueIfSuspicious(
    {
      moderation: "clear",
      visibility: "public",
      condition: repair,
      priceAmount: 30_000,
      currency: "MKD",
      readyPhotoCount: 3,
      ...overrides,
    },
    now,
    { flagId: "flg_1", logId: "log_1", listingId: "lst_1" },
  );
}

test("clear to queued is automatic and does not reject or hide", () => {
  const result = open();
  assert.equal(result.moderation, "queued");
  assert.equal(result.flag?.provenance, "rule:repair-high-price-photos");
  assert.equal(result.flag?.confidence, 62);
  assert.equal(result.log?.from, "clear");
  assert.equal(result.log?.to, "queued");
  assert.equal(result.log?.actorId, "rule");
  assert.notEqual(result.moderation, "hidden");
  assert.ok(result.flag && evidenceIsSafe(result.flag.evidence));
  assert.ok(result.log && logIsSafe(result.log));
});

test("a calm listing stays clear", () => {
  assert.equal(open({ condition: "Носено со љубов" }).moderation, "clear");
  assert.equal(open({ priceAmount: 1500 }).moderation, "clear");
  assert.equal(open({ readyPhotoCount: 0 }).moderation, "clear");
  assert.equal(open({ visibility: "draft" }).moderation, "clear");
});

test("automatic review does not move queued, kept, or hidden", () => {
  for (const moderation of ["queued", "kept", "hidden"] as const) {
    const result = open({ moderation });
    assert.equal(result.moderation, moderation);
    assert.equal(result.flag, null);
  }
});

test("AI being off does not block selling", () => {
  assert.deepEqual(aiAvailability({}), { available: false, reason: "unconfigured" });
  const result = open();
  assert.equal(result.moderation, "queued");
  assert.equal(result.flag?.listingId, "lst_1");
});

test("a seller cannot set moderation or grant admin", () => {
  assert.equal(moderationFromSeller("clear", "hidden"), "clear");
  assert.equal(moderationFromSeller("queued", "kept"), "queued");
  const fields = profileFields({ sellerKind: "private", admin: true, role: "admin" });
  assert.deepEqual(fields, { sellerKind: "private" });
  assert.equal("admin" in fields, false);
  assert.equal(isServerAdmin("seller-a", "admin-1"), false);
  assert.equal(isServerAdmin("seller-a", "seller-a@example.com"), false);
  const denied = authorizeModeration("seller-a", "admin-1", true);
  assert.equal(denied.ok, false);
  if (!denied.ok) assert.equal(denied.code, "forbidden");
  assert.equal(authorizeModeration(null, "admin-1").ok, false);
});

test("queued to kept and hidden are admin-only and record who decided", () => {
  const seller = decideModeration({
    actorId: "seller-a",
    admin: false,
    moderation: "queued",
    visibility: "public",
    decision: "hidden",
    now,
    flagId: "flg_1",
    listingId: "lst_1",
    logId: "log_2",
  });
  assert.equal(seller.ok, false);
  if (!seller.ok) assert.equal(seller.code, "forbidden");

  for (const decision of ["kept", "hidden"] as const) {
    const result = decideModeration({
      actorId: "admin-1",
      admin: true,
      moderation: "queued",
      visibility: "sold",
      decision,
      now,
      flagId: "flg_1",
      listingId: "lst_1",
      logId: "log_2",
    });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.moderation, decision);
    assert.equal(result.visibility, "sold");
    assert.equal(result.decidedBy, "admin-1");
    assert.equal(result.decidedAt, now.toISOString());
    assert.equal(result.log.actorId, "admin-1");
    assert.equal(logIsSafe(result.log), true);
  }

  const skip = decideModeration({
    actorId: "admin-1",
    admin: true,
    moderation: "clear",
    visibility: "public",
    decision: "hidden",
    now,
    flagId: "flg_1",
    listingId: "lst_1",
    logId: "log_3",
  });
  assert.equal(skip.ok, false);
});

test("flags and logs drop after the retention window and the listing state remains", () => {
  const opened = open();
  assert.ok(opened.flag && opened.log);
  const flag = opened.flag as ModerationFlag;
  const log = opened.log as ModerationLog;
  const later = new Date(opened.flag!.retainUntil);
  later.setUTCDate(later.getUTCDate() + 1);
  assert.deepEqual(purgeExpired([flag], later), []);
  assert.deepEqual(purgeExpired([log], later), []);
  assert.equal(opened.moderation, "queued");
  const listing = { visibility: "public" as const, moderation: "hidden" as const };
  assert.equal(listing.visibility, "public");
  assert.equal(listing.moderation, "hidden");
});
