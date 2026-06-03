import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizeProject } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/utils";
import { projectSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

function projectPayload(input: unknown) {
  const data = projectSchema.parse(input);
  return {
    ...data,
    techStack: stringifyArray(data.techStack),
    coverImage: data.coverImage || null,
    demoUrl: data.demoUrl || null,
    githubUrl: data.githubUrl || null
  };
}

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const project = await prisma.project.findFirst({ where: { OR: [{ id }, { slug: id }] } });
  if (!project) return fail("没有找到这个项目。", "NOT_FOUND", 404);
  return ok(normalizeProject(project));
}

export async function PUT(request: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    const data = projectPayload(await request.json());
    const duplicate = await prisma.project.findFirst({ where: { slug: data.slug, NOT: { id } } });
    if (duplicate) return fail("这个别名已经存在。", "CONFLICT", 409);

    const project = await prisma.project.update({ where: { id }, data });
    return ok(normalizeProject(project));
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    await requireAdmin();
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
