import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { ensureCurrentEndpoint, sanitizeEndpoint, secureAccessInitializationPlan } from "@/lib/vps-endpoint";
import { vpsErrorMessage } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    const endpoint = await ensureCurrentEndpoint({ request, actor, initializeKeys: false });
    return ok({
      endpoint: sanitizeEndpoint(endpoint),
      initializationPlan: secureAccessInitializationPlan(endpoint)
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
