import { authenticate, createSession } from "@/lib/auth";
import { fail, ok } from "@/lib/api-response";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const payload = loginSchema.parse(await request.json());
    const user = await authenticate(payload.account, payload.password);

    if (!user) {
      return fail("账号或密码不正确。", "UNAUTHORIZED", 401);
    }

    await createSession(user);
    return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch {
    return fail("登录参数无效。", "BAD_REQUEST", 400);
  }
}
