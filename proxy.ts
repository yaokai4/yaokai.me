import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { ADMIN_ENTRY_COOKIE, AUTH_COOKIE } from "@/lib/auth";
import {
  defaultLocale,
  getLocaleFromPathname,
  localeCookieName,
  normalizeLocale,
  stripLocaleFromPathname,
  withLocalePath
} from "@/lib/i18n";
import { isVpsPrivateMode } from "@/lib/vps-private-mode";

function getSecret() {
  const secret = process.env.VPS_AUTH_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET || "please-change-this-secret";
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

async function vpsRedirect(request: NextRequest, pathname: string) {
  if (pathname !== "/vps" && !pathname.startsWith("/vps/")) return null;
  const signedIn = await hasValidSession(request);
  if (isVpsPrivateMode() && !signedIn) {
    return NextResponse.redirect(new URL("/yaokai", request.url));
  }
  if (pathname === "/vps") {
    return NextResponse.redirect(new URL(signedIn ? "/vps/access" : "/vps/login", request.url));
  }
  if (pathname === "/vps/access" && !signedIn) {
    return NextResponse.redirect(new URL("/vps/login", request.url));
  }
  if (pathname === "/vps/login" && signedIn) {
    return NextResponse.redirect(new URL("/vps/access", request.url));
  }
  if (pathname === "/vps/dashboard" && !signedIn) {
    return NextResponse.redirect(new URL("/vps/login", request.url));
  }
  return null;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeFromPath = getLocaleFromPathname(pathname);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = withLocalePath("/", defaultLocale);
    return NextResponse.redirect(url);
  }

  if (localeFromPath) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-yaokai-locale", localeFromPath);

    const url = request.nextUrl.clone();
    url.pathname = stripLocaleFromPathname(pathname);
    if (url.pathname.startsWith("/admin")) {
      if (url.pathname.startsWith("/admin/vps")) {
        return NextResponse.redirect(new URL("/yaokai", request.url));
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    const redirected = await vpsRedirect(request, url.pathname);
    if (redirected) return redirected;
    const response = NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders
      }
    });
    response.cookies.set(localeCookieName, localeFromPath, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });
    return response;
  }

  const cookieLocale = normalizeLocale(request.cookies.get(localeCookieName)?.value);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-yaokai-locale", cookieLocale);

  const redirected = await vpsRedirect(request, pathname);
  if (redirected) return redirected;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  const hasAdminEntry = request.cookies.get(ADMIN_ENTRY_COOKIE)?.value === "1";
  if (!hasAdminEntry) {
    if (pathname.startsWith("/admin/vps")) {
      if (!(await hasValidSession(request))) {
        return NextResponse.redirect(new URL("/yaokai", request.url));
      }
      const response = NextResponse.next({
        request: {
          headers: requestHeaders
        }
      });
      response.cookies.set(ADMIN_ENTRY_COOKIE, "1", {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax"
      });
      return response;
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin/login")) {
    if (await hasValidSession(request)) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  if (!(await hasValidSession(request))) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|apple-touch-icon.png|manifest.webmanifest|robots.txt|sitemap.xml|images).*)"
  ]
};
