"use client";

import { upload } from "@vercel/blob/client";
import { useEffect, useId, useRef, useState } from "react";
import { FeeLines } from "@/components/fee-lines";
import { commissionConfig } from "@/lib/commission/config";
import { formatStoredMoney } from "@/lib/commission/format";
import { saleQuote } from "@/lib/commission/quote";
import type { CountryCode } from "@/lib/countries";
import type { Dictionary } from "@/lib/i18n";
import {
  listingAiAvailability,
  listingAiDraft,
  prepareListingPhoto,
  removeListingPhoto,
  saveListing,
  verifyListingPhoto,
} from "@/lib/listings/actions";
import {
  applyDescription,
  draftRequestAllowed,
  type AiAvailability,
  type DescriptionSuggestion,
} from "@/lib/listings/ai-draft";
import { photoProblem } from "@/lib/listings/photo-rules";
import type { PublishResult } from "@/lib/listings/publish-types";
import {
  MAX_LISTING_PHOTOS,
  MIN_LISTING_PHOTOS,
  SELL_STEPS,
  clearDraft,
  countablePhoto,
  draftHasWords,
  draftStorageKey,
  draftsMatch,
  fillPattern,
  firstBlockingStep,
  issuesForPrice,
  issuesForStep,
  loadDraft,
  moveItem,
  reorderItem,
  saveDraft,
  type SellCheck,
  type SellStep,
  type StoredSellDraft,
} from "@/lib/listings/sell-steps";
import { formatMoney } from "@/lib/money";
import { signInPath } from "@/lib/paths";
import type { CategoryKey, CurrencyCode } from "@/lib/types";

type Option = { value: string; label: string };

const TILTS = ["-2.4deg", "1.8deg", "-1.2deg", "2.4deg", "-1.6deg", "1.1deg", "-0.8deg", "2deg"];

const SPARKS = [
  { left: "14%", top: "28%", delay: "0s", color: "var(--mustard)" },
  { left: "78%", top: "18%", delay: "0.05s", color: "var(--rose)" },
  { left: "24%", top: "62%", delay: "0.12s", color: "var(--mustard-soft)" },
  { left: "70%", top: "58%", delay: "0.18s", color: "var(--rose-soft)" },
  { left: "48%", top: "16%", delay: "0.08s", color: "var(--mustard)" },
  { left: "86%", top: "40%", delay: "0.22s", color: "var(--rose)" },
  { left: "8%", top: "46%", delay: "0.16s", color: "var(--mustard-soft)" },
  { left: "60%", top: "72%", delay: "0.28s", color: "var(--mustard)" },
  { left: "36%", top: "74%", delay: "0.1s", color: "var(--rose)" },
  { left: "52%", top: "40%", delay: "0.24s", color: "var(--mustard-soft)" },
];

export type FeePreviewCopy = {
  /** Already includes the remaining count. */
  freeLeft: string;
  /** Sentence with the literal placeholder `{amount}`. */
  youReceivePattern: string;
  enterPrice: string;
  platformFee: string;
  cap: string;
  courierCharge: string;
  courierBuyer: string;
  courierSeller: string;
  reasons: {
    launch_promo: string;
    welcome_sale: string;
    under_threshold: string;
    standard: string;
  };
};

export function receiveAmount(pattern: string, amount: string): string {
  return pattern.replaceAll("{amount}", amount);
}

