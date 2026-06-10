import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { accessProfilePayload, actorCanViewProfile, canManageAccessProfiles, sanitizeAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const actor = await requireVpsUser();
    const { id } = await params;
    if (!(await actorCanViewProfile(actor, id))) return fail("无权查看这条访问配置。", "FORBIDDEN", 403);
    const profile = await prisma.vpsAccessProfile.update({
      where: { id },
      data: { lastViewedAt: new Date() }
    });
    const safe = sanitizeAccessProfile(profile);
    await writeVpsAuditLog({ request, actor, action: "access_profile_viewed", targetType: "access_profile", targetId: id });
    return ok(safe);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canManageAccessProfiles(actor)) return fail("只有 owner/admin 可以修改访问配置。", "FORBIDDEN", 403);
    const { id } = await params;
    const before = await prisma.vpsAccessProfile.findUnique({ where: { id } });
    const data = accessProfilePayload(await request.json());
    const profile = await prisma.vpsAccessProfile.update({ where: { id }, data });
    const safe = sanitizeAccessProfile(profile);
    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_updated",
      targetType: "access_profile",
      targetId: id,
      before: sanitizeAccessProfile(before),
      after: safe
    });
    return ok(safe);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}

export async function PUT(request: NextRequest, context: Context) {
  return PATCH(request, context);
}
