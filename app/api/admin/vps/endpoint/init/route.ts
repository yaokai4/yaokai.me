import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { canManageAccessProfiles } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { initializeCurrentEndpoint, sanitizeEndpoint, secureAccessInitializationPlan } from "@/lib/vps-endpoint";
import { vpsErrorMessage } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canManageAccessProfiles(actor)) return fail("当前角色不能初始化 Endpoint。", "FORBIDDEN", 403);
    const body = await request.json().catch(() => ({}));
    const endpoint = await initializeCurrentEndpoint({
      request,
      actor,
      input: {
        publicHost: body.publicHost,
        publicIp: body.publicIp,
        region: body.region,
        listenPort: body.listenPort ? Number(body.listenPort) : undefined,
        dns: body.dns,
        mtu: body.mtu ? Number(body.mtu) : undefined,
        allowedIpTemplate: body.allowedIpTemplate,
        clientAllowedIps: body.clientAllowedIps
      }
    });
    return ok({
      endpoint: sanitizeEndpoint(endpoint),
      initializationPlan: secureAccessInitializationPlan(endpoint)
    }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
