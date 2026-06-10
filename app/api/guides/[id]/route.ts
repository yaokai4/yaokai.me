import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizeGuide } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/utils";
import { guideSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function guidePayload(input: unknown) {
  const data = guideSchema.parse(input);
  return {
    ...data,
    tags: stringifyArray(data.tags),
    steps: stringifyArray(data.steps),
    checklist: stringifyArray(data.checklist),
    coverImage: data.coverImage || null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    ogImage: data.ogImage || null,
    publishedAt: data.status === "PUBLISHED" ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : data.publishedAt ? new Date(data.publishedAt) : null
  };
}

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const guide = await prisma.guide.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!guide) return fail("没有找到这篇指南。", "NOT_FOUND", 404);
  return ok(normalizeGuide(guide));
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = guidePayload(await request.json());
    const duplicate = await prisma.guide.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (duplicate) return fail("这个别名已经存在。", "CONFLICT", 409);
    const guide = await prisma.guide.update({ where: { id }, data });
    return ok(normalizeGuide(guide));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.guide.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
