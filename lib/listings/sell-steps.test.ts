import { describe, expect, it } from "vitest";
import {
  MAX_LISTING_PHOTOS,
  MIN_LISTING_PHOTOS,
  clearDraft,
  countablePhoto,
  draftHasWords,
  draftStorageKey,
  draftsMatch,
  fillPattern,
  firstBlockingStep,
  issuesForPhotos,
  issuesForPrice,
  issuesForShipping,
  issuesForStory,
  loadDraft,
  moveItem,
  parseStoredDraft,
  reorderItem,
  saveDraft,
  serializeDraft,
  type DraftStore,
  type StoredSellDraft,
} from "./sell-steps";

const categories = ["coats", "dresses"];
const cities = ["Скопје", "Битола"];

function story(overrides: Partial<StoredSellDraft> = {}) {
  return {
    title: "Капут од камилска волна",
    category: "coats",
    size: "M",
    city: "Скопје",
    story: "Од тетка, со едно копче помалку.",
    condition: "Носено со љубов",
    brand: "",
    ...overrides,
  };
}

function check(overrides: Partial<Parameters<typeof firstBlockingStep>[0]> = {}) {
  return {
    photoCount: MIN_LISTING_PHOTOS,
    story: story(),
    categories,
    cities,
    price: "1800",
    freeShippingOver: "",
    ...overrides,
  };
}

function draft(overrides: Partial<StoredSellDraft> = {}): StoredSellDraft {
  return {
    version: 1,
    savedAt: 1,
    step: "story",
    sellerKind: "private",
    country: "mk",
    title: "Капут",
    category: "coats",
    size: "M",
    brand: "",
    condition: "Носено со љубов",
    story: "Една реченица за палтото.",
    city: "Скопје",
    price: "1800",
    freeShipping: false,
    freeShippingOver: "",
    photos: [],
    ...overrides,
  };
}

function memoryStore(): DraftStore & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

describe("sell step validation", () => {
  it("asks for three photographs and stops at eight", () => {
    expect(issuesForPhotos(0)).toEqual(["photos-few"]);
    expect(issuesForPhotos(2)).toEqual(["photos-few"]);
    expect(issuesForPhotos(MIN_LISTING_PHOTOS)).toEqual([]);
    expect(issuesForPhotos(MAX_LISTING_PHOTOS)).toEqual([]);
    expect(issuesForPhotos(9)).toEqual(["photos-many"]);
  });

  it("keeps the story step kind about each missing piece", () => {
    expect(issuesForStory(story(), categories, cities)).toEqual([]);
    expect(issuesForStory(story({ title: "  ", category: "", size: "", city: "Прилеп", story: "", condition: "", brand: "а".repeat(41) }), categories, cities)).toEqual([
      "title",
      "category",
      "size",
      "brand",
      "condition",
      "city",
      "story",
    ]);
    expect(issuesForStory(story({ title: "а".repeat(80), story: "б".repeat(600), size: "1".repeat(12), brand: "в".repeat(40) }), categories, cities)).toEqual([]);
    expect(issuesForStory(story({ title: "а".repeat(81) }), categories, cities)).toEqual(["title"]);
  });

  it("wants a whole price and treats a blank shipping threshold as fine", () => {
    expect(issuesForPrice("")).toEqual(["price"]);
    expect(issuesForPrice("0")).toEqual(["price"]);
    expect(issuesForPrice("1.5")).toEqual(["price"]);
    expect(issuesForPrice("1800")).toEqual([]);
    expect(issuesForShipping("")).toEqual([]);
    expect(issuesForShipping("  ")).toEqual([]);
    expect(issuesForShipping("500")).toEqual([]);
    expect(issuesForShipping("0")).toEqual(["freeShippingOver"]);
    expect(issuesForShipping("12.5")).toEqual(["freeShippingOver"]);
  });

  it("stops on the earliest step that is not ready", () => {
    expect(firstBlockingStep(check({ photoCount: 1, price: "" }))).toBe("photos");
    expect(firstBlockingStep(check({ story: story({ title: "" }) }))).toBe("story");
    expect(firstBlockingStep(check({ price: "" }))).toBe("price");
    expect(firstBlockingStep(check({ freeShippingOver: "no" }))).toBe("shipping");
    expect(firstBlockingStep(check())).toBeNull();
  });

  it("moves the cover when the first photograph changes place", () => {
    expect(moveItem(["cover", "second", "third"], 0, 1)).toEqual(["second", "cover", "third"]);
    expect(moveItem(["cover", "second"], 0, -1)).toEqual(["cover", "second"]);
    expect(reorderItem(["a", "b", "c"], 2, 0)[0]).toBe("c");
  });
});