type LocalPhoto = {
  key: string;
  file: File | null;
  name: string;
  type: string;
  previewUrl: string;
  dataUrl?: string;
  serverId?: string;
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function fileFromDataUrl(dataUrl: string, name: string, type: string): Promise<File> {
  const blob = await fetch(dataUrl).then((response) => response.blob());
  return new File([blob], name || "photo", { type: type || blob.type || "image/jpeg" });
}

function prefersStillness(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SellForm({
  countries,
  categories,
  initial,
  blobConfigured,
  copy,
  freeSalesLeft,
  fees,
  signedIn,
  returnPath,
}: {
  countries: {
    code: CountryCode;
    label: string;
    currency: string;
    cities: string[];
  }[];
  categories: Option[];
  initial: {
    id?: string;
    country: CountryCode;
    title: string;
    category: string;
    size: string;
    price: string;
    city: string;
    brand: string;
    condition: string;
    story: string;
    photoUrl: string;
    photoIds?: string[];
    photoPreviews?: { id: string; url: string | null }[];
    sellerKind: "private" | "business";
  };
  blobConfigured: boolean;
  copy: {
    name: string;
    namePlaceholder: string;
    category: string;
    size: string;
    sizePlaceholder: string;
    price: string;
    city: string;
    story: string;
    storyPlaceholder: string;
    photo: string;
    photoHint: string;
    photoLocal: string;
    photoBlob: string;
    photoCount: string;
    submit: string;
    brand: string;
    condition: string;
    conditions: Option[];
    country: string;
    currency: string;
    sellerKind: string;
    sellerPrivate: string;
    sellerBusiness: string;
    signIn: string;
    signInLink: string;
    saveDraft: string;
    aiAsk: string;
    aiApplyDescription: string;
    aiApplyWarning: string;
    aiWarningLabel: string;
    flow: Dictionary["sell"]["flow"];
    sizeTagPattern: string;
    shippingNone: string;
    errors: Record<string, string>;
  };
  freeSalesLeft: number;
  fees: FeePreviewCopy;
  signedIn: boolean;
  returnPath: string;
}) {
  const formId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const dragKey = useRef<string | null>(null);
  const opened = useRef(false);
  const stepped = useRef(false);
  const storageKey = draftStorageKey(initial.country, initial.id);
  const previews = new Map((initial.photoPreviews ?? []).map((photo) => [photo.id, photo.url ?? ""]));
  const [step, setStep] = useState<SellStep>("photos");
  const [country, setCountry] = useState(initial.country);
  const [listingId, setListingId] = useState(initial.id ?? "");
  const [sellerKind, setSellerKind] = useState(initial.sellerKind);
  const [title, setTitle] = useState(initial.title);
  const [category, setCategory] = useState(initial.category);
  const [size, setSize] = useState(initial.size);
  const [brand, setBrand] = useState(initial.brand);
  const [condition, setCondition] = useState(initial.condition);
  const [story, setStory] = useState(initial.story);
  const [city, setCity] = useState(initial.city);
  const [price, setPrice] = useState(initial.price);
  const [photos, setPhotos] = useState<LocalPhoto[]>(() =>
    (initial.photoIds ?? []).map((id) => ({
      key: id,
      file: null,
      serverId: id,
      name: "",
      type: "",
      previewUrl: previews.get(id) || (id === initial.photoIds?.[0] ? initial.photoUrl : ""),
    })),
  );
  const [issues, setIssues] = useState<string[]>([]);
  const [failure, setFailure] = useState<PublishResult | null>(null);
  const [pending, setPending] = useState(false);
  const [hanging, setHanging] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dropOver, setDropOver] = useState(false);
  const [ai, setAi] = useState<AiAvailability | null>(null);
  const [suggestion, setSuggestion] = useState<DescriptionSuggestion | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [offer, setOffer] = useState<StoredSellDraft | null>(null);
  const [readyToSave, setReadyToSave] = useState(false);
  const [savedLocally, setSavedLocally] = useState(false);
  const [photosTrimmed, setPhotosTrimmed] = useState(false);
  const [accountNote, setAccountNote] = useState(false);
  const selected = countries.find((item) => item.code === country) ?? countries[0];
  const currency = (selected?.currency ?? "MKD") as CurrencyCode;
  const amount = Number(price);
  const quoted =
    Number.isFinite(amount) && amount > 0
      ? saleQuote({
          merchandiseTotal: amount,
          currency,
          freeSalesLeft,
          freeShipping: false,
        })
      : null;
  const stepIndex = SELL_STEPS.indexOf(step);
  const photoCount = photos.filter((photo) => countablePhoto({ serverId: photo.serverId, hasFile: Boolean(photo.file) })).length;
  const progressPattern = photoCount < MIN_LISTING_PHOTOS ? copy.flow.photosProgressFew : copy.flow.photosProgress;
  const cover = photos[0]?.previewUrl || "";
  const shownPrice = issuesForPrice(price).length === 0 ? formatMoney(Number(price.trim()), country) : "";
  const shippingLines = previewShipping();

  function previewShipping(): string[] {
    return [copy.shippingNone];
  }

  function check(): SellCheck {
    return {
      photoCount,
      story: { title, category, size, city, story, condition, brand },
      categories: categories.map((item) => item.value),
      cities: selected?.cities ?? [],
      price,
    };
  }

  function say(code: string): string {
    const known: Record<string, string> = {
      "photos-few": copy.flow.photosNeed,
      "photos-many": copy.flow.photosTooMany,
      title: copy.flow.fieldTitle,
      category: copy.flow.fieldCategory,
      size: copy.flow.fieldSize,
      city: copy.flow.fieldCity,
      story: copy.flow.fieldStory,
      price: copy.flow.fieldPrice,
      condition: copy.flow.fieldCondition,
      brand: copy.flow.fieldBrand,
      country: copy.flow.fieldCountry,
    };
    return known[code] ?? copy.errors[code] ?? copy.flow.stepHint;
  }

  useEffect(() => {
    void listingAiAvailability().then(setAi);
  }, []);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const parsed = loadDraft(window.localStorage, storageKey);
    const same = parsed
      ? draftsMatch(parsed, {
          title: initial.title,
          story: initial.story,
          price: initial.price,
          size: initial.size,
          brand: initial.brand,
          condition: initial.condition,
          category: initial.category,
          city: initial.city,
          country: initial.country,
          sellerKind: initial.sellerKind,
          photoIds: initial.photoIds ?? [],
        })
      : true;
    if (parsed && draftHasWords(parsed) && !same) setOffer(parsed);
    setReadyToSave(true);
  }, [initial, storageKey]);

  useEffect(() => {
    if (!stepped.current) {
      stepped.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (!readyToSave || offer) return;
    const handle = window.setTimeout(() => {
      const stored = {
        version: 1 as const,
        savedAt: Date.now(),
        step,
        ...(listingId ? { listingId } : {}),
        sellerKind,
        country,
        title,
        category,
        size,
        brand,
        condition,
        story,
        city,
        price,
        photos: photos.map((photo) => ({
          name: photo.name,
          type: photo.type,
          ...(photo.serverId ? { serverId: photo.serverId } : {}),
          ...(photo.dataUrl ? { dataUrl: photo.dataUrl } : {}),
        })),
      };
      const result = saveDraft(window.localStorage, storageKey, stored);
      const changed = !draftsMatch(stored, {
        title: initial.title,
        story: initial.story,
        price: initial.price,
        size: initial.size,
        brand: initial.brand,
        condition: initial.condition,
        category: initial.category,
        city: initial.city,
        country: initial.country,
        sellerKind: initial.sellerKind,
        photoIds: initial.photoIds ?? [],
      });
      setSavedLocally(result.saved && changed);
      if (result.trimmedPhotos) setPhotosTrimmed(true);
    }, 400);
    return () => window.clearTimeout(handle);
  }, [
    readyToSave,
    offer,
    storageKey,
    step,
    listingId,
    sellerKind,
    country,
    title,
    category,
    size,
    brand,
    condition,
    story,
    city,
    price,
    photos,
    initial,
  ]);

  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);
  useEffect(() => {
    return () => {
      for (const photo of photosRef.current) {
        if (photo.previewUrl.startsWith("blob:")) URL.revokeObjectURL(photo.previewUrl);
      }
    };
  }, []);

  function addFiles(list: File[]) {
    const next = [...photos];
    const created: LocalPhoto[] = [];
    const problems: string[] = [];
    for (const file of list) {
      if (next.length >= MAX_LISTING_PHOTOS) {
        problems.push("photos-many");
        break;
      }
      const problem = photoProblem(file);
      if (problem) {
        problems.push(problem);
        continue;
      }
      const photo: LocalPhoto = {
        key: crypto.randomUUID(),
        file,
        name: file.name,
        type: file.type,
        previewUrl: URL.createObjectURL(file),
      };
      created.push(photo);
      next.push(photo);
    }
    setPhotos(next);
    setIssues([...new Set(problems)]);
    for (const photo of created) {
      if (!photo.file) continue;
      const key = photo.key;
      void readAsDataUrl(photo.file)
        .then((dataUrl) => {
          setPhotos((current) => current.map((item) => (item.key === key ? { ...item, dataUrl } : item)));
        })
        .catch(() => undefined);
    }
  }

  function shift(index: number, direction: -1 | 1) {
    const photo = photos[index];
    if (!photo) return;
    setPhotos((current) => moveItem(current, index, direction));
    window.requestAnimationFrame(() => {
      document.querySelector<HTMLElement>(`[data-photo-key="${photo.key}"]`)?.focus();
    });
  }

  async function removePhoto(photo: LocalPhoto) {
    const index = photos.findIndex((item) => item.key === photo.key);
    setPhotos((current) => current.filter((item) => item.key !== photo.key));
    if (!photo.serverId || !listingId) {
      if (photo.previewUrl.startsWith("blob:")) URL.revokeObjectURL(photo.previewUrl);
      return;
    }
    const result = await removeListingPhoto(listingId, photo.serverId);
    if (!result.ok) {
      setPhotos((current) => {
        if (current.some((item) => item.key === photo.key)) return current;
        const copy = [...current];
        copy.splice(Math.min(Math.max(index, 0), copy.length), 0, photo);
        return copy;
      });
      setFailure(result);
    }
  }

  function goTo(next: SellStep) {
    const target = SELL_STEPS.indexOf(next);
    if (target > stepIndex) {
      for (const candidate of SELL_STEPS.slice(0, target)) {
        const found = issuesForStep(candidate, check());
        if (found.length > 0) {
          setStep(candidate);
          setIssues(found);
          return;
        }
      }
    }
    setIssues([]);
    setStep(next);
  }

  async function restore(draft: StoredSellDraft) {
    const known = countries.some((item) => item.code === draft.country);
    if (known) setCountry(draft.country as CountryCode);
    setSellerKind(draft.sellerKind);
    setTitle(draft.title);
    setCategory(draft.category);
    setSize(draft.size);
    setBrand(draft.brand);
    setCondition(draft.condition || initial.condition);
    setStory(draft.story);
    setCity(draft.city);
    setPrice(draft.price);
    setStep(draft.step);
    setListingId(initial.id || draft.listingId || "");
    for (const photo of photos) {
      if (photo.previewUrl.startsWith("blob:")) URL.revokeObjectURL(photo.previewUrl);
    }
    const restored: LocalPhoto[] = [];
    let missing = false;
    for (const photo of draft.photos) {
      if (photo.dataUrl) {
        try {
          const file = await fileFromDataUrl(photo.dataUrl, photo.name, photo.type);
          restored.push({
            key: crypto.randomUUID(),
            file,
            name: photo.name,
            type: photo.type || file.type,
            previewUrl: photo.dataUrl,
            dataUrl: photo.dataUrl,
            ...(photo.serverId ? { serverId: photo.serverId } : {}),
          });
          continue;
        } catch {
          missing = true;
        }
      }
      if (photo.serverId) {
        restored.push({
          key: photo.serverId,
          file: null,
          serverId: photo.serverId,
          name: photo.name,
          type: photo.type,
          previewUrl: previews.get(photo.serverId) || "",
        });
        continue;
      }
      missing = true;
      restored.push({
        key: crypto.randomUUID(),
        file: null,
        name: photo.name,
        type: photo.type,
        previewUrl: "",
      });
    }
    setPhotos(restored);
    setPhotosTrimmed(missing);
    setOffer(null);
    setIssues([]);
  }

  function discardDraft() {
    clearDraft(window.localStorage, storageKey);
    setOffer(null);
  }

  function payload(intent: "draft" | "publish", ids: string[]) {
    return {
      id: listingId || undefined,
      intent,
      country,
      title,
      story,
      category,
      size,
      city,
      brand,
      condition,
      price: Number(price),
      freeShipping: false,
      freeShippingOver: null,
      sellerKind,
      photoIds: ids,
    };
  }

  async function uploadFresh(id: string, working: LocalPhoto[]): Promise<string[] | null> {
    const ids: string[] = [];
    const next = working.map((photo) => ({ ...photo }));
    for (let index = 0; index < next.length; index += 1) {
      const photo = next[index];
      if (!photo) continue;
      if (photo.serverId) {
        ids.push(photo.serverId);
        continue;
      }
      if (!photo.file) continue;
      const prepared = await prepareListingPhoto(id);
      if (!prepared.ok || !("pathname" in prepared)) {
        if (!prepared.ok) setFailure(prepared);
        return null;
      }
      try {
        await upload(prepared.pathname, photo.file, {
          access: "public",
          handleUploadUrl: "/api/listing-photo",
          clientPayload: JSON.stringify({ photoId: prepared.photoId }),
        });
      } catch {
        const verified = await verifyListingPhoto(id, prepared.photoId);
        if (!verified.ok) setFailure(verified);
        else setIssues(["photo"]);
        return null;
      }
      const verified = await verifyListingPhoto(id, prepared.photoId);
      if (!verified.ok || !("photoId" in verified)) {
        if (!verified.ok) setFailure(verified);
        return null;
      }
      next[index] = { ...photo, serverId: verified.photoId };
      if (!ids.includes(verified.photoId)) ids.push(verified.photoId);
      const stamped = next.map((item) => ({ ...item }));
      setPhotos((current) =>
        stamped.map((item) => {
          const fresh = current.find((candidate) => candidate.key === item.key);
          return fresh ? { ...fresh, serverId: item.serverId ?? fresh.serverId } : item;
        }),
      );
    }
    return ids;
  }

  async function persist(intent: "draft" | "publish") {
    setFailure(null);
    setAccountNote(false);
    const blocking = firstBlockingStep(check());
    if (blocking) {
      setStep(blocking);
      setIssues(issuesForStep(blocking, check()));
      return;
    }
    if (!signedIn) {
      setFailure({ ok: false, error: { code: "unauthenticated" } });
      return;
    }
    const hasNew = photos.some((photo) => photo.file && !photo.serverId);
    if ((hasNew || intent === "publish") && !blobConfigured) {
      setIssues(["photo-blob"]);
      setStep("photos");
      return;
    }
    setPending(true);
    try {
      let id = listingId;
      if (!id) {
        const created = await saveListing(payload("draft", photos.flatMap((photo) => (photo.serverId ? [photo.serverId] : []))));
        if (!created.ok) {
          setFailure(created);
          return;
        }
        id = created.listing.id;
        setListingId(id);
      }
      const ids = await uploadFresh(id, photos);
      if (!ids) return;
      const saved = await saveListing(payload(intent, ids));
      if (!saved.ok) {
        setFailure(saved);
        return;
      }
      setListingId(saved.listing.id);
      if (intent === "draft") {
        setAccountNote(true);
        return;
      }
      clearDraft(window.localStorage, storageKey);
      const href = `/${saved.listing.country}/listing/${saved.listing.slug}`;
      // A full load shows the listing the server just published.
      if (prefersStillness()) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- published page should load fresh
        window.location.assign(href);
        return;
      }
      setHanging(true);
      window.setTimeout(() => {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- published page should load fresh
        window.location.assign(href);
      }, 1400);
    } catch {
      setFailure({
        ok: false,
        error: { code: "invalid", fields: [{ field: "database", code: "database" }] },
      });
    } finally {
      setPending(false);
    }
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value");
    if (intent === "draft" || intent === "publish") void persist(intent);
  }

  async function askForDescription() {
    if (!ai || !draftRequestAllowed(ai) || !listingId) return;
    setAiError(null);
    try {
      const result = await listingAiDraft(listingId);
      if (!result.ok) {
        setAiError(result.error.code);
        setSuggestion(null);
        return;
      }
      setSuggestion(result.suggestion);
    } catch {
      setAiError("ai-unavailable");
      setSuggestion(null);
    }
  }

  const signInHref = `${signInPath(initial.country)}?next=${encodeURIComponent(returnPath)}`;
  const invalid = new Set(issues);

  return (
    <form className="sell-form wardrobe-form" onSubmit={onSubmit} aria-busy={pending || hanging}>
      {signedIn ? null : (
        <aside className="door-peek">
          <div className="mini-arch" aria-hidden="true" />
          <div>
            <h2>{copy.flow.signInTitle}</h2>
            <p>{copy.flow.signInLead}</p>
            <a className="peek-link" href={signInHref}>
              {copy.signInLink}
            </a>
          </div>
        </aside>
      )}
      {offer ? (
        <div className="draft-banner" role="status">
          <p>{copy.flow.draftFound}</p>
          <button type="button" className="btn btn-primary" onClick={() => void restore(offer)}>
            {copy.flow.continueDraft}
          </button>
          <button type="button" className="btn btn-ghost" onClick={discardDraft}>
            {copy.flow.discardDraft}
          </button>
        </div>
      ) : null}
      <nav aria-label={copy.flow.stepsLabel}>
        <ol className="step-rail">
          {SELL_STEPS.map((item, index) => (
            <li key={item}>
              <button type="button" aria-current={item === step ? "step" : undefined} onClick={() => goTo(item)}>
                <span className="n">{index + 1}</span>
                {copy.flow[item]}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <button
        type="button"
        className="btn btn-ghost preview-toggle"
        aria-pressed={previewOpen}
        onClick={() => setPreviewOpen((open) => !open)}
      >
        {previewOpen ? copy.flow.previewHide : copy.flow.previewShow}
      </button>
      <div className="wardrobe-stage">
        <div className="wardrobe-main">
          {step === "photos" ? (
            <section aria-labelledby={`${formId}-photos`}>
              <div className="step-copy">
                <h2 id={`${formId}-photos`} tabIndex={-1} ref={headingRef}>
                  {copy.flow.photosTitle}
                </h2>
                <p>{copy.flow.photosLead}</p>
              </div>
              <div
                className={dropOver ? "photo-drop is-over" : "photo-drop"}
                onDragOver={(event) => {
                  if (![...event.dataTransfer.types].includes("Files")) return;
                  event.preventDefault();
                  setDropOver(true);
                }}
                onDragLeave={() => setDropOver(false)}
                onDrop={(event) => {
                  if (![...event.dataTransfer.types].includes("Files")) return;
                  event.preventDefault();
                  setDropOver(false);
                  addFiles([...event.dataTransfer.files]);
                }}
              >
                <input
                  id={`${formId}-file`}
                  className="photo-input"
                  name="photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  aria-describedby={`${formId}-photo-hint`}
                  onChange={(event) => {
                    addFiles([...(event.target.files ?? [])]);
                    event.target.value = "";
                  }}
                />
                <label htmlFor={`${formId}-file`}>{copy.flow.photosDrop}</label>
                <small id={`${formId}-photo-hint`}>
                  {copy.photoCount} {blobConfigured ? copy.photoHint : copy.photoBlob}
                </small>
              </div>
              <p className="photo-progress" aria-live="polite">
                <span className="photo-pips" aria-hidden="true">
                  {Array.from({ length: MIN_LISTING_PHOTOS }, (_, index) => (
                    <i key={index} className={index < photoCount ? "is-on" : undefined} />
                  ))}
                </span>
                {fillPattern(progressPattern, { count: photoCount })}
              </p>
              {photosTrimmed ? <p className="hint">{copy.flow.photosRetry}</p> : null}
              {photos.length > 0 ? (
                <ul className="polaroid-pile">
                  {photos.map((photo, index) => (
                    <li key={photo.key}>
                      <article
                        className={index === 0 ? "pile-shot is-cover" : "pile-shot"}
                        style={{ ["--tilt" as string]: TILTS[index % TILTS.length] }}
                        data-photo-key={photo.key}
                        tabIndex={0}
                        aria-label={`${index + 1}. ${photo.name || copy.flow.photosSaved}${index === 0 ? `, ${copy.flow.photosCover}` : ""}`}
                        onKeyDown={(event) => {
                          if (event.key === "ArrowLeft") {
                            event.preventDefault();
                            shift(index, -1);
                          }
                          if (event.key === "ArrowRight") {
                            event.preventDefault();
                            shift(index, 1);
                          }
                        }}
                        onDragOver={(event) => {
                          if (!dragKey.current) return;
                          event.preventDefault();
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          const fromKey = dragKey.current;
                          dragKey.current = null;
                          if (!fromKey) return;
                          setPhotos((current) => {
                            const from = current.findIndex((item) => item.key === fromKey);
                            const to = current.findIndex((item) => item.key === photo.key);
                            return reorderItem(current, from, to);
                          });
                        }}
                      >
                        {index === 0 ? <span className="cover-tape">{copy.flow.photosCover}</span> : null}
                        {photo.previewUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- local or already-stored preview
                          <img src={photo.previewUrl} alt={copy.flow.photoAlt} />
                        ) : (
                          <div className="ph-empty" role="img" aria-label={copy.flow.photosSaved} />
                        )}
                        <div className="pile-actions">
                          <button
                            type="button"
                            className="drag-handle"
                            draggable
                            aria-label={copy.flow.photosDrag}
                            onDragStart={(event) => {
                              dragKey.current = photo.key;
                              event.dataTransfer.effectAllowed = "move";
                              event.dataTransfer.setData("text/plain", photo.key);
                            }}
                            onDragEnd={() => {
                              dragKey.current = null;
                            }}
                          >
                            ↕
                          </button>
                          <button type="button" aria-label={copy.flow.photosMoveEarlier} disabled={index === 0} onClick={() => shift(index, -1)}>
                            ‹
                          </button>
                          <button
                            type="button"
                            aria-label={copy.flow.photosMoveLater}
                            disabled={index === photos.length - 1}
                            onClick={() => shift(index, 1)}
                          >
                            ›
                          </button>
                          <button type="button" aria-label={copy.flow.photosRemove} onClick={() => void removePhoto(photo)}>
                            ×
                          </button>
                        </div>
                      </article>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {step === "story" ? (
            <section aria-labelledby={`${formId}-story`}>
              <div className="step-copy">
                <h2 id={`${formId}-story`} tabIndex={-1} ref={headingRef}>
                  {copy.flow.storyTitle}
                </h2>
                <p>{copy.flow.storyLead}</p>
              </div>
              <fieldset className="choice-set">
                <legend>{copy.sellerKind}</legend>
                <label className="choice">
                  <input
                    type="radio"
                    name="sellerKind"
                    value="private"
                    checked={sellerKind !== "business"}
                    onChange={() => setSellerKind("private")}
                  />
                  <span>{copy.sellerPrivate}</span>
                </label>
                <label className="choice">
                  <input
                    type="radio"
                    name="sellerKind"
                    value="business"
                    checked={sellerKind === "business"}
                    onChange={() => setSellerKind("business")}
                  />
                  <span>{copy.sellerBusiness}</span>
                </label>
              </fieldset>
              <label>
                <span>{copy.name}</span>
                <input
                  name="title"
                  maxLength={80}
                  placeholder={copy.namePlaceholder}
                  value={title}
                  aria-invalid={invalid.has("title") || undefined}
                  aria-describedby={invalid.has("title") ? `${formId}-issues` : undefined}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>
              <div className="sell-row">
                <label>
                  <span>{copy.country}</span>
                  <select
                    name="country"
                    value={country}
                    onChange={(event) => {
                      const next = event.target.value as CountryCode;
                      setCountry(next);
                      const cities = countries.find((item) => item.code === next)?.cities ?? [];
                      setCity((current) => (cities.includes(current) ? current : ""));
                    }}
                  >
                    {countries.map((item) => (
                      <option key={item.code} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{copy.currency}</span>
                  <input value={selected?.currency ?? ""} readOnly />
                </label>
              </div>
              <div className="sell-row">
                <label>
                  <span>{copy.category}</span>
                  <select
                    name="category"
                    value={category}
                    aria-invalid={invalid.has("category") || undefined}
                    onChange={(event) => setCategory(event.target.value)}
                  >
                    <option value="">—</option>
                    {categories.map((item) => (
                      <option key={item.value} value={item.value as CategoryKey}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>{copy.size}</span>
                  <input
                    name="size"
                    maxLength={12}
                    placeholder={copy.sizePlaceholder}
                    value={size}
                    aria-invalid={invalid.has("size") || undefined}
                    onChange={(event) => setSize(event.target.value)}
                  />
                </label>
              </div>
              <div className="sell-row">
                <label>
                  <span>{copy.brand}</span>
                  <input
                    name="brand"
                    maxLength={40}
                    value={brand}
                    aria-invalid={invalid.has("brand") || undefined}
                    onChange={(event) => setBrand(event.target.value)}
                  />
                </label>
                <label>
                  <span>{copy.condition}</span>
                  <select
                    name="condition"
                    value={condition}
                    aria-invalid={invalid.has("condition") || undefined}
                    onChange={(event) => setCondition(event.target.value)}
                  >
                    {copy.conditions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span>{copy.city}</span>
                <select
                  name="city"
                  value={city}
                  aria-invalid={invalid.has("city") || undefined}
                  onChange={(event) => setCity(event.target.value)}
                >
                  <option value="">—</option>
                  {selected?.cities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="story-card">
                <span className="field-kicker">{copy.story}</span>
                <textarea
                  className="story-ink"
                  name="story"
                  rows={6}
                  maxLength={600}
                  placeholder={copy.storyPlaceholder}
                  value={story}
                  aria-invalid={invalid.has("story") || undefined}
                  onChange={(event) => setStory(event.target.value)}
                />
              </label>
              {ai && draftRequestAllowed(ai) && listingId ? (
                <div className="ai-note">
                  <button type="button" className="btn btn-ghost" onClick={() => void askForDescription()} disabled={pending}>
                    {copy.aiAsk}
                  </button>
                  {suggestion?.description ? (
                    <div>
                      <p>{suggestion.description}</p>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setStory(applyDescription(story, suggestion))}
                      >
                        {copy.aiApplyDescription}
                      </button>
                    </div>
                  ) : null}
                  {suggestion?.priceWarning ? (
                    <div>
                      <p>{copy.aiWarningLabel}</p>
                      <p>{suggestion.priceWarning.text}</p>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setStory(`${story.trim()} ${suggestion.priceWarning?.text ?? ""}`.trim())}
                      >
                        {copy.aiApplyWarning}
                      </button>
                    </div>
                  ) : null}
                  {aiError ? (
                    <p className="form-error" role="alert">
                      {copy.errors[aiError] ?? aiError}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}

          {step === "price" ? (
            <section aria-labelledby={`${formId}-price`}>
              <div className="step-copy">
                <h2 id={`${formId}-price`} tabIndex={-1} ref={headingRef}>
                  {copy.flow.priceTitle}
                </h2>
                <p>{copy.flow.priceLead}</p>
              </div>
              <label className="luggage-price">
                <span className="hole" aria-hidden="true" />
                <span className="field-kicker">
                  {copy.price} ({selected?.currency})
                </span>
                <input
                  name="price"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  value={price}
                  aria-invalid={invalid.has("price") || undefined}
                  aria-describedby={`${formId}-fees`}
                  onChange={(event) => setPrice(event.target.value)}
                />
              </label>
              <div id={`${formId}-fees`}>
                <FeeLines
                  freeLeft={fees.freeLeft}
                  youReceive={
                    quoted
                      ? receiveAmount(
                          fees.youReceivePattern,
                          formatStoredMoney(quoted.sellerPayoutAmount, quoted.currency),
                        )
                      : fees.enterPrice
                  }
                  platformFee={quoted ? formatStoredMoney(quoted.commissionAmount, quoted.currency) : undefined}
                  cap={formatStoredMoney(quoted?.capAmount ?? commissionConfig.cap[currency], currency)}
                  courier={quoted ? fees.courierBuyer : undefined}
                  reason={quoted ? fees.reasons[quoted.rateReason] : undefined}
                  labels={{
                    platformFee: fees.platformFee,
                    cap: fees.cap,
                    courierCharge: fees.courierCharge,
                  }}
                />
              </div>
            </section>
          ) : null}

          {step === "shipping" ? (
            <section aria-labelledby={`${formId}-shipping`}>
              <div className="step-copy">
                <h2 id={`${formId}-shipping`} tabIndex={-1} ref={headingRef}>
                  {copy.flow.shippingTitle}
                </h2>
              </div>
              <div className="parcel-note">
                <div className="postage-face">
                  <small>{copy.flow.shippingLead}</small>
                </div>
              </div>
            </section>
          ) : null}

          {issues.length > 0 ? (
            <div id={`${formId}-issues`} className="form-error" role="alert">
              {issues.map((code) => (
                <p key={code}>{say(code)}</p>
              ))}
            </div>
          ) : null}
          {failure && !failure.ok ? (
            <div className="form-error" role="alert">
              {failure.error.code === "unauthenticated" ? <a href={signInHref}>{copy.signIn}</a> : null}
              {failure.error.code === "forbidden" ? <p>{copy.errors.forbidden}</p> : null}
              {failure.error.fields?.map((field) => (
                <p key={`${field.field}-${field.code}`}>
                  {field.code !== "fields" && copy.errors[field.code] ? copy.errors[field.code] : say(field.field)}
                </p>
              ))}
              {failure.error.photos?.map((photo) => (
                <p key={`${photo.id ?? "photo"}-${photo.code}`}>{copy.errors[photo.code] ?? photo.code}</p>
              ))}
            </div>
          ) : null}
          <div className="step-actions">
            {stepIndex > 0 ? (
              <button type="button" className="btn btn-ghost" onClick={() => goTo(SELL_STEPS[stepIndex - 1] ?? "photos")} disabled={pending}>
                {copy.flow.back}
              </button>
            ) : null}
            {step !== "shipping" ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => goTo(SELL_STEPS[stepIndex + 1] ?? "shipping")}
                disabled={pending}
              >
                {copy.flow.next}
              </button>
            ) : (
              <>
                <button type="submit" className="btn btn-ghost" name="intent" value="draft" disabled={pending || hanging}>
                  {copy.saveDraft}
                </button>
                <button type="submit" className="btn btn-primary hang-button" name="intent" value="publish" disabled={pending || hanging}>
                  {copy.flow.hang}
                </button>
              </>
            )}
          </div>
          {pending ? (
            <p className="hint" role="status">
              {copy.flow.working}
            </p>
          ) : null}
          {accountNote ? (
            <p className="hint" role="status">
              {copy.flow.accountDraft}
            </p>
          ) : null}
          {savedLocally && !offer ? (
            <p className="hint" role="status">
              {copy.flow.draftSaved}
            </p>
          ) : null}
        </div>
        <aside className={previewOpen ? "wardrobe-preview is-open" : "wardrobe-preview"} aria-label={copy.flow.preview}>
          <p className="eyebrow">{copy.flow.preview}</p>
          <p className="preview-note">{copy.flow.previewNote}</p>
          <article className="card wardrobe-card" style={{ ["--r" as string]: "-1.4deg" }}>
            {size.trim() ? <span className="size">{fillPattern(copy.sizeTagPattern, { size: size.trim() })}</span> : null}
            <div className="ph">
              {cover ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview of the cover photograph
                <img src={cover} alt="" />
              ) : (
                <div className="ph-empty" />
              )}
            </div>
            <div className="meta">
              <div>
                <h3>{title.trim() || copy.flow.previewNameless}</h3>
                {brand.trim() || condition.trim() ? <p className="era">{brand.trim() || condition.trim()}</p> : null}
                <p className="ship-note">
                  {shippingLines.map((line) => (
                    <span key={line}>{line}</span>
                  ))}
                </p>
              </div>
              <span className="price">{shownPrice || "—"}</span>
            </div>
          </article>
        </aside>
      </div>
      {hanging ? (
        <div className="hang-curtain" role="status">
          <div className="hang-arch" aria-hidden="true">
            <span className="hang-leaf hang-leaf-left" />
            <span className="hang-leaf hang-leaf-right" />
            <span className="hang-knob" />
          </div>
          <p>{copy.flow.hanging}</p>
          <div className="hang-sparkles" aria-hidden="true">
            {SPARKS.map((spark) => (
              <i key={`${spark.left}-${spark.top}`} style={{ left: spark.left, top: spark.top, animationDelay: spark.delay, background: spark.color }} />
            ))}
          </div>
        </div>
      ) : null}
    </form>
  );
}
