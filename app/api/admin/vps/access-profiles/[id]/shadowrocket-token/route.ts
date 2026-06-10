import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import {
  assertProfileDownloadable,
  canDownloadAccessProfile,
  createProfileShadowrocketToken
} from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    const { id } = await params;
    const profile = await prisma.vpsAccessProfile.findUnique({
      where: { id },
      include: { user: { select: { email: true } } }
    });
    if (!profile) return fail("访问配置不存在。", "NOT_FOUND", 404);
    if (!canDownloadAccessProfile(actor, profile.user.email)) return fail("无权为这条访问配置生成私有导入链接。", "FORBIDDEN", 403);
    if (profile.status !== "active" || profile.revokedAt || profile.expiresAt.getTime() <= Date.now()) {
      return fail("只有有效的 active 配置可以生成私有导入链接。", "FORBIDDEN", 403);
    }
    await assertProfileDownloadable(id);

    const result = await createProfileShadowrocketToken({
      profileId: id,
      actor,
      request
    });
    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_shadowrocket_token_created",
      targetType: "access_profile",
      targetId: id,
      after: { downloadId: result.download.id, expiresAt: result.download.expiresAt }
    });
    return ok({
      token: result.token,
      expiresAt: result.download.expiresAt,
      importUrl: result.importUrl
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(
      vpsErrorMessage(error),
      error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST",
      error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400
    );
  }
}
