import { z } from "zod";
import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { getCopyOverrides, saveCopyOverrides } from "@/lib/copy-overrides.server";
import { assertSameOrigin } from "@/lib/security";

export const dynamic = "force-dynamic";

const copyOverridesSchema = z.record(z.string(), z.string());

export async function GET() {
  try {
    await requireAdmin();
    return ok(await getCopyOverrides());
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const overrides = copyOverridesSchema.parse(await request.json());
    await saveCopyOverrides(overrides);
    return ok(await getCopyOverrides());
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
