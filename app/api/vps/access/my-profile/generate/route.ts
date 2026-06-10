import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { canUseOwnAccessProfile, generateMyAccessProfile, getMyAccessProfile, sanitizeAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseExpiry(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new Error("INVALID_EXPIRY");
  if (date.getTime() > Date.now() + 180 * 86_400_000) throw new Error("EXPIRY_TOO_LONG");
  return date;
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canUseOwnAccessProfile(actor)) return fail("当前角色不能生成或下载配置。", "FORBIDDEN", 403);
    const body = await request.json().catch(() => ({}));
    const profile = await generateMyAccessProfile({
      actor,
      request,
      deviceName: body.deviceName,
      deviceType: body.deviceType,
      expiresAt: parseExpiry(body.expiresAt)
    });
    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_generated",
      targetType: "access_profile",
      targetId: profile.id,
      after: sanitizeAccessProfile(profile)
    });
    return ok({ profile: await getMyAccessProfile(actor, true) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未登录，无法生成配置。", "UNAUTHORIZED", 401);
    if (error instanceof Error && error.message === "EXPIRY_TOO_LONG") return fail("过期时间不能超过 180 天。", "BAD_REQUEST", 400);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
