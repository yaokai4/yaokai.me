import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { accessProfilePayload, canManageAccessProfiles, sanitizeAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const actor = await requireVpsUser();
    const ownUser = await prisma.vpsUser.findUnique({ where: { email: actor.email }, select: { id: true } });
    const profiles = await prisma.vpsAccessProfile.findMany({
      where: canManageAccessProfiles(actor) || ["AUDITOR", "auditor"].includes(actor.role) ? {} : ownUser ? { userId: ownUser.id } : { id: "__none__" },
      orderBy: { updatedAt: "desc" },
      take: 300
    });
    return ok(profiles.map((profile) => sanitizeAccessProfile(profile)));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canManageAccessProfiles(actor)) return fail("只有 owner/admin 可以创建访问配置。", "FORBIDDEN", 403);
    const data = accessProfilePayload(await request.json());
    const profile = await prisma.vpsAccessProfile.create({ data });
    const safe = sanitizeAccessProfile(profile);
    await writeVpsAuditLog({
      request,
      actor,
      action: "access_profile_created",
      targetType: "access_profile",
      targetId: profile.id,
      after: safe
    });
    return ok(safe, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
