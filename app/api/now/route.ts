import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { nowItemSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await prisma.nowItem.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }] }));
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const item = await prisma.nowItem.create({ data: nowItemSchema.parse(await request.json()) });
    return ok(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
