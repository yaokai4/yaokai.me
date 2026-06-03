import { NextRequest } from "next/server";
import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizeGuide } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/utils";
import { guideSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function guidePayload(input: unknown) {
  const data = guideSchema.parse(input);
  return {
    ...data,
    tags: stringifyArray(data.tags),
    coverImage: data.coverImage || null,
    publishedAt: data.status === "PUBLISHED" ? (data.publishedAt ? new Date(data.publishedAt) : new Date()) : data.publishedAt ? new Date(data.publishedAt) : null
  };
}

export async function GET(request: NextRequest) {
  const admin = Boolean(await requireMaybeAdmin());
  const status = request.nextUrl.searchParams.get("status");
  const guides = await prisma.guide.findMany({
    where: admin && status ? { status } : admin ? {} : { status: "PUBLISHED" },
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }]
  });
  return ok(guides.map(normalizeGuide));
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = guidePayload(await request.json());
    const exists = await prisma.guide.findUnique({ where: { slug: data.slug } });
    if (exists) return fail("这个别名已经存在。", "CONFLICT", 409);
    const guide = await prisma.guide.create({ data });
    return ok(normalizeGuide(guide), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
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
