import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api-response";
import { runVpsHealthChecks } from "@/lib/vps-health";
import { vpsErrorMessage } from "@/lib/vps-data";

export const dynamic = "force-dynamic";

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get("authorization") || "";
  const token = request.nextUrl.searchParams.get("secret");
  return auth === `Bearer ${secret}` || token === secret;
}

export async function GET(request: NextRequest) {
  try {
    if (!authorized(request)) return fail("未授权。", "UNAUTHORIZED", 401);
    return ok(await runVpsHealthChecks({ id: "cron", email: "cron@system", role: "SYSTEM" }, request));
  } catch (error) {
    return fail(vpsErrorMessage(error), "BAD_REQUEST", 400);
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
