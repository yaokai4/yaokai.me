import { NextRequest } from "next/server";
import { authenticate, createSession } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, getClientIp, getRequestMeta } from "@/lib/security";
import { loginSchema } from "@/lib/validations";

const loginRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkLoginRateLimit(ip: string) {
  const now = Date.now();
  const current = loginRateLimit.get(ip);
  if (!current || current.resetAt < now) {
    loginRateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (current.count >= 6) return false;
  current.count += 1;
  return true;
}

function resetLoginRateLimit(ip: string) {
  loginRateLimit.delete(ip);
}

async function auditLogin(request: NextRequest, action: "login" | "login_failed", account: string, result: "success" | "failure", errorMessage?: string) {
  try {
    const meta = getRequestMeta(request);
    await prisma.vpsAuditLog.create({
      data: {
        action,
        targetType: "auth",
        actorEmail: account,
        result,
        errorMessage,
        ipHash: meta.ipHash,
        userAgent: meta.userAgent,
        requestId: meta.requestId
      }
    });
  } catch (error) {
    console.error("Auth audit log failed", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    const payload = loginSchema.parse(await request.json());
    const user = await authenticate(payload.account, payload.password);

    if (user) {
      resetLoginRateLimit(ip);
      await createSession(user);
      await auditLogin(request, "login", user.email, "success");
      return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }

    if (!checkLoginRateLimit(ip)) {
      return fail("登录尝试过于频繁，请稍后再试。", "RATE_LIMITED", 429);
    }

    await auditLogin(request, "login_failed", payload.account, "failure", "invalid_credentials");
    return fail("账号或密码不正确。", "UNAUTHORIZED", 401);
  } catch (error) {
    if (error instanceof Error && error.message === "CSRF_CHECK_FAILED") {
      return fail("请求来源无效。", "FORBIDDEN", 403);
    }
    return fail("登录参数无效。", "BAD_REQUEST", 400);
  }
}
