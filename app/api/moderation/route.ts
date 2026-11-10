import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { authorizeModeration } from "@/lib/moderation/moderation";
import { decideFlag, queueForAdmin } from "@/lib/moderation/store";

export const runtime = "nodejs";

/**
 * Admin queue. A seller cannot grant themselves admin.
 * The body is never used to widen the role.
 */
export async function GET(): Promise<NextResponse> {
  const allowed = await adminActor();
  if (!allowed.ok) return NextResponse.json({ ok: false, error: { code: allowed.code } }, { status: allowed.status });
  const queue = await queueForAdmin();
  return NextResponse.json({ ok: true, queue });
}

export async function POST(request: Request): Promise<NextResponse> {
  const allowed = await adminActor(request);
  if (!allowed.ok) return NextResponse.json({ ok: false, error: { code: allowed.code } }, { status: allowed.status });
  const body = (await request.json().catch(() => null)) as { flagId?: unknown; decision?: unknown } | null;
  const flagId = typeof body?.flagId === "string" ? body.flagId : "";
  const decision = typeof body?.decision === "string" ? body.decision : "";
  const result = await decideFlag({ actorId: allowed.userId, flagId, decision });
  if (!result.ok) return NextResponse.json({ ok: false, error: { code: result.code } }, { status: 400 });
  return NextResponse.json({ ok: true, moderation: result.moderation });
}

async function adminActor(
  request?: Request,
): Promise<{ ok: true; userId: string } | { ok: false; code: "unauthenticated" | "forbidden"; status: number }> {
  const session = await getSession();
  let claimed = false;
  if (request) {
    const body = (await request.clone().json().catch(() => null)) as { admin?: unknown } | null;
    claimed = body?.admin === true;
  }
  const decision = authorizeModeration(session?.user.id ?? null, process.env.ADMIN_USER_IDS, claimed);
  if (!decision.ok) {
    return { ok: false, code: decision.code, status: decision.code === "unauthenticated" ? 401 : 403 };
  }
  return { ok: true, userId: session!.user.id };
}
