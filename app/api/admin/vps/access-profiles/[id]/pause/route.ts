import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { canManageAccessProfiles, pauseAccessProfile, sanitizeAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canManageAccessProfiles(actor)) return fail("只有 owner/admin 可以暂停访问配置。", "FORBIDDEN", 403);
    const { id } = await params;
    const before = await prisma.vpsAccessProfile.findUnique({ where: { id } });
    const profile = await pauseAccessProfile(id);
    const safe = sanitizeAccessProfile(profile);
    await writeVpsAuditLog({ request, actor, action: "access_profile_paused", targetType: "access_profile", targetId: id, before: sanitizeAccessProfile(before), after: safe });
    return ok(safe);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
