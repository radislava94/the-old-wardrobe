import { convert } from "../rates";
import type { CurrencyCode } from "../types";

/** Separate from visibility. */
export type Moderation = "clear" | "queued" | "kept" | "hidden";
export type Visibility = "draft" | "public" | "sold";

export const RETENTION_DAYS = 90;
/** Review hint only. A listing at or above this is not rejected. */
export const REVIEW_PRICE_EUR = 400;
export const RULE_PROVENANCE = "rule:repair-high-price-photos";
export const RULE_CONFIDENCE = 62;

const REPAIR_CONDITIONS = new Set([
  "Бара мала поправка",
  "Иска малък ремонт",
  "Traži malu popravku",
  "Do një riparim të vogël",
]);

export type FlagEvidence = {
  rule: "repair-high-price-photos";
  condition: "repair";
  photoCount: number;
  priceAmount: number;
  currency: CurrencyCode;
};

export type ModerationFlag = {
  id: string;
  listingId: string;
  evidence: FlagEvidence;
  confidence: number;
  provenance: string;
  openedAt: string;
  retainUntil: string;
  decidedBy: string | null;
  decidedAt: string | null;
};

export type ModerationLog = {
  id: string;
  listingId: string;
  flagId: string;
  from: Moderation;
  to: Moderation;
  actorId: string;
  at: string;
  retainUntil: string;
};

const CONTACT_KEYS = ["email", "phone", "name", "city", "title", "story", "description", "url", "pathname"];

export function isRepairCondition(condition: string): boolean {
  return REPAIR_CONDITIONS.has(condition.trim());
}

export function evidenceIsSafe(evidence: FlagEvidence): boolean {
  const keys = Object.keys(evidence);
  if (keys.some((key) => CONTACT_KEYS.includes(key))) return false;
  const blob = JSON.stringify(evidence);
  if (blob.includes("@")) return false;
  return evidence.condition === "repair" && evidence.rule === "repair-high-price-photos";
}

export function logIsSafe(log: ModerationLog): boolean {
  if (log.actorId.includes("@")) return false;
  const blob = JSON.stringify(log);
  return !blob.includes("@") && !/phone|email|name|city/i.test(blob);
}

export function retainUntil(from: Date): string {
  const next = new Date(from.getTime());
  next.setUTCDate(next.getUTCDate() + RETENTION_DAYS);
  return next.toISOString();
}

export type QueueInput = {
  moderation: Moderation;
  visibility: Visibility;
  condition: string;
  priceAmount: number;
  currency: CurrencyCode;
  readyPhotoCount: number;
};

/**
 * clear → queued only, and only for a repair + high price + at least one ready photo.
 * Visibility is not an input that this function changes. Nothing is rejected.
 */
export function queueIfSuspicious(
  input: QueueInput,
  now: Date,
  ids: { flagId: string; logId: string; listingId: string },
): { moderation: Moderation; flag: ModerationFlag | null; log: ModerationLog | null } {
  if (input.moderation !== "clear" || input.visibility === "draft") {
    return { moderation: input.moderation, flag: null, log: null };
  }
  const euros = convert(input.priceAmount, input.currency, "EUR");
  const suspicious =
    isRepairCondition(input.condition) && euros >= REVIEW_PRICE_EUR && input.readyPhotoCount >= 1;
  if (!suspicious) return { moderation: "clear", flag: null, log: null };
  const openedAt = now.toISOString();
  const until = retainUntil(now);
  const evidence: FlagEvidence = {
    rule: "repair-high-price-photos",
    condition: "repair",
    photoCount: input.readyPhotoCount,
    priceAmount: input.priceAmount,
    currency: input.currency,
  };
  if (!evidenceIsSafe(evidence)) return { moderation: "clear", flag: null, log: null };
  const flag: ModerationFlag = {
    id: ids.flagId,
    listingId: ids.listingId,
    evidence,
    confidence: RULE_CONFIDENCE,
    provenance: RULE_PROVENANCE,
    openedAt,
    retainUntil: until,
    decidedBy: null,
    decidedAt: null,
  };
  const log: ModerationLog = {
    id: ids.logId,
    listingId: ids.listingId,
    flagId: ids.flagId,
    from: "clear",
    to: "queued",
    actorId: "rule",
    at: openedAt,
    retainUntil: until,
  };
  return { moderation: "queued", flag, log };
}

export function isServerAdmin(userId: string, adminUserIds: string | undefined): boolean {
  const allowed = new Set(
    (adminUserIds ?? "")
      .split(",")
      .map((part) => part.trim())
      .filter((part) => part.length > 0 && !part.includes("@")),
  );
  return allowed.has(userId);
}

/** A claimed admin bit on the request is ignored. */
export function authorizeModeration(
  userId: string | null,
  adminUserIds: string | undefined,
  claimedAdmin?: boolean,
): { ok: true } | { ok: false; code: "unauthenticated" | "forbidden" } {
  void claimedAdmin;
  if (!userId) return { ok: false, code: "unauthenticated" };
  if (!isServerAdmin(userId, adminUserIds)) return { ok: false, code: "forbidden" };
  return { ok: true };
}

export function decideModeration(input: {
  actorId: string;
  admin: boolean;
  moderation: Moderation;
  visibility: Visibility;
  decision: string;
  now: Date;
  flagId: string;
  listingId: string;
  logId: string;
}):
  | {
      ok: true;
      moderation: "kept" | "hidden";
      visibility: Visibility;
      decidedBy: string;
      decidedAt: string;
      log: ModerationLog;
    }
  | { ok: false; code: "forbidden" | "invalid" } {
  if (!input.admin) return { ok: false, code: "forbidden" };
  if (input.moderation !== "queued") return { ok: false, code: "invalid" };
  if (input.decision !== "kept" && input.decision !== "hidden") return { ok: false, code: "invalid" };
  const at = input.now.toISOString();
  return {
    ok: true,
    moderation: input.decision,
    visibility: input.visibility,
    decidedBy: input.actorId,
    decidedAt: at,
    log: {
      id: input.logId,
      listingId: input.listingId,
      flagId: input.flagId,
      from: "queued",
      to: input.decision,
      actorId: input.actorId,
      at,
      retainUntil: retainUntil(input.now),
    },
  };
}

/** Profile writes cannot carry an admin grant. */
export function profileFields(input: { sellerKind?: string; admin?: unknown; role?: unknown }): {
  sellerKind: "private" | "business";
} {
  void input.admin;
  void input.role;
  return { sellerKind: input.sellerKind === "business" ? "business" : "private" };
}

export function purgeExpired<T extends { retainUntil: string }>(rows: T[], now: Date): T[] {
  const cutoff = now.toISOString();
  return rows.filter((row) => row.retainUntil > cutoff);
}

/** A seller save cannot choose moderation. The stored value is what remains. */
export function moderationFromSeller(stored: Moderation, claimed: unknown): Moderation {
  void claimed;
  return stored;
}
