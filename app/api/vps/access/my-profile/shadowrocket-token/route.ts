import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import {
  assertProfileDownloadable,
  canUseOwnAccessProfile,
  createProfileShadowrocketToken,
  getMyAccessProfile
} from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canUseOwnAccessProfile(actor)) return fail("当前角色不能生成私有导入链接。", "FORBIDDEN", 403);
    const profile = await getMyAccessProfile(actor, false);
    if (!profile) return fail("尚未生成访问配置。", "NOT_FOUND", 404);
    if (profile.status !== "active") return fail("只有 active 配置可以生成私有导入链接。", "FORBIDDEN", 403);
    await assertProfileDownloadable(String(profile.id));

    const result = await createProfileShadowrocketToken({
      profileId: String(profile.id),
      actor,
      request
    });
    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_shadowrocket_token_created",
      targetType: "access_profile",
      targetId: String(profile.id),
      after: { downloadId: result.download.id, expiresAt: result.download.expiresAt }
    });
    return ok({
      token: result.token,
      expiresAt: result.download.expiresAt,
      importUrl: result.importUrl
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法生成私有导入链接。", "UNAUTHORIZED", 401);
    return fail(
      vpsErrorMessage(error),
      error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST",
      error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400
    );
  }
}
