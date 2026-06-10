import { NextRequest } from "next/server";
import { ensureVpsIdentity, getMyAccessProfile } from "@/lib/access-profiles";
import { ok, fail } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { getSecureAccessReadiness } from "@/lib/secure-access-readiness";
import { ensureCurrentEndpoint, sanitizeEndpoint, secureAccessInitializationPlan } from "@/lib/vps-endpoint";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    const endpoint = await ensureCurrentEndpoint({ request, actor, initializeKeys: false });
    const vpsUser = await ensureVpsIdentity(actor);
    const [profile, rawProfile] = await Promise.all([
      getMyAccessProfile(actor, false),
      prisma.vpsAccessProfile.findFirst({
        where: {
          userId: vpsUser.id,
          status: { not: "revoked" }
        },
        orderBy: { updatedAt: "desc" }
      })
    ]);
    const readiness = getSecureAccessReadiness(endpoint, rawProfile);
    await writeVpsAuditLog({
      request,
      actor,
      action: "endpoint_diagnosed",
      targetType: "endpoint",
      targetId: endpoint.id,
      after: {
        status: endpoint.status,
        serviceStatus: endpoint.serviceStatus,
        wireGuardInstalled: endpoint.wireGuardInstalled,
        serviceRunning: endpoint.serviceRunning,
        portListening: endpoint.portListening,
        usable: readiness.usable
      }
    });
    return ok({
      endpoint: sanitizeEndpoint(endpoint),
      profile,
      readiness,
      initializationPlan: secureAccessInitializationPlan(endpoint)
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法诊断 Endpoint。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
