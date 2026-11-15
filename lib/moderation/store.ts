import { and, eq, lte } from "drizzle-orm";
import { getDb } from "../db/client";
import { listingPhotos, listings, moderationFlags, moderationLogs } from "../db/schema";
import type { CurrencyCode } from "../types";
import { decideModeration, queueIfSuspicious, type Moderation, type Visibility } from "./moderation";

function asModeration(value: string): Moderation {
  if (value === "queued" || value === "kept" || value === "hidden") return value;
  return "clear";
}

function asVisibility(value: string): Visibility {
  if (value === "draft" || value === "sold") return value;
  return "public";
}

/** After a successful save. A failure here must not undo the listing. */
export async function noteListingForReview(listingId: string): Promise<void> {
  const db = getDb();
  const rows = await db.select().from(listings).where(eq(listings.id, listingId));
  const listing = rows[0];
  if (!listing) return;
  const photos = await db
    .select({ id: listingPhotos.id })
    .from(listingPhotos)
    .where(and(eq(listingPhotos.listingId, listingId), eq(listingPhotos.status, "ready")));
  const result = queueIfSuspicious(
    {
      moderation: asModeration(listing.moderation),
      visibility: asVisibility(listing.visibility),
      condition: listing.condition,
      priceAmount: listing.priceAmount,
      currency: listing.currency as CurrencyCode,
      readyPhotoCount: photos.length,
    },
    new Date(),
    {
      flagId: `flg_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
      logId: `log_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
      listingId,
    },
  );
  const flag = result.flag;
  const log = result.log;
  if (!flag || !log || result.moderation !== "queued") return;
  await db.transaction(async (tx) => {
    const updated = await tx
      .update(listings)
      .set({ moderation: "queued" })
      .where(and(eq(listings.id, listingId), eq(listings.moderation, "clear")))
      .returning({ id: listings.id });
    if (updated.length === 0) return;
    await tx.insert(moderationFlags).values({
      id: flag.id,
      listingId,
      evidence: JSON.stringify(flag.evidence),
      confidence: flag.confidence,
      provenance: flag.provenance,
      openedAt: flag.openedAt,
      retainUntil: flag.retainUntil,
      decidedBy: null,
      decidedAt: null,
    });
    await tx.insert(moderationLogs).values({
      id: log.id,
      listingId,
      flagId: log.flagId,
      fromState: log.from,
      toState: log.to,
      actorId: log.actorId,
      at: log.at,
      retainUntil: log.retainUntil,
    });
  });
}

export async function queueForAdmin(): Promise<
  {
    id: string;
    listingId: string;
    evidence: unknown;
    confidence: number;
    provenance: string;
    openedAt: string;
  }[]
> {
  const rows = await getDb()
    .select({
      id: moderationFlags.id,
      listingId: moderationFlags.listingId,
      evidence: moderationFlags.evidence,
      confidence: moderationFlags.confidence,
      provenance: moderationFlags.provenance,
      openedAt: moderationFlags.openedAt,
      moderation: listings.moderation,
    })
    .from(moderationFlags)
    .innerJoin(listings, eq(listings.id, moderationFlags.listingId));
  return rows
    .filter((row) => row.moderation === "queued" && row.provenance.startsWith("rule:"))
    .map((row) => ({
      id: row.id,
      listingId: row.listingId,
      evidence: parseEvidence(row.evidence),
      confidence: row.confidence,
      provenance: row.provenance,
      openedAt: row.openedAt,
    }));
}

export async function decideFlag(input: {
  actorId: string;
  flagId: string;
  decision: string;
}): Promise<{ ok: true; moderation: "kept" | "hidden" } | { ok: false; code: "forbidden" | "invalid" }> {
  const db = getDb();
  const flags = await db.select().from(moderationFlags).where(eq(moderationFlags.id, input.flagId));
  const flag = flags[0];
  if (!flag) return { ok: false, code: "invalid" };
  const rows = await db.select().from(listings).where(eq(listings.id, flag.listingId));
  const listing = rows[0];
  if (!listing) return { ok: false, code: "invalid" };
  const decision = decideModeration({
    actorId: input.actorId,
    admin: true,
    moderation: asModeration(listing.moderation),
    visibility: asVisibility(listing.visibility),
    decision: input.decision,
    now: new Date(),
    flagId: flag.id,
    listingId: listing.id,
    logId: `log_${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`,
  });
  if (!decision.ok) return decision;
  await db.transaction(async (tx) => {
    await tx
      .update(listings)
      .set({
        moderation: decision.moderation,
        moderationDecidedBy: decision.decidedBy,
        moderationDecidedAt: decision.decidedAt,
      })
      .where(eq(listings.id, listing.id));
    await tx
      .update(moderationFlags)
      .set({ decidedBy: decision.decidedBy, decidedAt: decision.decidedAt })
      .where(eq(moderationFlags.id, flag.id));
    await tx.insert(moderationLogs).values({
      id: decision.log.id,
      listingId: decision.log.listingId,
      flagId: decision.log.flagId,
      fromState: decision.log.from,
      toState: decision.log.to,
      actorId: decision.log.actorId,
      at: decision.log.at,
      retainUntil: decision.log.retainUntil,
    });
  });
  return { ok: true, moderation: decision.moderation };
}

function parseEvidence(value: string): unknown {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return { rule: "repair-high-price-photos" };
  }
}

export async function purgeModeration(now = new Date()): Promise<void> {
  const cutoff = now.toISOString();
  const db = getDb();
  await db.delete(moderationLogs).where(lte(moderationLogs.retainUntil, cutoff));
  await db.delete(moderationFlags).where(lte(moderationFlags.retainUntil, cutoff));
}
