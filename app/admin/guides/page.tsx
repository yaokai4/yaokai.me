import { AdminLayout } from "@/components/admin/AdminLayout";
import { GuidesManager } from "@/components/admin/ResourceScreens";
import { requireAdmin } from "@/lib/auth";
import { normalizeGuide } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminGuidesPage() {
  await requireAdmin();
  const guides = (await prisma.guide.findMany({ orderBy: [{ updatedAt: "desc" }] })).map(normalizeGuide);

  return (
    <AdminLayout title="指南管理" description="管理技术指南、方法指南、适合人群、难度和发布状态。">
      <GuidesManager items={JSON.parse(JSON.stringify(guides))} />
    </AdminLayout>
  );
}
