"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import { FeeLines } from "@/components/fee-lines";
import { commissionConfig } from "@/lib/commission/config";
import { formatStoredMoney } from "@/lib/commission/format";
import { saleQuote } from "@/lib/commission/quote";
import type { CountryCode } from "@/lib/countries";
import { photoProblem } from "@/lib/listings/photo-rules";
import {
  prepareListingPhoto,
  saveListing,
  verifyListingPhoto,
} from "@/lib/listings/actions";
import type { PublishResult } from "@/lib/listings/publish-types";
import { signInPath } from "@/lib/paths";
import type { CategoryKey, CurrencyCode } from "@/lib/types";

type Option = { value: string; label: string };

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

export function SellForm({
  countries,
  categories,
  initial,
  blobConfigured,
  copy,
  freeSalesLeft,
  fees,
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
    sellerKind: "private" | "business";
    freeShipping: boolean;
    freeShippingOver: string;
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
    freeShipping: string;
    freeShippingHint: string;
    freeShippingOver: string;
    freeShippingOverHint: string;
    sellerKind: string;
    sellerPrivate: string;
    sellerBusiness: string;
    signIn: string;
    saveDraft: string;
    errors: Record<string, string>;
  };
  freeSalesLeft: number;
  fees: FeePreviewCopy;
}) {
  const [country, setCountry] = useState(initial.country);
  const [listingId, setListingId] = useState(initial.id ?? "");
  const [photoIds, setPhotoIds] = useState<string[]>(initial.photoIds ?? []);
  const [price, setPrice] = useState(initial.price);
  const [freeShipping, setFreeShipping] = useState(initial.freeShipping);
  const [preview, setPreview] = useState<string | null>(initial.photoUrl || null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [failure, setFailure] = useState<PublishResult | null>(null);
  const [pending, setPending] = useState(false);
  const selected = countries.find((item) => item.code === country) ?? countries[0];
  const currency = (selected?.currency ?? "MKD") as CurrencyCode;
  const amount = Number(price);
  const quoted =
    Number.isFinite(amount) && amount > 0
      ? saleQuote({
          merchandiseTotal: amount,
          currency,
          freeSalesLeft,
          freeShipping,
        })
      : null;

  function readInput(form: HTMLFormElement, intent: "draft" | "publish", ids: string[]) {
    const data = new FormData(form);
    const over = String(data.get("freeShippingOver") ?? "").trim();
    return {
      id: listingId || undefined,
      intent,
      country,
      title: String(data.get("title") ?? ""),
      story: String(data.get("story") ?? ""),
      category: String(data.get("category") ?? ""),
      size: String(data.get("size") ?? ""),
      city: String(data.get("city") ?? ""),
      brand: String(data.get("brand") ?? ""),
      condition: String(data.get("condition") ?? ""),
      price: Number(data.get("price")),
      freeShipping: data.get("freeShipping") === "on",
      freeShippingOver: over ? Number(over) : null,
      sellerKind: data.get("sellerKind") === "business" ? "business" as const : "private" as const,
      photoIds: ids,
    };
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    setFailure(null);
    const form = event.currentTarget;
    const intent = (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "draft"
      ? "draft"
      : "publish";
    const selected = form.querySelector<HTMLInputElement>("input[name=photo]")?.files;
    const files = selected ? [...selected] : [];
    for (const file of files) {
      const problem = photoProblem(file);
      if (problem) {
        setClientError(problem);
        return;
      }
    }
    if ((files.length > 0 || intent === "publish") && !blobConfigured) {
      setClientError("photo-blob");
      return;
    }
    setPending(true);
    try {
      let id = listingId;
      if (!id) {
        const created = await saveListing(readInput(form, "draft", photoIds));
        if (!created.ok) {
          setFailure(created);
          return;
        }
        id = created.listing.id;
        setListingId(id);
      }
      const ids = [...photoIds];
      for (const file of files) {
        const prepared = await prepareListingPhoto(id);
        if (!prepared.ok || !("pathname" in prepared)) {
          setFailure(prepared.ok ? null : prepared);
          return;
        }
        try {
          await upload(prepared.pathname, file, {
            access: "public",
            handleUploadUrl: "/api/listing-photo",
            clientPayload: JSON.stringify({ photoId: prepared.photoId }),
          });
        } catch {
          const verified = await verifyListingPhoto(id, prepared.photoId);
          if (!verified.ok) setFailure(verified);
          else setClientError("photo");
          return;
        }
        const verified = await verifyListingPhoto(id, prepared.photoId);
        if (!verified.ok || !("photoId" in verified)) {
          if (!verified.ok) setFailure(verified);
          return;
        }
        if (!ids.includes(verified.photoId)) ids.push(verified.photoId);
      }
      setPhotoIds(ids);
      const saved = await saveListing({ ...readInput(form, intent, ids), id });
      if (!saved.ok) {
        setFailure(saved);
        return;
      }
      if (intent === "publish") {
        window.location.assign(`/${saved.listing.country}/listing/${saved.listing.slug}`);
      }
    } catch {
      setFailure({
        ok: false,
        error: { code: "invalid", fields: [{ field: "database", code: "database" }] },
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="sell-form" onSubmit={onSubmit}>
      {listingId ? <input type="hidden" name="id" value={listingId} /> : null}
      <fieldset className="choice-set">
        <legend>{copy.sellerKind}</legend>
        <label className="choice">
          <input
            type="radio"
            name="sellerKind"
            value="private"
            defaultChecked={initial.sellerKind !== "business"}
          />
          <span>{copy.sellerPrivate}</span>
        </label>
        <label className="choice">
          <input
            type="radio"
            name="sellerKind"
            value="business"
            defaultChecked={initial.sellerKind === "business"}
          />
          <span>{copy.sellerBusiness}</span>
        </label>
      </fieldset>
      <label>
        <span>{copy.name}</span>
        <input
          name="title"
          required
          maxLength={80}
          placeholder={copy.namePlaceholder}
          defaultValue={initial.title}
        />
      </label>
      <div className="sell-row">
        <label>
          <span>{copy.country}</span>
          <select
            name="country"
            required
            value={country}
            onChange={(event) => setCountry(event.target.value as CountryCode)}
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
          <select name="category" required defaultValue={initial.category || ""}>
            <option value="" disabled>
              —
            </option>
            {categories.map((category) => (
              <option key={category.value} value={category.value as CategoryKey}>
                {category.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>{copy.size}</span>
          <input
            name="size"
            required
            maxLength={12}
            placeholder={copy.sizePlaceholder}
            defaultValue={initial.size}
          />
        </label>
      </div>
      <div className="sell-row">
        <label>
          <span>{copy.brand}</span>
          <input name="brand" maxLength={40} defaultValue={initial.brand} />
        </label>
        <label>
          <span>{copy.condition}</span>
          <select name="condition" required defaultValue={initial.condition || copy.conditions[0]?.value}>
            {copy.conditions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="sell-row">
        <label>
          <span>
            {copy.price} ({selected?.currency})
          </span>
          <input
            name="price"
            type="number"
            required
            min={1}
            step={1}
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </label>
        <label>
          <span>{copy.city}</span>
          <select name="city" required defaultValue={initial.city || ""}>
            <option value="" disabled>
              —
            </option>
            {selected?.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span>{copy.story}</span>
        <textarea
          name="story"
          required
          rows={5}
          maxLength={600}
          placeholder={copy.storyPlaceholder}
          defaultValue={initial.story}
        />
      </label>
      <label className="choice">
        <input
          type="checkbox"
          name="freeShipping"
          checked={freeShipping}
          onChange={(event) => setFreeShipping(event.target.checked)}
        />
        <span>{copy.freeShipping}</span>
        <small>{copy.freeShippingHint}</small>
      </label>
      <label>
        <span>{copy.freeShippingOver}</span>
        <input
          name="freeShippingOver"
          type="number"
          min={1}
          step={1}
          inputMode="numeric"
          defaultValue={initial.freeShippingOver}
        />
        <small>{copy.freeShippingOverHint}</small>
      </label>
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
        platformFee={
          quoted ? formatStoredMoney(quoted.commissionAmount, quoted.currency) : undefined
        }
        cap={formatStoredMoney(quoted?.capAmount ?? commissionConfig.cap[currency], currency)}
        courier={quoted ? (freeShipping ? fees.courierSeller : fees.courierBuyer) : undefined}
        reason={quoted ? fees.reasons[quoted.rateReason] : undefined}
        labels={{
          platformFee: fees.platformFee,
          cap: fees.cap,
          courierCharge: fees.courierCharge,
        }}
      />
      <label>
        <span>{copy.photo}</span>
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(event) => {
            const file = event.target.files?.[0];
            setClientError(file ? photoProblem(file) : null);
            setPreview((current) => {
              if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
              return file ? URL.createObjectURL(file) : initial.photoUrl || null;
            });
          }}
        />
        <small>
          {copy.photoCount} {blobConfigured ? copy.photoHint : copy.photoBlob}
        </small>
      </label>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- local preview, not a stored image
        <img className="sell-preview" src={preview} alt="" />
      ) : null}
      {clientError ? (
        <p className="form-error" role="alert">
          {copy.errors[clientError] ?? copy.errors.photo}
        </p>
      ) : null}
      {failure && !failure.ok ? (
        <div className="form-error" role="alert">
          {failure.error.code === "unauthenticated" ? (
            <a
              href={`${signInPath(country)}?next=${encodeURIComponent(
                listingId ? `/${country}/sell/${listingId}` : `/${country}/sell`,
              )}`}
            >
              {copy.signIn}
            </a>
          ) : null}
          {failure.error.code === "forbidden" ? <p>{copy.errors.forbidden}</p> : null}
          {failure.error.fields?.map((field) => (
            <p key={`${field.field}-${field.code}`}>{copy.errors[field.code] ?? field.code}</p>
          ))}
          {failure.error.photos?.map((photo) => (
            <p key={`${photo.id ?? "photo"}-${photo.code}`}>{copy.errors[photo.code] ?? photo.code}</p>
          ))}
        </div>
      ) : null}
      <button type="submit" className="btn btn-ghost" name="intent" value="draft" disabled={pending}>
        {copy.saveDraft}
      </button>
      <button type="submit" className="btn btn-primary" name="intent" value="publish" disabled={pending}>
        {copy.submit}
      </button>
    </form>
  );
}
