import { ensureVpsIdentity, getMyAccessProfile } from "@/lib/access-profiles";
import { ok, fail } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentEndpoint, sanitizeEndpoint } from "@/lib/vps-endpoint";
import { getSecureAccessReadiness } from "@/lib/secure-access-readiness";
import { vpsErrorMessage } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const actor = await requireVpsUser();
    const endpoint = await getCurrentEndpoint();
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
    return ok({
      endpoint: sanitizeEndpoint(endpoint),
      profile,
      readiness
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法检查 Endpoint。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
