import { SecureAccessConsole } from "@/components/vps/SecureAccessConsole";
import { getMyAccessProfile } from "@/lib/access-profiles";
import { requireVpsUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureCurrentEndpoint, getCurrentEndpoint, sanitizeEndpoint } from "@/lib/vps-endpoint";

function toClient<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function SecureAccessDashboard({
  title = "我的私有访问配置",
  description
}: {
  title?: string;
  description?: string;
} = {}) {
  const user = await requireVpsUser();
  const endpoint = await getCurrentEndpoint() || await ensureCurrentEndpoint({ actor: user, initializeKeys: true });
  const profile = await getMyAccessProfile(user, true);
  const recentAuditLogs = profile
    ? await prisma.vpsAuditLog.findMany({
      where: { targetType: "access_profile", targetId: String(profile.id) },
      orderBy: { createdAt: "desc" },
      take: 10
    })
    : [];

  return (
    <section className="section-container py-10">
      <div className="mb-6 flex flex-col gap-2">
        <p className="text-sm font-bold text-indigo-700">Secure Access</p>
        <h1 className="text-3xl font-black text-slate-950">{title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">{description || `当前账号：${user.email}`}</p>
        {description ? <p className="max-w-2xl text-sm leading-7 text-slate-600">当前账号：{user.email}</p> : null}
      </div>
      <SecureAccessConsole
        initialEndpoint={toClient(sanitizeEndpoint(endpoint))}
        initialProfile={toClient(profile)}
        recentAuditLogs={toClient(recentAuditLogs)}
        showEndpointActions
        showQrInitially
      />
    </section>
  );
}
