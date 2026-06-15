import { AdminLayout } from "@/components/admin/AdminLayout";
import { PlaybooksManager } from "@/components/admin/ResourceScreens";
import { requireAdmin } from "@/lib/auth";
import { normalizePlaybook } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPlaybooksPage() {
  await requireAdmin();
  const playbooks = (await prisma.playbook.findMany({ orderBy: [{ featured: "desc" }, { updatedAt: "desc" }] })).map(normalizePlaybook);

  return (
    <AdminLayout title="方法论管理" description="管理产品判断、开发流程、AI 协作、双端同步和离线优先等 Playbook。">
      <PlaybooksManager items={JSON.parse(JSON.stringify(playbooks))} />
    </AdminLayout>
  );
}
