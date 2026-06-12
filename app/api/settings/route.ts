import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { settingsSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  return ok(await getSettings());
}

export async function PUT(request: Request) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const data = settingsSchema.parse(await request.json());
    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      await prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value }
      });
    }

    return ok(await getSettings());
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
