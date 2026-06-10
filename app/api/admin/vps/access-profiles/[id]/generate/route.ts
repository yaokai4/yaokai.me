import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { canManageAccessProfiles, rotateAccessProfile, sanitizeAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canManageAccessProfiles(actor)) return fail("只有 owner/admin 可以生成访问配置。", "FORBIDDEN", 403);
    const { id } = await params;
    const profile = await rotateAccessProfile(id);
    const safe = sanitizeAccessProfile(profile);
    await writeVpsAuditLog({ request, actor, action: "access_profile_rotated", targetType: "access_profile", targetId: id, after: safe });
    return ok({ generated: true, profile: safe });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
