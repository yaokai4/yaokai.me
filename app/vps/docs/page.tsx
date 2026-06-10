import { BookOpen, CheckCircle2, FileWarning, LifeBuoy, ListChecks, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { createMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";

const sections = [
  {
    title: "使用说明",
    icon: BookOpen,
    items: ["服务接入前先明确负责人、用途、生命周期和告警联系人。", "每个服务必须绑定健康状态、维护窗口和最小权限访问策略。", "生产服务变更需保留部署说明、回滚方案和审计记录。"]
  },
  {
    title: "权限申请流程",
    icon: ListChecks,
    items: ["提交服务目标、访问范围和预计到期时间。", "由负责人确认权限级别，默认只读，按需提升。", "到期策略默认关闭，续期需要重新确认。"]
  },
  {
    title: "服务状态说明",
    icon: CheckCircle2,
    items: ["正常表示健康检查通过。", "性能下降表示响应时间过高或依赖服务不稳定。", "严重异常表示连续失败达到告警阈值。", "维护中表示计划内操作，不代表故障。"]
  },
  {
    title: "故障处理流程",
    icon: LifeBuoy,
    items: ["确认告警来源和影响范围。", "记录处理动作和时间线。", "恢复后关闭告警并补充复盘。", "涉及数据恢复时必须二次确认并写入审计日志。"]
  },
  {
    title: "安全规范",
    icon: ShieldCheck,
    items: ["不在页面、日志或通知中展示 secret。", "不保存明文密码。", "不公开服务器内部路径、数据库地址、错误堆栈和敏感环境变量。", "所有后台写操作必须登录并进行服务端校验。"]
  },
  {
    title: "不允许用途",
    icon: FileWarning,
    items: ["不得用于违法违规的访问场景。", "不得用于匿名共享访问、批量账号分发或滥用转发。", "不得把内部服务凭据公开发布。"]
  }
];

const faq = [
  ["我能直接拿到服务器敏感信息吗？", "不能。后台也应只按角色展示必要信息，公开页面不会显示敏感地址、端口、密钥和环境变量。"],
  ["健康检查失败会自动恢复吗？", "系统会记录失败、更新状态并创建告警。真正的恢复动作需要负责人确认。"],
  ["备份恢复可以一键执行吗？", "不会直接提供危险恢复按钮。恢复必须二次确认，并完整记录审计日志。"]
];

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createMetadata({
    title: "VPS 运维文档 - 姚凯",
    description: "VPS 运维模块的使用说明、权限申请流程、服务状态说明、故障处理流程和安全规范。",
    path: "/vps/docs",
    locale
  });
}

export default function VpsDocsPage() {
  return (
    <>
      <PageHeader
        eyebrow="VPS 文档"
        title="把服务接入、权限申请、状态说明和故障处理流程写清楚。"
        description="文档用于团队内部服务管理和公开状态解释，所有流程围绕合法合规、安全接入和可审计运维设计。"
      />

      <section className="section-container grid gap-5 py-14 md:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <article key={section.title} className="premium-glass-card rounded-md p-5">
              <Icon className="h-5 w-5 text-indigo-700" />
              <h2 className="mt-4 text-xl font-black text-slate-950">{section.title}</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-600">
                {section.items.map((item) => (
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

      <section className="section-container grid gap-6 pb-20 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="gradient-border-card rounded-md p-6">
          <Badge>FAQ</Badge>
          <div className="mt-5 grid gap-4">
            {faq.map(([question, answer]) => (
              <article key={question}>
                <h2 className="font-black text-slate-950">{question}</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{answer}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="premium-glass-card rounded-md p-6">
          <h2 className="text-2xl font-black text-slate-950">需要接入服务？</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            先准备服务名称、负责人、用途、权限范围、预期生命周期、健康检查地址和告警联系人，再通过联系页提交。
          </p>
          <Link href="/contact" className="mt-5 inline-flex h-11 items-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white hover:bg-slate-800">
            提交接入需求
          </Link>
        </div>
      </section>
    </>
  );
}
