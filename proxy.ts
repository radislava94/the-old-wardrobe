import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const ACCOUNT = /^\/(mk|bg|sr-rs|sq-al)\/account(?:\/|$)/;

/**
 * Cookie presence only. The account page checks the session for real.
 */
export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(ACCOUNT);
  if (!match) return NextResponse.next();
  if (getSessionCookie(request)) return NextResponse.next();
  const country = match[1];
  const url = new URL(`/${country}/sign-in`, request.url);
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/mk/account",
    "/mk/account/:path*",
    "/bg/account",
    "/bg/account/:path*",
    "/sr-rs/account",
    "/sr-rs/account/:path*",
    "/sq-al/account",
    "/sq-al/account/:path*",
  ],
};
