/**
 * Pure rules for the stepped sell flow.
 * Photos, words, price, and shipping are checked here so the form and the
 * tests share one reading of "this step can move on".
 */

export const MIN_LISTING_PHOTOS = 3;
export const MAX_LISTING_PHOTOS = 8;

export const SELL_STEPS = ["photos", "story", "price", "shipping"] as const;

export type SellStep = (typeof SELL_STEPS)[number];

export type StepIssue =
  | "photos-few"
  | "photos-many"
  | "title"
  | "category"
  | "size"
  | "city"
  | "story"
  | "condition"
  | "brand"
  | "price";

export type StoryInput = {
  title: string;
  category: string;
  size: string;
  city: string;
  story: string;
  condition: string;
  brand: string;
};

export type SellCheck = {
  photoCount: number;
  story: StoryInput;
  categories: readonly string[];
  cities: readonly string[];
  price: string;
};

export const DRAFT_VERSION = 1;

/** Stay under a typical localStorage quota even when a few photos are kept. */
export const DRAFT_BUDGET = 3_200_000;

export type StoredPhoto = {
  name: string;
  type: string;
  serverId?: string;
  dataUrl?: string;
};

export type StoredSellDraft = {
  version: typeof DRAFT_VERSION;
  savedAt: number;
  step: SellStep;
  listingId?: string;
  sellerKind: "private" | "business";
  country: string;
  title: string;
  category: string;
  size: string;
  brand: string;
  condition: string;
  story: string;
  city: string;
  price: string;
  photos: StoredPhoto[];
};

export type DraftStore = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const IMAGE_DATA = /^data:image\/(jpeg|png|webp)[;,]/;

export function issuesForPhotos(count: number): StepIssue[] {
  if (count < MIN_LISTING_PHOTOS) return ["photos-few"];
  if (count > MAX_LISTING_PHOTOS) return ["photos-many"];
  return [];
}

export function issuesForStory(
  story: StoryInput,
  categories: readonly string[],
  cities: readonly string[],
): StepIssue[] {
  const issues: StepIssue[] = [];
  const title = story.title.trim();
  const text = story.story.trim();
  const size = story.size.trim();
  const brand = story.brand.trim();
  const condition = story.condition.trim();
  const city = story.city.trim();
  if (title.length < 1 || title.length > 80) issues.push("title");
  if (!categories.includes(story.category)) issues.push("category");
  if (size.length < 1 || size.length > 12) issues.push("size");
  if (brand.length > 40) issues.push("brand");
  if (condition.length < 1 || condition.length > 80) issues.push("condition");
  if (!city || !cities.includes(city)) issues.push("city");
  if (text.length < 1 || text.length > 600) issues.push("story");
  return issues;
}

export function issuesForPrice(price: string): StepIssue[] {
  const raw = price.trim();
  if (!/^\d{1,12}$/.test(raw)) return ["price"];
  const amount = Number(raw);
  if (!Number.isSafeInteger(amount) || amount < 1) return ["price"];
  return [];
}

export function issuesForStep(step: SellStep, input: SellCheck): StepIssue[] {
  if (step === "photos") return issuesForPhotos(input.photoCount);
  if (step === "story") return issuesForStory(input.story, input.categories, input.cities);
  if (step === "price") return issuesForPrice(input.price);
  return [];
}

/** The earliest step that still needs a kind correction, or null when all are ready. */
export function firstBlockingStep(input: SellCheck): SellStep | null {
  for (const step of SELL_STEPS) {
    if (issuesForStep(step, input).length > 0) return step;
  }
  return null;
}

export function moveItem<T>(items: readonly T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction;
  if (index < 0 || index >= items.length || next < 0 || next >= items.length) return [...items];
  const copy = [...items];
  const [item] = copy.splice(index, 1);
  copy.splice(next, 0, item);
  return copy;
}

export function reorderItem<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return [...items];
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export function draftStorageKey(country: string, listingId?: string): string {
  const id = listingId?.trim() || "new";
  return `old-wardrobe-sell:v1:${country}:${id}`;
}

export function fillPattern(pattern: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
    pattern,
  );
}

export function countablePhoto(photo: { serverId?: string; hasFile: boolean }): boolean {
  return Boolean(photo.serverId) || photo.hasFile;
}

export function draftHasWords(draft: StoredSellDraft): boolean {
  return Boolean(
    draft.title.trim() ||
      draft.story.trim() ||
      draft.price.trim() ||
      draft.size.trim() ||
      draft.brand.trim() ||
      draft.category.trim() ||
      draft.city.trim() ||
      draft.photos.length > 0,
  );
}

