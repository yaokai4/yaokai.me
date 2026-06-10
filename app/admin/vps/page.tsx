import Link from "next/link";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { SecureAccessConsole } from "@/components/vps/SecureAccessConsole";
import { getMyAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vpsAdminSections } from "@/lib/vps-config";
import { ensureCurrentEndpoint, getCurrentEndpoint, sanitizeEndpoint } from "@/lib/vps-endpoint";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toClient<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default async function AdminVpsDashboardPage() {
  const user = await requireVpsUser();
  const endpoint = await getCurrentEndpoint() || await ensureCurrentEndpoint({ actor: user, initializeKeys: true });
  const [profile, recentAuditLogs] = await Promise.all([
    getMyAccessProfile(user, true),
    prisma.vpsAuditLog.findMany({
      where: { targetType: { in: ["endpoint", "access_profile"] } },
      orderBy: { createdAt: "desc" },
      take: 10
    })
  ]);

  return (
    <AdminLayout title="Secure Access 控制台" description="私有安全接入配置中心：Endpoint、Access Profile、下载和审计集中管理。">
      <div className="mb-6 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">当前登录用户</p>
            <p className="mt-1 text-base font-semibold text-slate-950">{user.name} / {user.email}</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-4">
            <Link href="/admin/vps/endpoints" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Endpoint
            </Link>
            <Link href="/admin/vps/access-profiles" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Access Profiles
            </Link>
            <Link href="/admin/vps/audit-logs" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              审计日志
            </Link>
            <Link href="/admin/vps/settings" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              设置
            </Link>
          </div>
        </div>
      </div>

      <SecureAccessConsole
        initialEndpoint={toClient(sanitizeEndpoint(endpoint))}
        initialProfile={toClient(profile)}
        recentAuditLogs={toClient(recentAuditLogs)}
        showEndpointActions
      />

      <div className="mt-6 grid gap-3 rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-6">
        {vpsAdminSections.map(([section, label]) => (
          <Link key={section} href={`/admin/vps/${section}`} className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
            {label}
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}
