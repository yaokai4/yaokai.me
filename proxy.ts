import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_ENTRY_COOKIE, AUTH_COOKIE } from "@/lib/auth";

function getSecret() {
  const secret = process.env.JWT_SECRET || "please-change-this-secret";
  return new TextEncoder().encode(secret);
}

async function hasValidSession(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAdminEntry = request.cookies.get(ADMIN_ENTRY_COOKIE)?.value === "1";

  if (!hasAdminEntry) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin/login")) {
    if (await hasValidSession(request)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!(await hasValidSession(request))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