export function draftsMatch(
  draft: StoredSellDraft,
  current: {
    title: string;
    story: string;
    price: string;
    size: string;
    brand: string;
    condition: string;
    category: string;
    city: string;
    country: string;
    sellerKind: "private" | "business";
    photoIds: string[];
  },
): boolean {
  if (draft.photos.some((photo) => photo.dataUrl)) return false;
  const ids = draft.photos.map((photo) => photo.serverId).filter((id): id is string => Boolean(id));
  if (draft.photos.length !== ids.length) return false;
  if (ids.length !== current.photoIds.length) return false;
  if (ids.some((id, index) => id !== current.photoIds[index])) return false;
  return (
    draft.title === current.title &&
    draft.story === current.story &&
    draft.price === current.price &&
    draft.size === current.size &&
    draft.brand === current.brand &&
    draft.condition === current.condition &&
    draft.category === current.category &&
    draft.city === current.city &&
    draft.country === current.country &&
    draft.sellerKind === current.sellerKind
  );
}

function clip(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

function readDataUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 4_800_000) return undefined;
  if (!IMAGE_DATA.test(value)) return undefined;
  return value;
}

function readPhoto(value: unknown): StoredPhoto | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const name = clip(record.name, 180);
  const type = clip(record.type, 40);
  const serverId = typeof record.serverId === "string" ? record.serverId.slice(0, 80) : undefined;
  const dataUrl = readDataUrl(record.dataUrl);
  if (!name && !serverId && !dataUrl) return null;
  return {
    name,
    type,
    ...(serverId ? { serverId } : {}),
    ...(dataUrl ? { dataUrl } : {}),
  };
}

export function parseStoredDraft(raw: string | null): StoredSellDraft | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (record.version !== DRAFT_VERSION) return null;
  if (!SELL_STEPS.includes(record.step as SellStep)) return null;
  if (record.sellerKind !== "private" && record.sellerKind !== "business") return null;
  if (typeof record.country !== "string" || record.country.length > 12) return null;
  const photos = Array.isArray(record.photos)
    ? record.photos.map(readPhoto).filter((photo): photo is StoredPhoto => photo !== null).slice(0, MAX_LISTING_PHOTOS)
    : [];
  const listingId = typeof record.listingId === "string" ? record.listingId.slice(0, 80) : undefined;
  return {
    version: DRAFT_VERSION,
    savedAt: typeof record.savedAt === "number" && Number.isFinite(record.savedAt) ? record.savedAt : 0,
    step: record.step as SellStep,
    ...(listingId ? { listingId } : {}),
    sellerKind: record.sellerKind,
    country: record.country,
    title: clip(record.title, 80),
    category: clip(record.category, 40),
    size: clip(record.size, 12),
    brand: clip(record.brand, 40),
    condition: clip(record.condition, 80),
    story: clip(record.story, 600),
    city: clip(record.city, 80),
    price: clip(record.price, 12),
    photos,
  };
}

export function serializeDraft(
  draft: StoredSellDraft,
  budget = DRAFT_BUDGET,
): { json: string; trimmedPhotos: boolean } {
  const photos = draft.photos.map((photo) => ({ ...photo }));
  let trimmed = false;
  const pack = () => JSON.stringify({ ...draft, version: DRAFT_VERSION, photos });
  let json = pack();
  while (json.length > budget) {
    const index = photos.reduce((found, photo, position) => (photo.dataUrl ? position : found), -1);
    if (index < 0) break;
    trimmed = true;
    photos[index] = { ...photos[index], dataUrl: undefined };
    json = pack();
  }
  return { json, trimmedPhotos: trimmed };
}

export function loadDraft(store: DraftStore, key: string): StoredSellDraft | null {
  try {
    return parseStoredDraft(store.getItem(key));
  } catch {
    return null;
  }
}

export function saveDraft(
  store: DraftStore,
  key: string,
  draft: StoredSellDraft,
): { saved: boolean; trimmedPhotos: boolean } {
  const packed = serializeDraft(draft);
  try {
    store.setItem(key, packed.json);
    return { saved: true, trimmedPhotos: packed.trimmedPhotos };
  } catch {
    const bare = serializeDraft({
      ...draft,
      photos: draft.photos.map((photo) => ({
        name: photo.name,
        type: photo.type,
        ...(photo.serverId ? { serverId: photo.serverId } : {}),
      })),
    });
    try {
      store.setItem(key, bare.json);
      return { saved: true, trimmedPhotos: true };
    } catch {
      return { saved: false, trimmedPhotos: true };
    }
  }
}

export function clearDraft(store: DraftStore, key: string): void {
  try {
    store.removeItem(key);
  } catch {
    /* the words stay on the page either way */
  }
}
