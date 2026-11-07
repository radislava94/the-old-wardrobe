import type { CountryCode } from "../countries";

/**
 * The description draft stays off unless the server config says so.
 * `AI_DRAFT=on` is the approved switch. A gateway key without that switch
 * is not approval. `AI_DRAFT=off` is an explicit disable.
 */
export type AiEnv = {
  AI_DRAFT?: string;
  AI_GATEWAY_API_KEY?: string;
};

export type AiAvailability =
  | { available: false; reason: "disabled" | "unconfigured" }
  | { available: true };

export type PriceWarning = { text: string };

export type DescriptionSuggestion = {
  description: string | null;
  priceWarning: PriceWarning | null;
};

export type AiFailureCode = "ai-off" | "ai-unavailable" | "ai-timeout" | "ai-rate-limited" | "ai-invalid";

export type DescriptionDraftResult =
  | { ok: true; suggestion: DescriptionSuggestion }
  | { ok: false; error: { code: AiFailureCode | "unauthenticated" | "forbidden" } };

export type DraftPhoto = {
  id: string;
  status: "ready";
  contentType: "image/jpeg" | "image/png" | "image/webp";
  bytes: Uint8Array;
};

export type DraftListing = {
  description: string;
  sellerId: string;
  country: CountryCode;
};

const PRICE_WARNING: Record<CountryCode, string> = {
  mk: "Купувачите може да очекуваат пониска цена заради носењето. Ретко парче може да се објасни во описот.",
  bg: "Купувачите може да очакват по-ниска цена заради износването. Рядко парче може да се обясни в описанието.",
  "sr-rs": "Kupci mogu očekivati nižu cenu zbog nošenja. Redak komad može da se objasni u opisu.",
  "sq-al": "Blerësit mund të presin një çmim më të ulët për shkak të veshjes. Një copë e rrallë mund të shpjegohet në përshkrim.",
};

const ALLOWED_KEYS = new Set(["description", "wearVisible", "comparable"]);

const FABRIC =
  /\b(wool|silk|cotton|linen|leather|polyester|cashmere|denim|viscose|velvet|vuna|svila|pamuk|lan|koža|pambuk|mëndafsh|lesh|lëkurë)\b|волна|свила|памук|кожа|деним|вълна|коприна|памук/i;
const AUTHENTICITY = /\b(authentic|genuine|replica|original)\b|автентич|оригинал|подлин|autentik|origjinal/i;
const AGE = /\b(1[89]\d{2}|20\d{2})\b|\b(vintage|antique|century)\b|винтиџ|антик|shekull|век/i;
const CONDITION = /\b(mint|like new|excellent condition|poor condition|brand new)\b|состојба|състояние|\bstanje\b|gjendje/i;

export function aiAvailability(env: AiEnv): AiAvailability {
  const flag = env.AI_DRAFT?.trim().toLowerCase();
  if (flag === "off" || flag === "disabled") return { available: false, reason: "disabled" };
  const key = env.AI_GATEWAY_API_KEY?.trim();
  if (flag !== "on" || !key) return { available: false, reason: "unconfigured" };
  return { available: true };
}

/** The form asks this before it may send a draft request. */
export function draftRequestAllowed(availability: AiAvailability): boolean {
  return availability.available;
}

export function interpretModelOutput(
  raw: unknown,
  country: CountryCode,
): { ok: true; suggestion: DescriptionSuggestion } | { ok: false; code: "ai-invalid" } {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ok: false, code: "ai-invalid" };
  const record = raw as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!ALLOWED_KEYS.has(key)) return { ok: false, code: "ai-invalid" };
  }
  if (typeof record.wearVisible !== "boolean" || typeof record.comparable !== "boolean") {
    return { ok: false, code: "ai-invalid" };
  }
  const description = record.description;
  if (description !== null && typeof description !== "string") return { ok: false, code: "ai-invalid" };
  const text = typeof description === "string" ? description.trim() : null;
  if (text && !acceptableDescription(text)) return { ok: false, code: "ai-invalid" };
  const warning =
    record.wearVisible && record.comparable ? { text: PRICE_WARNING[country] } : null;
  if (warning && /\d/.test(warning.text)) return { ok: false, code: "ai-invalid" };
  return {
    ok: true,
    suggestion: {
      description: text && text.length > 0 ? text : null,
      priceWarning: warning,
    },
  };
}

function acceptableDescription(text: string): boolean {
  if (text.length > 600) return false;
  if (/[<>]/.test(text) || /javascript:/i.test(text)) return false;
  if (text.includes("@")) return false;
  if (FABRIC.test(text) || AUTHENTICITY.test(text) || AGE.test(text) || CONDITION.test(text)) return false;
  return true;
}

export class DraftModelError extends Error {
  constructor(readonly code: "ai-timeout" | "ai-unavailable" | "ai-rate-limited") {
    super(code);
  }
}

/**
 * Returns a suggestion. It does not write the listing.
 * The runner is not called when the feature is off.
 */
export async function requestDescriptionDraft(input: {
  env: AiEnv;
  sellerId: string | null;
  listing: DraftListing;
  photos: DraftPhoto[];
  run?: (photos: DraftPhoto[]) => Promise<unknown>;
}): Promise<DescriptionDraftResult> {
  const availability = aiAvailability(input.env);
  if (!draftRequestAllowed(availability)) {
    return { ok: false, error: { code: "ai-off" } };
  }
  if (!input.sellerId) return { ok: false, error: { code: "unauthenticated" } };
  if (input.listing.sellerId !== input.sellerId) return { ok: false, error: { code: "forbidden" } };
  const ready = input.photos.filter(
    (photo) => photo.status === "ready" && photo.bytes.byteLength > 0 && !("url" in photo),
  );
  if (ready.length === 0 || !input.run) return { ok: false, error: { code: "ai-invalid" } };
  let raw: unknown;
  try {
    raw = await input.run(ready);
  } catch (error) {
    if (error instanceof DraftModelError) return { ok: false, error: { code: error.code } };
    if (error instanceof SyntaxError) return { ok: false, error: { code: "ai-invalid" } };
    return { ok: false, error: { code: "ai-unavailable" } };
  }
  const interpreted = interpretModelOutput(raw, input.listing.country);
  if (!interpreted.ok) return { ok: false, error: { code: "ai-invalid" } };
  return { ok: true, suggestion: interpreted.suggestion };
}

/** Puts the description into the story field. The price is left untouched. */
export function applyDescription(story: string, suggestion: DescriptionSuggestion): string {
  return suggestion.description ?? story;
}

/** A price note is not a number and is not written into the price. */
export function applyPriceWarning(price: string, _suggestion: DescriptionSuggestion): string {
  return price;
}
