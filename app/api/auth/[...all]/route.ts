import { toNextJsHandler } from "better-auth/next-js";
import { authReady, emailSignUpReady, isEmailSignUpPath } from "@/lib/auth/config";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";

function unavailable() {
  return Response.json(
    { error: "Accounts need DATABASE_URL and BETTER_AUTH_SECRET." },
    { status: 503 },
  );
}

function signUpUnavailable() {
  return Response.json(
    {
      message:
        "Email sign-up is unavailable until verification mail can be sent. No account was created.",
      code: "SIGN_UP_UNAVAILABLE",
    },
    { status: 503 },
  );
}

async function handle(request: Request) {
  const path = new URL(request.url).pathname;
  if (!authReady()) {
    if (request.method === "GET" && path.replace(/\/+$/, "").endsWith("/get-session")) {
      return Response.json(null);
    }
    return unavailable();
  }
  if (request.method === "POST" && isEmailSignUpPath(path) && !emailSignUpReady()) {
    return signUpUnavailable();
  }
  const handler = toNextJsHandler(getAuth());
  if (request.method === "GET") return handler.GET(request);
  if (request.method === "POST") return handler.POST(request);
  return new Response("Method not allowed", { status: 405 });
}

export const GET = handle;
export const POST = handle;
