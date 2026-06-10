import { AlertTriangle, CheckCircle2, Clock, Download, FileClock, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { createMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

const steps = [
  ["提交申请", "说明成员、设备、允许访问的内部服务和有效期。"],
  ["确认范围", "owner/admin 按最小权限原则确认服务、节点和网段范围。"],
  ["生成配置", "后台生成加密保存的 Secure Access Config，并创建一次性下载链接。"],
  ["本人设备导入", "配置文件只允许在绑定设备上使用，不要转发、截图或公开分享。"],
  ["定期复核", "配置到期、设备丢失或权限变化时立即暂停或吊销。"]
];

const safety: Array<[string, string, LucideIcon]> = [
  ["一次性下载", "下载链接默认 10 分钟有效，使用后立即失效。", Download],
  ["过期控制", "访问配置默认不超过 180 天，到期后自动标记过期。", Clock],
  ["审计记录", "查看、下载、复制、重新生成、暂停、启用和吊销都会写入审计日志。", FileClock],
  ["敏感保护", "配置内容不会在公开页面展示，也不会写入日志。", ShieldCheck]
];

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createMetadata({
    title: "Secure Access 文档 - 姚凯",
    description: "Access Profile 的申请流程、下载安全、设备丢失处理、吊销和审计说明。",
    path: "/vps/access/docs",
    locale
  });
}

export default function VpsAccessDocsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Access Profile Docs"
        title="访问配置必须有边界、期限、设备和审计。"
        description="这份文档说明 Access Profile 的申请、生成、下载、导入、复核、暂停和吊销流程。"
      />

      <section className="section-container grid gap-6 py-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="premium-glass-card rounded-md p-6">
          <Badge>申请流程</Badge>
          <div className="mt-5 grid gap-4">
            {steps.map(([title, body], index) => (
              <article key={title} className="rounded-md border border-white/70 bg-white/64 p-4">
                <p className="text-xs font-black text-indigo-700">{String(index + 1).padStart(2, "0")}</p>
                <h2 className="mt-2 font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {safety.map(([title, body, Icon]) => (
            <article key={String(title)} className="premium-glass-card rounded-md p-5">
              <Icon className="h-5 w-5 text-indigo-700" />
              <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-container pb-20">
        <div className="rounded-md border border-slate-200/80 bg-white/76 p-5 text-sm leading-7 text-slate-700 shadow-sm backdrop-blur">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" />
            <div>
              <p className="font-bold">设备丢失或权限变更时</p>
              <p className="mt-1">
                请立即在后台暂停或吊销对应 Access Profile，并检查最近下载记录和审计日志。吊销后，该设备不能继续使用这份访问配置。
              </p>
              <ul className="mt-3 grid gap-2">
                {["不要把配置文件发送给他人。", "不要在截图、日志、公开页面或聊天记录里展示配置内容。", "不要把一次性下载链接贴到公开页面。"].map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
