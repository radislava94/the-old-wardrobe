import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Vercel Blob when BLOB_READ_WRITE_TOKEN is set.
 * Otherwise the file is written under public/uploads, which is fine locally
 * and is not durable on Vercel.
 */
export async function storeListingPhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("photo-type");
  }
  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new Error("photo-size");
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const safe = file.name.replace(/[^a-zA-Z0-9.]+/g, "-").replace(/^-|-$/g, "").slice(-48);
  const name = `${crypto.randomUUID()}-${safe || "photo.jpg"}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`listings/${name}`, bytes, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return `/uploads/${name}`;
}
