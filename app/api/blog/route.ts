import { NextRequest } from "next/server";
import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizeArticle } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { stringifyArray } from "@/lib/utils";
import { articleSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

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

export async function GET(request: NextRequest) {
  const admin = Boolean(await requireMaybeAdmin());
  const status = request.nextUrl.searchParams.get("status");
  const articles = await prisma.article.findMany({
    where: admin && status ? { status } : admin ? {} : { status: "PUBLISHED" },
    orderBy: [{ pinned: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
  });
  return ok(articles.map(normalizeArticle));
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const data = articlePayload(await request.json());
    const exists = await prisma.article.findUnique({ where: { slug: data.slug } });
    if (exists) return fail("这个别名已经存在。", "CONFLICT", 409);

    const article = await prisma.article.create({ data });
    return ok(normalizeArticle(article), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return fail("未授权。", "UNAUTHORIZED", 401);
    }
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

async function requireMaybeAdmin() {
  try {
    return await requireAdmin();
  } catch {
    return null;
  }
}
