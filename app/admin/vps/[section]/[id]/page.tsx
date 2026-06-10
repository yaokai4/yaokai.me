import Link from "next/link";
import { notFound } from "next/navigation";
import { AccessProfileActions } from "@/components/admin/AccessProfileActions";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { VpsRecordEditor, VpsRecordSummary } from "@/components/admin/VpsResourceScreens";
import { actorCanViewProfile, canManageAccessProfiles } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getVpsResourceConfig } from "@/lib/vps-config";
import { canReadVpsResource, getVpsRecord, writeVpsAuditLog } from "@/lib/vps-data";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ section: string; id: string }> };

export default async function AdminVpsDetailPage({ params }: PageProps) {
  const actor = await requireVpsUser();
  const { section, id } = await params;
  const config = getVpsResourceConfig(section);
  if (!config) notFound();
  if (section === "access-profiles" && !(await actorCanViewProfile(actor, id))) notFound();
  if (section !== "access-profiles" && !canReadVpsResource(actor, section)) notFound();
  const item = await getVpsRecord(section, id) as Record<string, unknown> & { id: string } | null;
  if (!item) notFound();
  if (section === "access-profiles") {
    delete item.encryptedConfig;
    delete item.encryptedPrivateKey;
    await writeVpsAuditLog({ actor, action: "access_profile_viewed", targetType: "access_profile", targetId: id });
    await prisma.vpsAccessProfile.update({ where: { id }, data: { lastViewedAt: new Date() } });
  }

  const related = await getRelated(section, id);

  return (
    <AdminLayout title={`${config.singular}详情`} description={config.description}>
      <div className="mb-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
        <Link href={`/admin/vps/${section}`} className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          返回列表
        </Link>
        <Link href="/admin/vps" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          返回总览
        </Link>
      </div>
      <div className="grid gap-6">
        <VpsRecordSummary config={config} item={item} />
        {section === "access-profiles" && canManageAccessProfiles(actor) ? <AccessProfileActions profileId={id} status={String(item.status || "")} /> : null}
        {related}
        {!config.readOnly && (section !== "access-profiles" || canManageAccessProfiles(actor)) ? <VpsRecordEditor config={config} initialItem={item} /> : null}
      </div>
    </AdminLayout>
  );
}

