import { CalendarClock, CheckCircle2, ShieldAlert, Wrench } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { createMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

const updates = [
  {
    date: "2026-06-05",
    title: "VPS 运维模块第一版",
    type: "系统更新",
    icon: Wrench,
    items: ["新增公开介绍、状态、文档、安全和更新记录页面。", "新增后台节点、服务、成员、策略、审计、告警、备份、成本和设置模块。", "新增受保护的健康检查 API 和公开安全状态 JSON。"]
  },
  {
    date: "2026-06-05",
    title: "安全边界与合规文案",
    type: "安全更新",
    icon: ShieldAlert,
    items: ["公开页面不展示真实 IP、端口、密钥、内部路径或环境变量。", "后台写操作需要登录，并写入审计日志。", "成员访问策略默认按最小权限设计。"]
  },
  {
    date: "2026-06-05",
    title: "健康检查与告警规则",
    type: "维护记录",
    icon: CalendarClock,
    items: ["HTTP 连续失败会进入异常状态。", "连续恢复成功会关闭健康检查告警。", "证书到期字段支持 14 天和 7 天提醒。"]
  }
];

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createMetadata({
    title: "VPS 更新记录 - 姚凯",
    description: "VPS 运维系统更新记录、服务维护记录、重要安全更新和已知问题修复。",
    path: "/vps/changelog",
    locale
  });
}

export default function VpsChangelogPage() {
  return (
    <>
      <PageHeader
        eyebrow="VPS 更新记录"
        title="运维系统的更新、维护、安全改动和修复都应该可追踪。"
        description="这里记录 VPS 运维模块的功能变更、服务维护、重要安全更新和已知问题修复。"
      />

      <section className="section-container grid gap-5 py-14">
        {updates.map((update) => {
          const Icon = update.icon;
          return (
            <article key={`${update.date}-${update.title}`} className="premium-glass-card rounded-md p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge>{update.type}</Badge>
                  <h2 className="mt-4 text-2xl font-black text-slate-950">{update.title}</h2>
                  <p className="mt-2 text-sm font-bold text-slate-500">{update.date}</p>
                </div>
                <Icon className="h-6 w-6 text-indigo-700" />
              </div>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-slate-600">
                {update.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>
    </>
  );
}
