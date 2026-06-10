import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { requireVpsUser } from "@/lib/auth";
import { assertSameOrigin } from "@/lib/security";
import { runVpsHealthChecks } from "@/lib/vps-health";
import { vpsErrorMessage } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request);
    const actor = await requireVpsUser();
    return ok(await runVpsHealthChecks(actor, request));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(vpsErrorMessage(error), error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? "FORBIDDEN" : "BAD_REQUEST", error instanceof Error && error.message === "CSRF_CHECK_FAILED" ? 403 : 400);
  }
}
