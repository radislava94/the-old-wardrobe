import { MAX_PHOTO_BYTES } from "./image-bytes";

export { MAX_PHOTO_BYTES };

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function photoProblem(file: { type: string; size: number }): "photo-type" | "photo-size" | null {
  if (!PHOTO_TYPES.includes(file.type as (typeof PHOTO_TYPES)[number])) return "photo-type";
  if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) return "photo-size";
  return null;
}
