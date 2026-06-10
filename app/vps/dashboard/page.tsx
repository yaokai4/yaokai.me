import { redirect } from "next/navigation";
import { SecureAccessDashboard } from "@/app/vps/SecureAccessEntry";
import { getSessionUser } from "@/lib/auth";
import { createMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";
import { isVpsPrivateMode } from "@/lib/vps-private-mode";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createMetadata({
    title: "Secure Access Dashboard - 姚凯",
    description: "我的私有安全接入配置控制台，用于检查 Endpoint 可用性并管理 Access Profile。",
    path: "/vps/dashboard",
    locale
  });
}

export default async function VpsDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect(isVpsPrivateMode() ? "/yaokai" : "/vps/login");
  return <SecureAccessDashboard />;
}
