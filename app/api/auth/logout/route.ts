import { NextRequest } from "next/server";
import { clearSession } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, getRequestMeta } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const user = await getSessionUser();
    await clearSession();
    if (user) {
      try {
        const meta = getRequestMeta(request);
        await prisma.vpsAuditLog.create({
          data: {
            actorId: user.id,
            actorEmail: user.email,
            action: "logout",
            targetType: "auth",
            result: "success",
            ipHash: meta.ipHash,
            userAgent: meta.userAgent,
            requestId: meta.requestId
          }
        });
      } catch (error) {
        console.error("Logout audit log failed", error);
      }
    }
    return ok({ loggedOut: true });
  } catch (error) {
    if (error instanceof Error && error.message === "CSRF_CHECK_FAILED") {
      return fail("请求来源无效。", "FORBIDDEN", 403);
    }
    return fail("退出登录失败。", "BAD_REQUEST", 400);
  }
}
