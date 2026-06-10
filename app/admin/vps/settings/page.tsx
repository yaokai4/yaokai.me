import Link from "next/link";
import { notFound } from "next/navigation";
import { canManageAccessProfiles } from "@/lib/access-profiles";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EndpointSettingsForm } from "@/components/vps/EndpointSettingsForm";
import { requireVpsUser } from "@/lib/auth";
import { ensureCurrentEndpoint, getCurrentEndpoint, sanitizeEndpoint, secureAccessInitializationPlan } from "@/lib/vps-endpoint";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function toClient<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export default async function AdminVpsSettingsPage() {
  const user = await requireVpsUser();
  if (!canManageAccessProfiles(user)) notFound();
  const endpoint = await getCurrentEndpoint() || await ensureCurrentEndpoint({ actor: user, initializeKeys: true });

  return (
    <AdminLayout title="Secure Access 设置" description="配置当前 Endpoint 的公网入口、设备配置参数和安全初始化说明。">
      <div className="mb-5 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
        <Link href="/admin/vps" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          返回控制台
        </Link>
        <Link href="/admin/vps/endpoints" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Endpoint 列表
        </Link>
      </div>
      <EndpointSettingsForm endpoint={toClient(sanitizeEndpoint(endpoint))} initializationPlan={secureAccessInitializationPlan(endpoint)} />
    </AdminLayout>
  );
}
