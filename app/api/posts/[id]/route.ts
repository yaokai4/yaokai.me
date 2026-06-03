import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizePost } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/utils";
import { postSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function postPayload(input: unknown) {
  const data = postSchema.parse(input);
  return {
    ...data,
    images: stringifyArray(data.images)
  };
}

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return fail("没有找到这条动态。", "NOT_FOUND", 404);
  return ok(normalizePost(post));
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    const post = await prisma.post.update({ where: { id }, data: postPayload(await request.json()) });
    return ok(normalizePost(post));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.post.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
