import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizeResource } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { stringifyArray } from "@/lib/utils";
import { resourceSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function resourcePayload(input: unknown) {
  const data = resourceSchema.parse(input);
  return { ...data, tags: stringifyArray(data.tags) };
}

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) return fail("没有找到这个资源。", "NOT_FOUND", 404);
  return ok(normalizeResource(resource));
}

export async function PUT(request: Request, { params }: Context) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    const resource = await prisma.resource.update({ where: { id }, data: resourcePayload(await request.json()) });
    return ok(normalizeResource(resource));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    await prisma.resource.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
