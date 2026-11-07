export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Local dev posts a compressed file through the server action. Stay under its limit. */
export const LOCAL_PHOTO_BYTES = 900 * 1024;

export const PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
] as const;

export function photoProblem(file: { type: string; size: number }): "photo-type" | "photo-size" | null {
  if (!PHOTO_TYPES.includes(file.type as (typeof PHOTO_TYPES)[number])) return "photo-type";
  if (file.size <= 0 || file.size > MAX_PHOTO_BYTES) return "photo-size";
  return null;
}
