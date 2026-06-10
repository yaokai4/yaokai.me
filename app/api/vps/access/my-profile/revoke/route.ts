import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { canUseOwnAccessProfile, getMyAccessProfile, revokeAccessProfile, sanitizeAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canUseOwnAccessProfile(actor)) return fail("当前角色不能吊销配置。", "FORBIDDEN", 403);
    const current = await getMyAccessProfile(actor, false);
    if (!current) return fail("尚未生成访问配置。", "NOT_FOUND", 404);
    const before = await prisma.vpsAccessProfile.findUnique({ where: { id: String(current.id) } });
    const profile = await revokeAccessProfile(String(current.id), actor);
    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_revoked",
      targetType: "access_profile",
      targetId: profile.id,
      before: sanitizeAccessProfile(before),
      after: sanitizeAccessProfile(profile)
    });
    return ok({ profile: await getMyAccessProfile(actor, false) });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法吊销配置。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
