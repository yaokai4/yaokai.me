import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizeProject } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { stringifyArray } from "@/lib/utils";
import { projectSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function projectPayload(input: unknown) {
  const data = projectSchema.parse(input);
  return {
    ...data,
    tags: stringifyArray(data.tags),
    techStack: stringifyArray(data.techStack),
    gallery: stringifyArray(data.gallery),
    screenshots: stringifyArray(data.screenshots),
    responsibilities: stringifyArray(data.responsibilities),
    keyChallenges: stringifyArray(data.keyChallenges),
    solutions: stringifyArray(data.solutions),
    features: stringifyArray(data.features),
    technicalHighlights: stringifyArray(data.technicalHighlights),
    metrics: stringifyArray(data.metrics),
    measurableResults: stringifyArray(data.measurableResults),
    lessons: stringifyArray(data.lessons),
    nextSteps: stringifyArray(data.nextSteps),
    subtitle: data.subtitle || null,
    coverImage: data.coverImage || null,
    longDescription: data.longDescription || null,
    background: data.background || null,
    architecture: data.architecture || null,
    architectureNotes: data.architectureNotes || null,
    demoUrl: data.demoUrl || null,
    githubUrl: data.githubUrl || null,
    startDate: data.startDate || null,
    endDate: data.endDate || null,
    publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    seoTitle: data.seoTitle || null,
    seoDescription: data.seoDescription || null,
    ogImage: data.ogImage || null
  };
}

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: [{ featured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }]
  });
  return ok(projects.map(normalizeProject));
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const data = projectPayload(await request.json());
    const exists = await prisma.project.findUnique({ where: { slug: data.slug } });
    if (exists) return fail("这个别名已经存在。", "CONFLICT", 409);

    const project = await prisma.project.create({ data });
    return ok(normalizeProject(project), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
