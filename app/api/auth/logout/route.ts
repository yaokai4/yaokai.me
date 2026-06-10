import { NextRequest } from "next/server";
import { clearSession } from "@/lib/auth";
import { ok } from "@/lib/api-response";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRequestMeta } from "@/lib/security";

export async function POST(request: NextRequest) {
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
}
