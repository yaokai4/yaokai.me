import { NextRequest } from "next/server";
import { canUseOwnAccessProfile, getMyAccessProfile } from "@/lib/access-profiles";
import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { getWireGuardPeerRuntimeStatus, type WireGuardPeerRuntimeStatus } from "@/lib/wireguard-runtime";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const POLL_INTERVAL_MS = 2000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clampTimeout(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 60;
  return Math.min(90, Math.max(10, Math.floor(parsed)));
}

function verificationPassed(baseline: WireGuardPeerRuntimeStatus, current: WireGuardPeerRuntimeStatus) {
  if (!current.available || !current.hasRuntimePeer || !current.latestHandshakeEpoch) return false;
  const transferGrew = current.transferTotalBytes > baseline.transferTotalBytes;
  const handshakeIsFresh = current.latestHandshakeAgeSeconds !== null && current.latestHandshakeAgeSeconds <= 180;
  const handshakeAdvanced = current.latestHandshakeEpoch > baseline.latestHandshakeEpoch;
  return transferGrew && handshakeIsFresh && (handshakeAdvanced || baseline.latestHandshakeEpoch > 0);
}

async function updateLastUsedAt(profileId: string, runtimeStatus: WireGuardPeerRuntimeStatus) {
  if (!runtimeStatus.latestHandshakeAt) return null;
  const handshakeAt = new Date(runtimeStatus.latestHandshakeAt);
  await prisma.vpsAccessProfile.updateMany({
    where: {
      id: profileId,
      OR: [
        { lastUsedAt: null },
        { lastUsedAt: { lt: handshakeAt } }
      ]
    },
    data: { lastUsedAt: handshakeAt }
  });
  return handshakeAt;
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canUseOwnAccessProfile(actor)) return fail("当前角色不能验证连接。", "FORBIDDEN", 403);

    const body = await request.json().catch(() => ({})) as { timeoutSeconds?: unknown };
    const timeoutSeconds = clampTimeout(body.timeoutSeconds);
    const profile = await getMyAccessProfile(actor, false);
    if (!profile) return fail("尚未生成访问配置。", "NOT_FOUND", 404);
    if (!profile.publicKey) return fail("访问配置尚未生成 peer。", "BAD_REQUEST", 400);

    const startedAt = Date.now();
    const baselineStatus = await getWireGuardPeerRuntimeStatus(String(profile.publicKey));
    let runtimeStatus = baselineStatus;
    let passed = verificationPassed(baselineStatus, runtimeStatus);

    while (!passed && Date.now() - startedAt < timeoutSeconds * 1000) {
      await sleep(POLL_INTERVAL_MS);
      runtimeStatus = await getWireGuardPeerRuntimeStatus(String(profile.publicKey));
      passed = verificationPassed(baselineStatus, runtimeStatus);
      if (!runtimeStatus.available || runtimeStatus.status === "not_applied") break;
    }

    const lastUsedAt = passed ? await updateLastUsedAt(String(profile.id), runtimeStatus) : null;
    const transferDeltaBytes = Math.max(0, runtimeStatus.transferTotalBytes - baselineStatus.transferTotalBytes);

    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_handshake_waited",
      targetType: "access_profile",
      targetId: String(profile.id),
      result: passed ? "success" : "failure",
      after: {
        passed,
        timeoutSeconds,
        baselineLatestHandshakeAt: baselineStatus.latestHandshakeAt,
        latestHandshakeAt: runtimeStatus.latestHandshakeAt,
        transferDeltaBytes,
        baselineTransferTotalBytes: baselineStatus.transferTotalBytes,
        transferTotalBytes: runtimeStatus.transferTotalBytes
      }
    });

    return ok({
      passed,
      timedOut: !passed && Date.now() - startedAt >= timeoutSeconds * 1000,
      timeoutSeconds,
      transferDeltaBytes,
      baselineStatus,
      runtimeStatus,
      profile: {
        id: profile.id,
        lastUsedAt: lastUsedAt || profile.lastUsedAt || null
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法验证连接。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
