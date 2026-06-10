import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizeArticle } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/utils";
import { articleSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function articlePayload(input: unknown) {
  const data = articleSchema.parse(input);
  return {
    ...data,
    tags: stringifyArray(data.tags),
    relatedProjects: stringifyArray(data.relatedProjects),
    relatedGuides: stringifyArray(data.relatedGuides),
    subtitle: data.subtitle || null,
    coverImage: data.coverImage || null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    ogImage: data.ogImage || null,
    publishedAt: data.status === "PUBLISHED" ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : data.publishedAt ? new Date(data.publishedAt) : null
  };
}

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const article = await prisma.article.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!article) return fail("没有找到这篇文章。", "NOT_FOUND", 404);
  return ok(normalizeArticle(article));
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = articlePayload(await request.json());
    const duplicate = await prisma.article.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (duplicate) return fail("这个别名已经存在。", "CONFLICT", 409);

    const article = await prisma.article.update({ where: { id }, data });
    return ok(normalizeArticle(article));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.article.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
