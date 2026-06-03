import bcrypt from "bcryptjs";
import { fail, normalizeError, ok } from "@/lib/api-response";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return fail("尚未登录。", "UNAUTHORIZED", 401);

    const payload = changePasswordSchema.parse(await request.json());
    const account = await prisma.user.findUnique({ where: { id: user.id } });
    if (!account) return fail("账号不存在。", "NOT_FOUND", 404);

    const valid = await bcrypt.compare(payload.currentPassword, account.passwordHash);
    if (!valid) return fail("当前密码不正确。", "BAD_REQUEST", 400);

    const passwordHash = await bcrypt.hash(payload.newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return ok({ updated: true });
  } catch (error) {
    return fail(normalizeError(error), "BAD_REQUEST", 400);
  }
}
