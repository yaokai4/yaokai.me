import { fail, normalizeError, ok } from "@/lib/api-response";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertSameOrigin } from "@/lib/security";
import { messageUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Context) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    const data = messageUpdateSchema.parse(await request.json());
    const status = data.status || (typeof data.read === "boolean" ? (data.read ? "READ" : "UNREAD") : undefined);
    const message = await prisma.message.update({
      where: { id },
      data: {
        ...data,
        status,
        read: typeof data.read === "boolean" ? data.read : status ? status !== "UNREAD" : undefined
      }
    });
    return ok(message);
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    assertSameOrigin(request);
    await requireAdmin();
    const { id } = await params;
    await prisma.message.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return fail("未授权。", "UNAUTHORIZED", 401);
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
