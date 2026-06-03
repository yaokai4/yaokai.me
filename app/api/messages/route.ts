import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

function getIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "local";
}

function hash(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

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
    const ip = getIp(request);
    if (!checkRateLimit(ip)) {
      return fail("请稍等片刻后再发送留言。", "RATE_LIMITED", 429);
    }

    const data = messageSchema.parse(await request.json());
    const message = await prisma.message.create({
      data: {
        ...data,
        ipHash: hash(ip)
      }
    });
    return ok({ id: message.id, createdAt: message.createdAt }, { status: 201 });
  } catch (error) {
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
