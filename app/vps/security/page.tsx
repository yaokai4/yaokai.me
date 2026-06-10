import { BellRing, DatabaseBackup, EyeOff, FileClock, KeyRound, LockKeyhole, RotateCcw, ShieldCheck, UserCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { createMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

const controls: Array<[string, string, LucideIcon]> = [
  ["登录保护", "后台登录使用 httpOnly Cookie、SameSite、生产环境 secure，并记录登录失败。", LockKeyhole],
  ["多因素认证预留", "用户和成员模型保留 MFA 字段，后续可接入一次性验证码或硬件密钥。", UserCheck],
  ["最小权限原则", "默认无权限，按服务授权，权限可设置开始时间、到期时间和启用状态。", ShieldCheck],
  ["审计日志", "登录、节点、服务、策略、告警、备份和设置变更会保留动作记录。", FileClock],
  ["敏感信息保护", "公开页面不展示真实 IP、端口、密钥、内部路径、数据库地址和错误堆栈。", EyeOff],
  ["密钥轮换", "环境变量只保留配置入口，轮换由部署平台或服务器安全流程执行。", RotateCcw],
  ["备份恢复", "备份记录包含加密、保留周期和恢复测试时间，危险恢复不直接一键执行。", DatabaseBackup],
  ["安全告警", "证书到期、备份失败、登录失败过多和异常权限变更可进入告警中心。", BellRing],
  ["数据保留策略", "审计日志默认保留，公开状态页只展示必要摘要。", KeyRound]
];

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createMetadata({
    title: "VPS 安全 - 姚凯",
    description: "VPS 运维模块的登录保护、最小权限、审计日志、敏感信息保护、密钥轮换、备份恢复和数据保留策略。",
    path: "/vps/security",
    locale
  });
}

export default function VpsSecurityPage() {
  return (
    <>
      <PageHeader
        eyebrow="VPS 安全"
        title="把访问、审计、告警和数据保留都设计成默认谨慎。"
        description="安全页面说明模块的保护措施和边界：不公开敏感连接信息，不保存明文凭据，后台写操作需要鉴权和审计。"
      />

      <section className="section-container grid gap-5 py-14 md:grid-cols-2 xl:grid-cols-3">
        {controls.map(([title, body, Icon]) => (
          <article key={String(title)} className="premium-glass-card rounded-md p-5">
            <Icon className="h-5 w-5 text-indigo-700" />
            <h2 className="mt-4 text-xl font-black text-slate-950">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
          </article>
        ))}
      </section>

      <section className="section-container pb-20">
        <div className="gradient-border-card rounded-md p-6">
          <Badge>团队成员上限</Badge>
          <h2 className="mt-4 text-2xl font-black text-slate-950">内部服务成员建议控制在 20 人以内。</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            后台成员管理可以记录角色、状态、MFA、最近登录和访问策略。人数限制用于降低权限扩散风险，不用于生成或分发任何客户端连接配置。
          </p>
        </div>
      </section>
    </>
  );
}
