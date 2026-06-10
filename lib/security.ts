import crypto from "node:crypto";
import { NextRequest } from "next/server";

export function getClientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

export function hashValue(value: string) {
  return crypto
    .createHash("sha256")
    .update(`${process.env.VPS_AUTH_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET || "local"}:${value}`)
    .digest("hex");
}

export function getRequestMeta(request: Request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  return {
    ipHash: hashValue(getClientIp(request)),
    userAgent: request.headers.get("user-agent") || "",
    requestId
  };
}

export function assertSameOrigin(request: NextRequest | Request) {
  const method = request.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const origin = request.headers.get("origin");
  if (!origin) return;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");
  if (!host) return;

  const protocol = request.headers.get("x-forwarded-proto") || (process.env.NODE_ENV === "production" ? "https" : "http");
  const expected = `${protocol}://${host}`;
  if (origin !== expected) {
    throw new Error("CSRF_CHECK_FAILED");
  }
}
