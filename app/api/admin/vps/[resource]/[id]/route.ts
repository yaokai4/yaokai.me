import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { getVpsResourceConfig } from "@/lib/vps-config";
import { archiveOrDeleteVpsRecord, canReadVpsResource, canWriteVps, getVpsRecord, updateVpsRecord, vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ resource: string; id: string }> };

export async function GET(_: NextRequest, { params }: Context) {
  try {
    const actor = await requireVpsUser();
    const { resource, id } = await params;
    if (!getVpsResourceConfig(resource)) return fail("未知 VPS 资源。", "NOT_FOUND", 404);
    if (!canReadVpsResource(actor, resource)) return fail("当前角色不能查看这个资源。", "FORBIDDEN", 403);
    const record = await getVpsRecord(resource, id);
    if (!record) return fail("没有找到这条记录。", "NOT_FOUND", 404);
    return ok(record);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  const { resource, id } = await params;
  const config = getVpsResourceConfig(resource);
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!config) return fail("未知 VPS 资源。", "NOT_FOUND", 404);
    if (!canWriteVps(actor)) return fail("当前角色不能执行写操作。", "FORBIDDEN", 403);

    const before = await getVpsRecord(resource, id);
    const record = await updateVpsRecord(resource, id, await request.json());
    await writeVpsAuditLog({
      request,
      actor,
      action: `${config.auditTarget}_updated`,
      targetType: config.auditTarget,
      targetId: id,
      before,
      after: record
    });
    return ok(record);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  return PUT(request, context);
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const { resource, id } = await params;
  const config = getVpsResourceConfig(resource);
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!config) return fail("未知 VPS 资源。", "NOT_FOUND", 404);
    if (!canWriteVps(actor)) return fail("当前角色不能执行写操作。", "FORBIDDEN", 403);

    const before = await getVpsRecord(resource, id);
    const result = await archiveOrDeleteVpsRecord(resource, id);
    await writeVpsAuditLog({
      request,
      actor,
      action: `${config.auditTarget}_deleted`,
      targetType: config.auditTarget,
      targetId: id,
      before,
      after: result
    });
    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
