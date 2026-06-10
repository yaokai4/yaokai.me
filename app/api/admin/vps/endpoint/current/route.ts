import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { getCurrentEndpoint, sanitizeEndpoint, secureAccessInitializationPlan } from "@/lib/vps-endpoint";
import { vpsErrorMessage } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await requireVpsUser();
    const endpoint = await getCurrentEndpoint();
    return ok({
      endpoint: sanitizeEndpoint(endpoint),
      initializationPlan: secureAccessInitializationPlan(endpoint ?? undefined)
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
