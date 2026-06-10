import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api-response";
import { assertCompleteWireGuardConfig, assertProfileDownloadable, canDownloadAccessProfile, createDownloadTokenHash, decryptAccessProfileConfig } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Context = { params: Promise<{ token: string }> };

function filename(value: string) {
  return `${value.replace(/[^a-z0-9-]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "secure-access"}.conf`;
}

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const actor = await requireVpsUser();
    const { token } = await params;
    const download = await prisma.vpsAccessProfileDownload.findUnique({
      where: { tokenHash: createDownloadTokenHash(token) },
      include: { profile: { include: { user: { select: { email: true } } } } }
    });

    if (!download) return fail("下载链接无效。", "NOT_FOUND", 404);
    if (download.usedAt) return fail("下载链接已经使用。", "FORBIDDEN", 403);
    if (download.expiresAt.getTime() <= Date.now()) return fail("下载链接已过期。", "FORBIDDEN", 403);
    if (!canDownloadAccessProfile(actor, download.profile.user.email)) return fail("无权下载这条访问配置。", "FORBIDDEN", 403);
    if (download.profile.status !== "active") return fail("访问配置当前不可下载。", "FORBIDDEN", 403);
    if (download.profile.revokedAt || download.profile.expiresAt.getTime() <= Date.now()) return fail("访问配置已失效，不能下载。", "FORBIDDEN", 403);
    if (!download.profile.encryptedConfig) return fail("访问配置尚未生成。", "BAD_REQUEST", 400);
    await assertProfileDownloadable(download.profileId);

    const consumed = await prisma.vpsAccessProfileDownload.updateMany({
      where: { id: download.id, usedAt: null },
      data: { usedAt: new Date() }
    });
    if (!consumed.count) return fail("下载链接已经使用。", "FORBIDDEN", 403);

    const config = decryptAccessProfileConfig(download.profile.encryptedConfig);
    assertCompleteWireGuardConfig(config);
    await prisma.vpsAccessProfile.update({
      where: { id: download.profileId },
      data: { lastDownloadedAt: new Date() }
    });
    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_downloaded",
      targetType: "access_profile",
      targetId: download.profileId,
      after: { downloadId: download.id }
    });

    return new NextResponse(config, {
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "content-disposition": `attachment; filename="${filename(download.profile.name)}"`,
        "cache-control": "no-store"
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法下载配置。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
