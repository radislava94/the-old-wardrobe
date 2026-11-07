import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { MAX_PHOTO_BYTES, PHOTO_TYPES } from "@/lib/listings/photo-rules";

export const runtime = "nodejs";

/**
 * Token endpoint for a direct browser upload. The image never passes through
 * the server action body. Production has no disk fallback.
 */
export async function POST(request: Request): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "photo-blob" }, { status: 503 });
  }
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "forbidden" }, { status: 401 });

  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [...PHOTO_TYPES],
        maximumSizeInBytes: MAX_PHOTO_BYTES,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "photo" }, { status: 400 });
  }
}
