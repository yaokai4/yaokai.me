import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { getVpsResourceConfig } from "@/lib/vps-config";
import { canReadVpsResource, canWriteVps, createVpsRecord, listVpsRecords, vpsErrorMessage, writeVpsAuditLog } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ resource: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const actor = await requireVpsUser();
    const { resource } = await params;
    if (!getVpsResourceConfig(resource)) return fail("未知 VPS 资源。", "NOT_FOUND", 404);
    if (!canReadVpsResource(actor, resource)) return fail("当前角色不能查看这个资源。", "FORBIDDEN", 403);
    return ok(await listVpsRecords(resource, request.nextUrl.searchParams));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  const { resource } = await params;
  const config = getVpsResourceConfig(resource);
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    if (!config) return fail("未知 VPS 资源。", "NOT_FOUND", 404);
    if (!canWriteVps(actor)) return fail("当前角色不能执行写操作。", "FORBIDDEN", 403);

    const record = await createVpsRecord(resource, await request.json());
    await writeVpsAuditLog({
      request,
      actor,
      action: `${config.auditTarget}_created`,
      targetType: config.auditTarget,
      targetId: (record as { id?: string }).id,
      after: record
    });
    return ok(record, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    if (config) {
      await writeVpsAuditLog({
        request,
        action: `${config.auditTarget}_create_failed`,
        targetType: config.auditTarget,
        result: "failure",
        errorMessage: vpsErrorMessage(error)
      });
    }
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
