import { NextRequest } from "next/server";
import { canUseOwnAccessProfile, getMyAccessProfile } from "@/lib/access-profiles";
import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin, hashValue } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function normalizeIp(value: unknown) {
  return String(value || "").trim().replace(/^::ffff:/i, "").toLowerCase();
}

function isIpLiteral(value: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) || (value.includes(":") && /^[0-9a-f:]+$/i.test(value));
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canUseOwnAccessProfile(actor)) return fail("当前角色不能验证出口 IP。", "FORBIDDEN", 403);

    const body = await request.json().catch(() => ({})) as { observedIp?: unknown; provider?: unknown };
    const observedIp = normalizeIp(body.observedIp);
    const provider = String(body.provider || "unknown").slice(0, 80);
    if (!observedIp || !isIpLiteral(observedIp)) return fail("没有拿到有效的设备出口 IP。", "BAD_REQUEST", 400);

    const current = await getMyAccessProfile(actor, false);
    if (!current) return fail("尚未生成访问配置。", "NOT_FOUND", 404);

    const profile = await prisma.vpsAccessProfile.findUnique({
      where: { id: String(current.id) },
      include: { endpoint: true }
    });
    if (!profile) return fail("访问配置不存在。", "NOT_FOUND", 404);

    const endpointHost = normalizeIp(profile.endpoint.publicHost);
    const expectedIp = normalizeIp(profile.endpoint.publicHostResolvedIp || profile.endpoint.publicIp || (isIpLiteral(endpointHost) ? endpointHost : ""));
    const passed = Boolean(expectedIp && observedIp === expectedIp);

    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_egress_checked",
      targetType: "access_profile",
      targetId: profile.id,
      result: passed ? "success" : "failure",
      after: {
        passed,
        expectedIpHash: expectedIp ? hashValue(expectedIp) : null,
        observedIpHash: hashValue(observedIp),
        provider
      }
    });

    return ok({
      passed,
      expectedIp: expectedIp || null,
      observedIp,
      provider,
      checkedAt: new Date().toISOString(),
      message: passed
        ? "设备公网出口 IP 与 Endpoint 公网 IP 一致。"
        : expectedIp
          ? "设备公网出口 IP 与 Endpoint 公网 IP 不一致。请确认 WireGuard 已开启并使用全隧道 AllowedIPs = 0.0.0.0/0。"
          : "Endpoint 公网 IP 尚未确认，无法完成出口 IP 对比。"
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法验证出口 IP。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
