import { NextRequest, NextResponse } from "next/server";
import { ADMIN_ENTRY_COOKIE, AUTH_COOKIE } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = request.cookies.get(AUTH_COOKIE)?.value;
  const target = session ? "/admin" : "/admin/login";
  const fallbackUrl = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || fallbackUrl.host;
  const protocol = request.headers.get("x-forwarded-proto") || fallbackUrl.protocol.replace(":", "") || "https";
  const response = NextResponse.redirect(new URL(target, `${protocol}://${host}`));

  response.cookies.set(ADMIN_ENTRY_COOKIE, "1", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24
  });

  return response;
}