async function getRelated(section: string, id: string) {
  if (section === "nodes") {
    const [services, alerts, backups, logs] = await Promise.all([
      prisma.vpsService.findMany({ where: { nodeId: id }, orderBy: { updatedAt: "desc" }, take: 8 }),
      prisma.vpsAlert.findMany({ where: { nodeId: id }, orderBy: { triggeredAt: "desc" }, take: 8 }),
      prisma.vpsBackup.findMany({ where: { nodeId: id }, orderBy: { updatedAt: "desc" }, take: 8 }),
      prisma.vpsAuditLog.findMany({ where: { targetId: id }, orderBy: { createdAt: "desc" }, take: 8 })
    ]);

    return (
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">节点详情 Tab</h2>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <RelatedPanel title="关联服务">
            {services.map((service) => <RelatedRow key={service.id} title={service.name} meta={service.type} badge={service.publicStatus} />)}
          </RelatedPanel>
          <RelatedPanel title="告警记录">
            {alerts.map((alert) => <RelatedRow key={alert.id} title={alert.title} meta={formatDate(alert.triggeredAt)} badge={alert.level} />)}
          </RelatedPanel>
          <RelatedPanel title="备份状态">
            {backups.map((backup) => <RelatedRow key={backup.id} title={backup.name} meta={backup.lastBackupAt ? formatDate(backup.lastBackupAt) : "尚未备份"} badge={backup.lastStatus} />)}
          </RelatedPanel>
          <RelatedPanel title="审计日志">
            {logs.map((log) => <RelatedRow key={log.id} title={log.action} meta={formatDate(log.createdAt)} badge={log.result} />)}
          </RelatedPanel>
          <RelatedPanel title="资源监控">
            <p className="text-sm leading-7 text-slate-500">CPU、内存、磁盘和带宽使用率保存在节点概览字段中，后续可接入时序监控。</p>
          </RelatedPanel>
          <RelatedPanel title="访问策略">
            <p className="text-sm leading-7 text-slate-500">访问策略按服务关联。请进入关联服务详情查看策略范围和到期时间。</p>
          </RelatedPanel>
        </div>
      </section>
    );
  }

  if (section === "services") {
    const [policies, alerts, backups, checks] = await Promise.all([
      prisma.vpsAccessPolicy.findMany({ where: { serviceId: id }, orderBy: { updatedAt: "desc" }, take: 8 }),
      prisma.vpsAlert.findMany({ where: { serviceId: id }, orderBy: { triggeredAt: "desc" }, take: 8 }),
      prisma.vpsBackup.findMany({ where: { serviceId: id }, orderBy: { updatedAt: "desc" }, take: 8 }),
      prisma.vpsHealthCheck.findMany({ where: { serviceId: id }, orderBy: { checkedAt: "desc" }, take: 8 })
    ]);

    return (
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">服务关联信息</h2>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <RelatedPanel title="访问策略">
            {policies.map((policy) => <RelatedRow key={policy.id} title={policy.name} meta={policy.expiresAt ? formatDate(policy.expiresAt) : "未设置到期"} badge={policy.permission} />)}
          </RelatedPanel>
          <RelatedPanel title="告警记录">
            {alerts.map((alert) => <RelatedRow key={alert.id} title={alert.title} meta={formatDate(alert.triggeredAt)} badge={alert.level} />)}
          </RelatedPanel>
          <RelatedPanel title="备份状态">
            {backups.map((backup) => <RelatedRow key={backup.id} title={backup.name} meta={backup.lastBackupAt ? formatDate(backup.lastBackupAt) : "尚未备份"} badge={backup.lastStatus} />)}
          </RelatedPanel>
          <RelatedPanel title="健康检查">
            {checks.map((check) => <RelatedRow key={check.id} title={check.url} meta={formatDate(check.checkedAt)} badge={check.result} />)}
          </RelatedPanel>
        </div>
      </section>
    );
  }

  if (section === "access-profiles") {
    const [downloads, logs, alerts] = await Promise.all([
      prisma.vpsAccessProfileDownload.findMany({
        where: { profileId: id },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.vpsAuditLog.findMany({
        where: { targetType: "access_profile", targetId: id },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      prisma.vpsAlert.findMany({
        where: { accessProfileId: id },
        orderBy: { triggeredAt: "desc" },
        take: 10
      })
    ]);

    return (
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-950">访问配置活动</h2>
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <RelatedPanel title="下载记录">
            {downloads.map((download) => (
              <RelatedRow
                key={download.id}
                title={download.usedAt ? "已使用下载链接" : "未使用下载链接"}
                meta={`创建 ${formatDate(download.createdAt)} / 过期 ${formatDate(download.expiresAt)}`}
                badge={download.usedAt ? "used" : "pending"}
              />
            ))}
          </RelatedPanel>
          <RelatedPanel title="审计日志">
            {logs.map((log) => <RelatedRow key={log.id} title={log.action} meta={formatDate(log.createdAt)} badge={log.result} />)}
          </RelatedPanel>
          <RelatedPanel title="关联告警">
            {alerts.map((alert) => <RelatedRow key={alert.id} title={alert.title} meta={formatDate(alert.triggeredAt)} badge={alert.level} />)}
          </RelatedPanel>
        </div>
      </section>
    );
  }

  return null;
}

function RelatedPanel({ title, children }: { title: string; children: React.ReactNode }) {
  const empty = Array.isArray(children) && children.length === 0;
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3 grid gap-2">
        {empty ? <p className="text-sm text-slate-500">暂无记录</p> : children}
      </div>
    </div>
  );
}

function RelatedRow({ title, meta, badge }: { title: string; meta: string; badge: string }) {
  const danger = ["critical", "emergency", "failed", "major_outage", "offline"].includes(badge);
  const success = ["success", "operational", "active", "resolved"].includes(badge);
  return (
    <div className="flex items-start justify-between gap-3 rounded-md bg-white p-3">
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-medium text-slate-950">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{meta}</p>
      </div>
      <StatusBadge label={badge} tone={danger ? "danger" : success ? "success" : "warning"} />
    </div>
  );
}
