import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { normalizePlaybook } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/utils";
import { playbookSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

function playbookPayload(input: unknown) {
  const data = playbookSchema.parse(input);
  return {
    ...data,
    principles: stringifyArray(data.principles),
    steps: stringifyArray(data.steps),
    relatedLinks: stringifyArray(data.relatedLinks)
  };
}

export async function GET() {
  const playbooks = await prisma.playbook.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] });
  return ok(playbooks.map(normalizePlaybook));
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = playbookPayload(await request.json());
    const exists = await prisma.playbook.findUnique({ where: { slug: data.slug } });
    if (exists) return fail("这个别名已经存在。", "CONFLICT", 409);
    const playbook = await prisma.playbook.create({ data });
    return ok(normalizePlaybook(playbook), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
