import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { canWriteVps, vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!canWriteVps(actor)) return fail("当前角色不能执行写操作。", "FORBIDDEN", 403);
    const { id } = await params;
    const before = await prisma.vpsNode.findUnique({ where: { id } });
    const node = await prisma.vpsNode.update({ where: { id }, data: { status: "retired", archivedAt: new Date() } });
    await writeVpsAuditLog({ request, actor, action: "node_archived", targetType: "vps_node", targetId: id, before, after: node });
    return ok(node);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
