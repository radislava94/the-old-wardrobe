"use client";

import { useEffect, useState } from "react";
import type { CategoryKey } from "@/lib/types";

type Option = { value: string; label: string };

export function SellForm({
  categories,
  cities,
  currencyLabel,
  copy,
}: {
  categories: Option[];
  cities: string[];
  currencyLabel: string;
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
    submit: string;
    successTitle: string;
    /** Contains the literal `{name}`, replaced after submit. */
    successBody: string;
  };
}) {
  const [title, setTitle] = useState("");
  const [sent, setSent] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <form
      className="sell-form"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setTitle(String(data.get("title") ?? ""));
        setSent(true);
      }}
    >
      <label>
        <span>{copy.name}</span>
        <input name="title" required maxLength={80} placeholder={copy.namePlaceholder} />
      </label>
      <div className="sell-row">
        <label>
          <span>{copy.category}</span>
          <select name="category" required defaultValue="">
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
          <input name="size" required maxLength={12} placeholder={copy.sizePlaceholder} />
        </label>
      </div>
      <div className="sell-row">
        <label>
          <span>
            {copy.price} ({currencyLabel})
          </span>
          <input name="price" type="number" required min={1} step={1} inputMode="numeric" />
        </label>
        <label>
          <span>{copy.city}</span>
          <select name="city" required defaultValue="">
            <option value="" disabled>
              —
            </option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span>{copy.story}</span>
        <textarea name="story" required rows={5} maxLength={600} placeholder={copy.storyPlaceholder} />
      </label>
      <label>
        <span>{copy.photo}</span>
        <input
          name="photo"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview((current) => {
              if (current) URL.revokeObjectURL(current);
              return file ? URL.createObjectURL(file) : null;
            });
          }}
        />
        <small>{copy.photoHint}</small>
      </label>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- local preview only, never uploaded
        <img className="sell-preview" src={preview} alt="" />
      ) : null}
      <button type="submit" className="btn btn-primary">
        {copy.submit}
      </button>
      {sent ? (
        <div className="sell-success" role="status">
          <h2>{copy.successTitle}</h2>
          <p>{copy.successBody.replaceAll("{name}", title)}</p>
        </div>
      ) : null}
    </form>
  );
}
