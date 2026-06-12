import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizeResource } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { stringifyArray } from "@/lib/utils";
import { resourceSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function resourcePayload(input: unknown) {
  const data = resourceSchema.parse(input);
  return { ...data, tags: stringifyArray(data.tags) };
}

export async function GET() {
  const resources = await prisma.resource.findMany({ orderBy: [{ featured: "desc" }, { category: "asc" }, { createdAt: "desc" }] });
  return ok(resources.map(normalizeResource));
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const resource = await prisma.resource.create({ data: resourcePayload(await request.json()) });
    return ok(normalizeResource(resource), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
