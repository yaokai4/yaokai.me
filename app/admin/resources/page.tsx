import { AdminLayout } from "@/components/admin/AdminLayout";
import { ResourcesManager } from "@/components/admin/ResourceScreens";
import { requireAdmin } from "@/lib/auth";
import { normalizeResource } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  await requireAdmin();
  const resources = (await prisma.resource.findMany({ orderBy: [{ featured: "desc" }, { category: "asc" }, { updatedAt: "desc" }] })).map(normalizeResource);

  return (
    <AdminLayout title="资源库管理" description="管理开发、设计、AI 与 Machi 技术相关资源。">
      <ResourcesManager items={JSON.parse(JSON.stringify(resources))} />
    </AdminLayout>
  );
}
