import { NextRequest } from "next/server";
import { assertCompleteWireGuardConfig, assertProfileDownloadable, canUseOwnAccessProfile, getMyAccessProfile } from "@/lib/access-profiles";
import { ok, fail } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireVpsUser();
    if (!canUseOwnAccessProfile(actor)) return fail("当前角色不能查看配置。", "FORBIDDEN", 403);
    const profile = await getMyAccessProfile(actor, true);
    if (!profile) return fail("尚未生成访问配置。", "NOT_FOUND", 404);
    await assertProfileDownloadable(String(profile.id));
    if (!profile.configText) return fail("访问配置当前不可用。", "BAD_REQUEST", 400);
    assertCompleteWireGuardConfig(profile.configText);
    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_config_viewed",
      targetType: "access_profile",
      targetId: String(profile.id),
      after: { profileId: profile.id, configType: profile.configType }
    });
    return ok({
      profileId: profile.id,
      configType: profile.configType,
      configText: profile.configText
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法查看配置。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
