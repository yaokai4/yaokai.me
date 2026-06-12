import { NextResponse } from "next/server";

type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, code: ErrorCode = "BAD_REQUEST", status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: { message, code }
    },
    { status }
  );
}

export function normalizeError(error: unknown) {
  if (error instanceof Error) {
    if (error.message === "CSRF_CHECK_FAILED") return "请求来源无效。";
    return process.env.NODE_ENV === "production" ? "系统出现了一点问题。" : error.message;
  }

  return "系统出现了一点问题。";
}
