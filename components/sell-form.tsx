"use client";

import { upload } from "@vercel/blob/client";
import { useState } from "react";
import type { CountryCode } from "@/lib/countries";
import { LOCAL_PHOTO_BYTES, photoProblem } from "@/lib/listings/photo-rules";
import type { CategoryKey } from "@/lib/types";

type Option = { value: string; label: string };

export function SellForm({
  action,
  countries,
  categories,
  initial,
  blobConfigured,
  production,
  error,
  copy,
}: {
  action: (formData: FormData) => void;
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
    sellerKind: "private" | "business";
    freeShipping: boolean;
    freeShippingOver: string;
  };
  blobConfigured: boolean;
  production: boolean;
  error: string | null;
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
    errors: Record<string, string>;
  };
}) {
  const [country, setCountry] = useState(initial.country);
  const [preview, setPreview] = useState<string | null>(initial.photoUrl || null);
  const [clientError, setClientError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const selected = countries.find((item) => item.code === country) ?? countries[0];
  const shownError = clientError ?? error;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("photo");
    data.delete("photo");
    if (file instanceof File && file.size > 0) {
      const problem = photoProblem(file);
      if (problem) {
        setClientError(problem);
        return;
      }
      if (blobConfigured) {
        setPending(true);
        try {
          const blob = await upload(file.name, file, {
            access: "public",
            handleUploadUrl: "/api/listing-photo",
          });
          data.set("uploadedPhoto", blob.url);
        } catch {
          setClientError("photo");
          setPending(false);
          return;
        }
      } else if (production) {
        setClientError("photo-blob");
        return;
      } else {
        setPending(true);
        try {
          data.set("photo", await compressForLocal(file));
        } catch {
          setClientError("photo-size");
          setPending(false);
          return;
        }
      }
    }
    setPending(true);
    await action(data);
  }

  return (
    <form className="sell-form" onSubmit={onSubmit}>
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      {initial.photoUrl ? <input type="hidden" name="existingPhoto" value={initial.photoUrl} /> : null}
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
            defaultValue={initial.price}
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
        <input type="checkbox" name="freeShipping" defaultChecked={initial.freeShipping} />
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
      <label>
        <span>{copy.photo}</span>
        <input
          name="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          required={!initial.photoUrl}
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
          {production && !blobConfigured
            ? copy.photoBlob
            : blobConfigured
              ? copy.photoHint
              : copy.photoLocal}
        </small>
      </label>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- local preview, not a stored image
        <img className="sell-preview" src={preview} alt="" />
      ) : null}
      {shownError ? (
        <p className="form-error" role="alert">
          {copy.errors[shownError] ?? copy.errors.photo}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {copy.submit}
      </button>
    </form>
  );
}

async function compressForLocal(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const maxEdge = 1600;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("photo-size");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  let quality = 0.82;
  let blob = await canvasToJpeg(canvas, quality);
  while (blob.size > LOCAL_PHOTO_BYTES && quality > 0.4) {
    quality -= 0.12;
    blob = await canvasToJpeg(canvas, quality);
  }
  if (blob.size > LOCAL_PHOTO_BYTES) throw new Error("photo-size");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("photo-type"))),
      "image/jpeg",
      quality,
    );
  });
}
