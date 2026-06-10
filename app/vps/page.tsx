import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { createMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";
import { isVpsPrivateMode } from "@/lib/vps-private-mode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createMetadata({
    title: "Secure Access - 姚凯",
    description: "私有安全接入配置中心，用于生成、扫码、复制、下载、重新生成和吊销我的 Access Profile。",
    path: "/vps",
    locale
  });
}

export default async function VpsPage() {
  const user = await getSessionUser();
  redirect(user ? "/vps/access" : isVpsPrivateMode() ? "/yaokai" : "/vps/login");
}
