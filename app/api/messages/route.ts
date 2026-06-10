import { NextRequest } from "next/server";
import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { sendContactNotification } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, getClientIp, hashValue } from "@/lib/security";
import { messageSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string) {
  const now = Date.now();
  const current = rateLimit.get(ip);
  if (!current || current.resetAt < now) {
    rateLimit.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (current.count >= 3) return false;
  current.count += 1;
  return true;
}

export async function GET() {
  try {
    await requireAdmin();
    const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });
    return ok(messages);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return fail("请稍等片刻后再发送留言。", "RATE_LIMITED", 429);
    }

    const payload = await request.json();
    if (typeof payload.company === "string" && payload.company.trim()) {
      return ok({ accepted: true }, { status: 202 });
    }

    const data = messageSchema.parse(payload);
    const message = await prisma.message.create({
      data: {
        ...data,
        status: "UNREAD",
        read: false,
        ipHash: hashValue(ip),
        userAgent: request.headers.get("user-agent") || null
      }
    });

    try {
      await sendContactNotification(data);
    } catch (error) {
      console.error("Contact notification failed", error);
    }

    return ok({ id: message.id, createdAt: message.createdAt }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "CSRF_CHECK_FAILED") {
      return fail("请求来源无效。", "FORBIDDEN", 403);
    }
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
