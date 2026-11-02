import { toNextJsHandler } from "better-auth/next-js";
import { authReady } from "@/lib/auth/config";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

function unavailable() {
  return Response.json(
    { error: "Accounts need DATABASE_URL and BETTER_AUTH_SECRET." },
    { status: 503 },
  );
}

async function handle(request: Request) {
  if (!authReady()) return unavailable();
  const handler = toNextJsHandler(getAuth());
  if (request.method === "GET") return handler.GET(request);
  if (request.method === "POST") return handler.POST(request);
  return new Response("Method not allowed", { status: 405 });
}

export const GET = handle;
export const POST = handle;
