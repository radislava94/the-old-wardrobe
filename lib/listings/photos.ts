import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_PHOTO_BYTES, photoProblem } from "./photo-rules";

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function productionPhotoStore(): boolean {
  return process.env.VERCEL_ENV === "production";
}

/**
 * Local development only, for a file the browser already compressed.
 * Production uploads go straight to Vercel Blob and never reach this function.
 */
export async function storeLocalListingPhoto(file: File): Promise<string> {
  if (productionPhotoStore()) {
    throw new Error("photo-blob");
  }
  const problem = photoProblem(file);
  if (problem) throw new Error(problem);
  if (file.size > LOCAL_PHOTO_BYTES) throw new Error("photo-size");

  const bytes = Buffer.from(await file.arrayBuffer());
  const name = `${crypto.randomUUID()}.jpg`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}

export function isStoredPhotoUrl(url: string): boolean {
  if (url.startsWith("/uploads/") && !productionPhotoStore()) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".public.blob.vercel-storage.com")
    );
  } catch {
    return false;
  }
}
