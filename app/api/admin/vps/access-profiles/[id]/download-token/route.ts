import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { assertProfileDownloadable, canDownloadAccessProfile, createDownloadTokenHash } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomToken } from "@/lib/secure-config";
import { assertSameOrigin, getRequestMeta } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

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
    if (!canDownloadAccessProfile(actor, profile.user.email)) return fail("无权下载这条访问配置。", "FORBIDDEN", 403);
    if (profile.status === "revoked" || profile.revokedAt) return fail("访问配置已吊销，不能下载。", "FORBIDDEN", 403);
    if (profile.expiresAt.getTime() <= Date.now() || profile.status === "expired") return fail("访问配置已过期，不能下载。", "FORBIDDEN", 403);
    if (!profile.encryptedConfig) return fail("请先生成访问配置。", "BAD_REQUEST", 400);
    await assertProfileDownloadable(id);

    const token = randomToken(32);
    const meta = getRequestMeta(request);
    const download = await prisma.vpsAccessProfileDownload.create({
      data: {
        profileId: id,
        requestedBy: actor.email,
        tokenHash: createDownloadTokenHash(token),
        expiresAt: new Date(Date.now() + 10 * 60_000),
        ipHash: meta.ipHash,
        userAgent: meta.userAgent
      }
    });

    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_download_token_created",
      targetType: "access_profile",
      targetId: id,
      after: { downloadId: download.id, expiresAt: download.expiresAt }
    });

    return ok({
      token,
      expiresAt: download.expiresAt,
      downloadUrl: `/api/vps/access/download/${token}`
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