describe("sell draft autosave", () => {
  it("names a stable key and ignores a blank id", () => {
    expect(draftStorageKey("mk")).toBe("old-wardrobe-sell:v1:mk:new");
    expect(draftStorageKey("sr-rs", "  ")).toBe("old-wardrobe-sell:v1:sr-rs:new");
    expect(draftStorageKey("sq-al", "lst_1")).toBe("old-wardrobe-sell:v1:sq-al:lst_1");
  });

  it("round-trips words and drops photo bytes that do not fit", () => {
    const heavy = draft({
      photos: [
        { name: "one.jpg", type: "image/jpeg", dataUrl: `data:image/jpeg;base64,${"a".repeat(80)}` },
        { name: "two.jpg", type: "image/jpeg", dataUrl: `data:image/jpeg;base64,${"b".repeat(80)}` },
      ],
    });
    const packed = serializeDraft(heavy, 1);
    expect(packed.trimmedPhotos).toBe(true);
    const parsed = parseStoredDraft(packed.json);
    expect(parsed?.title).toBe("Капут");
    expect(parsed?.story).toBe(heavy.story);
    expect(parsed?.photos.every((photo) => !photo.dataUrl)).toBe(true);
    expect(parsed?.photos.map((photo) => photo.name)).toEqual(["one.jpg", "two.jpg"]);
  });

  it("rejects a broken draft and keeps a usable one", () => {
    expect(parseStoredDraft(null)).toBeNull();
    expect(parseStoredDraft("{")).toBeNull();
    expect(parseStoredDraft(JSON.stringify({ version: 2, step: "photos" }))).toBeNull();
    expect(parseStoredDraft(JSON.stringify({ ...draft(), step: "magic" }))).toBeNull();
    const saved = parseStoredDraft(JSON.stringify(draft({ listingId: "lst_9", freeShipping: true })));
    expect(saved?.listingId).toBe("lst_9");
    expect(saved?.freeShipping).toBe(true);
    expect(draftHasWords(draft({ title: "", story: "", price: "", size: "", brand: "", category: "", city: "", condition: "", freeShipping: false, photos: [] }))).toBe(false);
  });

  it("saves through a store and falls back when the quota refuses the photographs", () => {
    const store = memoryStore();
    const key = draftStorageKey("bg");
    const full = draft({
      country: "bg",
      photos: [{ name: "a.jpg", type: "image/jpeg", dataUrl: `data:image/jpeg;base64,${"c".repeat(400)}` }],
    });
    const tight: DraftStore = {
      getItem: store.getItem,
      removeItem: store.removeItem,
      setItem: (keyName, value) => {
        if (value.includes("data:image")) throw new Error("quota");
        store.setItem(keyName, value);
      },
    };
    const result = saveDraft(tight, key, full);
    expect(result.saved).toBe(true);
    expect(result.trimmedPhotos).toBe(true);
    const loaded = loadDraft(store, key);
    expect(loaded?.title).toBe("Капут");
    expect(loaded?.photos[0]?.dataUrl).toBeUndefined();
    clearDraft(store, key);
    expect(loadDraft(store, key)).toBeNull();
  });

  it("offers a draft only when it differs from the listing already on the page", () => {
    const current = {
      title: "Капут",
      story: "Една реченица за палтото.",
      price: "1800",
      size: "M",
      brand: "",
      condition: "Носено со љубов",
      category: "coats",
      city: "Скопје",
      country: "mk",
      sellerKind: "private" as const,
      freeShipping: false,
      freeShippingOver: "",
      photoIds: ["pht_1"],
    };
    expect(draftsMatch(draft({ photos: [{ name: "", type: "", serverId: "pht_1" }] }), current)).toBe(true);
    expect(draftsMatch(draft({ title: "Друго", photos: [{ name: "", type: "", serverId: "pht_1" }] }), current)).toBe(false);
    expect(
      draftsMatch(
        draft({ photos: [{ name: "a.jpg", type: "image/jpeg", dataUrl: "data:image/jpeg;base64,aa", serverId: "pht_1" }] }),
        current,
      ),
    ).toBe(false);
  });

  it("counts a photograph once it is a file or already on the listing", () => {
    expect(countablePhoto({ hasFile: false })).toBe(false);
    expect(countablePhoto({ hasFile: true })).toBe(true);
    expect(countablePhoto({ hasFile: false, serverId: "pht_1" })).toBe(true);
    expect(fillPattern("{count} од 3 најмалку", { count: 2 })).toBe("2 од 3 најмалку");
  });
});
