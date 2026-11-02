import { NextResponse } from "next/server";

const YEAR = 60 * 60 * 24 * 180;

/** Stores the visitor's choice and sends them back. Both choices are equal. */
export async function POST(request: Request) {
  const form = await request.formData();
  const choice = form.get("choice") === "all" ? "all" : "essential";
  const referer = request.headers.get("referer");
  const back = referer && referer.startsWith(new URL(request.url).origin) ? referer : "/";
  const response = NextResponse.redirect(back, 303);
  response.cookies.set("ow_consent", choice, {
    path: "/",
    maxAge: YEAR,
    sameSite: "lax",
  });
  return response;
}
