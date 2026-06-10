import { NextRequest } from "next/server";
import { canUseOwnAccessProfile, getMyAccessProfile } from "@/lib/access-profiles";
import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWireGuardPeerRuntimeStatus } from "@/lib/wireguard-runtime";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireVpsUser();
    if (!canUseOwnAccessProfile(actor)) return fail("当前角色不能检查连接状态。", "FORBIDDEN", 403);

    const profile = await getMyAccessProfile(actor, false);
    if (!profile) return fail("尚未生成访问配置。", "NOT_FOUND", 404);
    if (!profile.publicKey) return fail("访问配置尚未生成 peer。", "BAD_REQUEST", 400);

    const runtimeStatus = await getWireGuardPeerRuntimeStatus(String(profile.publicKey));
    let lastUsedAt = profile.lastUsedAt || null;

    if (runtimeStatus.latestHandshakeAt) {
      const handshakeAt = new Date(runtimeStatus.latestHandshakeAt);
      const updated = await prisma.vpsAccessProfile.updateMany({
        where: {
          id: String(profile.id),
          OR: [
            { lastUsedAt: null },
            { lastUsedAt: { lt: handshakeAt } }
          ]
        },
        data: { lastUsedAt: handshakeAt }
      });
      if (updated.count) lastUsedAt = handshakeAt;
    }

    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_runtime_checked",
      targetType: "access_profile",
      targetId: String(profile.id),
      after: {
        available: runtimeStatus.available,
        status: runtimeStatus.status,
        hasRuntimePeer: runtimeStatus.hasRuntimePeer,
        latestHandshakeAt: runtimeStatus.latestHandshakeAt,
        transferRxBytes: runtimeStatus.transferRxBytes,
        transferTxBytes: runtimeStatus.transferTxBytes
      }
    });

    return ok({
      runtimeStatus,
      profile: {
        id: profile.id,
        lastUsedAt
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法检查连接状态。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
