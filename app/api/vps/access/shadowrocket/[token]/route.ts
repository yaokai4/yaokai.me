import { NextRequest, NextResponse } from "next/server";
import {
  assertProfileDownloadable,
  createShadowrocketTokenHash,
  decryptAccessProfileConfig
} from "@/lib/access-profiles";
import { fail } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { buildShadowrocketSubscription } from "@/lib/shadowrocket";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ token: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { token } = await params;
    const download = await prisma.vpsAccessProfileDownload.findUnique({
      where: { tokenHash: createShadowrocketTokenHash(token) },
      include: {
        profile: {
          include: {
            user: { select: { id: true, email: true, role: true } }
          }
        }
      }
    });

    if (!download) return fail("私有导入链接无效。", "NOT_FOUND", 404);
    if (download.usedAt) return fail("私有导入链接已经使用。", "FORBIDDEN", 403);
    if (download.expiresAt.getTime() <= Date.now()) return fail("私有导入链接已过期。", "FORBIDDEN", 403);
    if (download.profile.status !== "active") return fail("访问配置当前不可导入。", "FORBIDDEN", 403);
    if (download.profile.revokedAt || download.profile.expiresAt.getTime() <= Date.now()) {
      return fail("访问配置已失效，不能导入。", "FORBIDDEN", 403);
    }
    if (!download.profile.encryptedConfig) return fail("访问配置尚未生成。", "BAD_REQUEST", 400);
    await assertProfileDownloadable(download.profileId);

    const configText = decryptAccessProfileConfig(download.profile.encryptedConfig);
    const subscription = buildShadowrocketSubscription(configText, download.profile.name);
    const consumedAt = new Date();

    await prisma.$transaction(async (tx) => {
      const currentProfile = await tx.vpsAccessProfile.findUnique({
        where: { id: download.profileId },
        select: { status: true, revokedAt: true, expiresAt: true, encryptedConfig: true }
      });
      if (
        !currentProfile ||
        currentProfile.status !== "active" ||
        currentProfile.revokedAt ||
        currentProfile.expiresAt.getTime() <= consumedAt.getTime() ||
        !currentProfile.encryptedConfig
      ) {
        throw new Error("ACCESS_PROFILE_NOT_USABLE");
      }

      const consumed = await tx.vpsAccessProfileDownload.updateMany({
        where: {
          id: download.id,
          usedAt: null,
          expiresAt: { gt: consumedAt }
        },
        data: { usedAt: consumedAt }
      });
      if (!consumed.count) throw new Error("SHADOWROCKET_TOKEN_ALREADY_USED");

      await tx.vpsAccessProfile.update({
        where: { id: download.profileId },
        data: { lastDownloadedAt: consumedAt }
      });
    });

    await writeVpsAuditLog({
      request,
      actor: {
        id: download.profile.user.id,
        email: download.profile.user.email,
        role: download.profile.user.role
      },
      action: "access_profile_shadowrocket_imported",
      targetType: "access_profile",
      targetId: download.profileId,
      after: { downloadId: download.id }
    });

    return new NextResponse(subscription, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "content-disposition": "inline; filename=\"shadowrocket-secure-access.txt\"",
        "cache-control": "no-store, max-age=0",
        "x-content-type-options": "nosniff"
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "SHADOWROCKET_TOKEN_ALREADY_USED") {
      return fail("私有导入链接已经使用或过期。", "FORBIDDEN", 403);
    }
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
