import { Activity, Clock, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { prisma } from "@/lib/prisma";
import { createMetadata } from "@/lib/seo";
import { getRequestLocale } from "@/lib/server-locale";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

function tone(status: string): "default" | "success" | "warning" | "danger" {
  if (status === "operational" || status === "active" || status === "resolved") return "success";
  if (status === "major_outage" || status === "offline" || status === "critical" || status === "emergency") return "danger";
  if (status === "degraded" || status === "partial_outage" || status === "warning" || status === "maintenance") return "warning";
  return "default";
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    operational: "正常",
    degraded: "性能下降",
    partial_outage: "部分异常",
    major_outage: "严重异常",
    maintenance: "维护中",
    active: "在线",
    warning: "需关注",
    offline: "离线"
  };
  return labels[status] || status;
}

export async function generateMetadata() {
  const locale = await getRequestLocale();
  return createMetadata({
    title: "VPS 状态 - 姚凯",
    description: "VPS 运维模块的公开服务状态、维护公告和历史故障摘要，不暴露服务器敏感信息。",
    path: "/vps/status",
    locale
  });
}

export default async function VpsStatusPage() {
  const [services, nodes, alerts] = await Promise.all([
    prisma.vpsService.findMany({
      where: { publicStatus: { not: "disabled" }, disabledAt: null },
      select: { id: true, name: true, type: true, publicStatus: true, responseTimeMs: true, lastCheckedAt: true },
      orderBy: [{ publicStatus: "asc" }, { name: "asc" }]
    }),
    prisma.vpsNode.findMany({
      where: { archivedAt: null, status: { not: "retired" } },
      select: { id: true, name: true, provider: true, region: true, status: true, lastCheckedAt: true },
      orderBy: [{ status: "asc" }, { name: "asc" }],
      take: 50
    }),
    prisma.vpsAlert.findMany({
      where: { status: { in: ["open", "acknowledged", "resolved"] } },
      select: { id: true, title: true, level: true, status: true, triggeredAt: true, resolvedAt: true },
      orderBy: { triggeredAt: "desc" },
      take: 12
    })
  ]);

  const overall = services.some((service) => service.publicStatus === "major_outage")
    ? "major_outage"
    : services.some((service) => service.publicStatus === "degraded" || service.publicStatus === "partial_outage")
      ? "degraded"
      : "operational";

  const windows = [
    ["最近 24 小时", services.filter((service) => service.publicStatus === "operational").length, services.length],
    ["最近 7 天", Math.max(0, services.length - alerts.filter((alert) => alert.status !== "resolved").length), services.length],
    ["最近 30 天", Math.max(0, services.length - alerts.length), services.length]
  ];

  return (
    <>
      <PageHeader
        eyebrow="服务状态"
        title="公开状态页只展示健康信息，不暴露服务器敏感细节。"
        description="这里用于查看团队内部服务的整体状态、维护公告、最近健康检查和历史故障摘要。"
      />

      <section className="section-container grid gap-6 py-14 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="grid content-start gap-4">
          <div className="gradient-border-card rounded-md p-6">
            <Activity className="h-6 w-6 text-indigo-700" />
            <h2 className="mt-5 text-2xl font-black text-slate-950">系统整体状态</h2>
            <div className="mt-4">
              <StatusBadge label={statusLabel(overall)} tone={tone(overall)} />
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              当前状态由公开服务健康结果聚合计算。未配置健康检查时，服务会显示为最近一次后台记录的状态。
            </p>
            <Link href="/vps/status.json" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-indigo-700 hover:text-slate-950">
              安全状态 JSON
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>

          <div className="premium-glass-card rounded-md p-6">
            <h2 className="text-lg font-black text-slate-950">维护公告</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              当前没有公开维护公告。计划维护会提前记录在后台告警或更新记录中。
            </p>
          </div>
        </aside>

        <div className="grid gap-5">
          <div className="grid gap-4 md:grid-cols-3">
            {windows.map(([label, healthy, total]) => (
              <article key={String(label)} className="premium-glass-card rounded-md p-5">
                <Clock className="h-5 w-5 text-indigo-700" />
                <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-black text-slate-950">{total ? `${healthy}/${total}` : "0/0"}</p>
                <p className="mt-2 text-xs text-slate-500">公开服务健康摘要</p>
              </article>
            ))}
          </div>

          <section className="premium-glass-card rounded-md p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Badge>服务列表</Badge>
                <h2 className="mt-3 text-xl font-black text-slate-950">服务健康概览</h2>
              </div>
              <ShieldCheck className="h-5 w-5 text-indigo-700" />
            </div>
            <div className="mt-5 grid gap-3">
              {services.length ? services.map((service) => (
                <article key={service.id} className="grid gap-3 rounded-md border border-white/70 bg-white/66 p-4 shadow-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <h3 className="font-black text-slate-950">{service.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{service.type}</p>
                  </div>
                  <StatusBadge label={statusLabel(service.publicStatus)} tone={tone(service.publicStatus)} />
                  <p className="text-sm text-slate-500">{service.lastCheckedAt ? formatDate(service.lastCheckedAt) : "尚未检查"}</p>
                </article>
              )) : (
                <p className="rounded-md border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-500">暂无公开服务状态。</p>
              )}
            </div>
          </section>

          <section className="premium-glass-card rounded-md p-5">
            <Badge>节点状态</Badge>
            <div className="mt-5 grid gap-3">
              {nodes.length ? nodes.map((node) => (
                <article key={node.id} className="grid gap-3 rounded-md border border-white/70 bg-white/66 p-4 shadow-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <h3 className="font-black text-slate-950">{node.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{node.provider} / {node.region}</p>
                  </div>
                  <StatusBadge label={statusLabel(node.status)} tone={tone(node.status)} />
                  <p className="text-sm text-slate-500">{node.lastCheckedAt ? formatDate(node.lastCheckedAt) : "尚未检查"}</p>
                </article>
              )) : (
                <p className="rounded-md border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-500">暂无节点状态。</p>
              )}
            </div>
          </section>

          <section className="premium-glass-card rounded-md p-5">
            <Badge>历史故障记录</Badge>
            <div className="mt-5 grid gap-3">
              {alerts.length ? alerts.map((alert) => (
                <article key={alert.id} className="grid gap-3 rounded-md border border-white/70 bg-white/66 p-4 shadow-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <h3 className="font-black text-slate-950">{alert.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">触发：{formatDate(alert.triggeredAt)}</p>
                  </div>
                  <StatusBadge label={alert.level} tone={tone(alert.level)} />
                  <StatusBadge label={alert.status === "resolved" ? "已解决" : alert.status === "acknowledged" ? "已确认" : "处理中"} tone={tone(alert.status)} />
                </article>
              )) : (
                <p className="rounded-md border border-dashed border-slate-300 bg-white/60 p-5 text-sm text-slate-500">暂无公开故障记录。</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
