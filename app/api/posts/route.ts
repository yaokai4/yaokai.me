import { NextRequest } from "next/server";
import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizePost } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/utils";
import { postSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function postPayload(input: unknown) {
  const data = postSchema.parse(input);
  return {
    ...data,
    images: stringifyArray(data.images)
  };
}

export async function GET(request: NextRequest) {
  const includeHidden = request.nextUrl.searchParams.get("all") === "1" && Boolean(await requireMaybeAdmin());
  const posts = await prisma.post.findMany({
    where: includeHidden ? {} : { visible: true },
    orderBy: { createdAt: "desc" }
  });
  return ok(posts.map(normalizePost));
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const post = await prisma.post.create({ data: postPayload(await request.json()) });
    return ok(normalizePost(post), { status: 201 });
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
