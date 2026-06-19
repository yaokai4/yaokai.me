import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizePlaybook } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { stringifyArray } from "@/lib/utils";
import { playbookSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function playbookPayload(input: unknown) {
  const data = playbookSchema.parse(input);
  return {
    ...data,
    principles: stringifyArray(data.principles),
    steps: stringifyArray(data.steps),
    relatedLinks: stringifyArray(data.relatedLinks)
  };
}

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const playbook = await prisma.playbook.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!playbook) return fail("没有找到这个方法论。", "NOT_FOUND", 404);
  return ok(normalizePlaybook(playbook));
}

export async function PUT(request: Request, { params }: Context) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    const data = playbookPayload(await request.json());
    const duplicate = await prisma.playbook.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (duplicate) return fail("这个别名已经存在。", "CONFLICT", 409);
    const playbook = await prisma.playbook.update({ where: { id }, data });
    return ok(normalizePlaybook(playbook));
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
    await prisma.playbook.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
