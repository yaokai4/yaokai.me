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
    title: "Secure Access - 姚凯",
    description: "个人安全接入配置入口，用于生成 WireGuard 配置、Shadowrocket 私有导入链接并管理设备访问。",
    path: "/vps/access",
    locale
  });
}

export default async function VpsAccessPage() {
  const user = await getSessionUser();
  if (!user) redirect(isVpsPrivateMode() ? "/yaokai" : "/vps/login");
  return (
    <SecureAccessDashboard
      title="我的 Secure Access 设备配置"
      description="这里是个人使用入口：使用 WireGuard 二维码 / .conf，或生成 Shadowrocket 私有导入链接，并验证真实握手与出口 IP。"
    />
  );
}
