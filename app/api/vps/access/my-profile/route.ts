import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { canUseOwnAccessProfile, getMyAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireVpsUser();
    const profile = await getMyAccessProfile(actor, canUseOwnAccessProfile(actor));
    if (profile) {
      await writeVpsAuditLog({
        request,
        actor,
        action: "access_profile_viewed",
        targetType: "access_profile",
        targetId: String(profile.id)
      });
    }
    return ok({ profile });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法访问私有访问配置。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
