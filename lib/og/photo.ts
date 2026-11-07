import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PhotoKey } from "@/lib/types";

const files: Record<PhotoKey, string> = {
  beanie: "beanie.jpg",
  bomber: "bomber.jpg",
  denim: "denim.jpg",
  "floral-dress": "floral-dress.jpg",
  leather: "leather.jpg",
  "maxi-dress": "maxi-dress.jpg",
  poncho: "poncho.jpg",
  trench: "trench.jpg",
};

/** JPEG as a data URL for the OG card. Null when this listing has no readable photo. */
export async function listingPhotoDataUrl(photo: PhotoKey): Promise<string | null> {
  const file = files[photo];
  if (!file) return null;
  try {
    const buffer = await readFile(path.join(process.cwd(), "mockup/img", file));
    return `data:image/jpeg;base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}
