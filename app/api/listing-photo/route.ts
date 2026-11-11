import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { listingPhotos } from "@/lib/db/schema";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/listings/photo-rules";

export const runtime = "nodejs";

/**
 * Browser upload token. The pathname was chosen when the photo row was created.
 * The client's MIME and the upload callback are not treated as proof.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.DATABASE_URL?.trim()) {
    return NextResponse.json(
      { ok: false, error: { code: "invalid", fields: [{ field: "database", code: "database" }] } },
      { status: 503 },
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN?.trim()) {
    return NextResponse.json(
      { ok: false, error: { code: "invalid", fields: [{ field: "photo", code: "photo-blob" }] } },
      { status: 503 },
    );
  }
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ ok: false, error: { code: "unauthenticated" } }, { status: 401 });
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const photoId = payloadPhotoId(clientPayload);
        if (!photoId) throw new Error("forbidden");
        const rows = await getDb().select().from(listingPhotos).where(eq(listingPhotos.id, photoId));
        const photo = rows[0];
        if (!photo || photo.ownerId !== session.user.id || photo.pathname !== pathname) {
          throw new Error("forbidden");
        }
        return {
          allowedContentTypes: [...PHOTO_TYPES],
          maximumSizeInBytes: MAX_PHOTO_BYTES,
          addRandomSuffix: false,
        };
      },
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: false, error: { code: "forbidden" } }, { status: 400 });
  }
}

function payloadPhotoId(payload: string | null): string | null {
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload) as { photoId?: unknown };
    return typeof parsed.photoId === "string" ? parsed.photoId : null;
  } catch {
    return null;
  }
}
