import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getSessionUser } from "@/lib/auth";
import { createMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createMetadata({
    title: "Secure Access Login - 姚凯",
    description: "登录后进入私有安全接入配置中心。",
    path: "/vps/login",
    locale
  });
}

export default async function VpsLoginPage() {
  const user = await getSessionUser();
  if (user) redirect("/vps/access");

  return (
    <section className="section-container grid min-h-[72vh] place-items-center py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 rounded-md border border-indigo-100 bg-white/76 p-5 shadow-sm backdrop-blur">
          <LockKeyhole className="h-7 w-7 text-indigo-700" />
          <p className="mt-4 text-sm font-bold uppercase tracking-[0.18em] text-indigo-700">Secure Access</p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">登录私有访问配置中心</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">登录后进入 /vps/access，系统会检测当前服务器 Endpoint，并只在真实可用时允许生成、扫码、复制和下载配置。</p>
        </div>
        <LoginForm
          redirectTo="/vps/access"
          submitLabel="登录 Secure Access"
          footerText="此入口只用于私有安全接入配置，不提供匿名访问或公开分发。"
        />
      </div>
    </section>
  );
}
