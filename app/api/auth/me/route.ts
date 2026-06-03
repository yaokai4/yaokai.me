import { fail, ok } from "@/lib/api-response";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return fail("尚未登录。", "UNAUTHORIZED", 401);
  return ok({ user });
}
