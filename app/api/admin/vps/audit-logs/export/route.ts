import { NextRequest, NextResponse } from "next/server";
import { fail } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { canExportVpsAuditLogs, listVpsRecords, toCsv, vpsErrorMessage } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireVpsUser();
    if (!canExportVpsAuditLogs(actor)) return fail("当前角色不能导出审计日志。", "FORBIDDEN", 403);
    const csv = toCsv(await listVpsRecords("audit-logs", request.nextUrl.searchParams));
    return new NextResponse(csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": "attachment; filename=\"vps-audit-logs.csv\""
      }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}
