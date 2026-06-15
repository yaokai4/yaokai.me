import { AdminLayout } from "@/components/admin/AdminLayout";
import { NowManager } from "@/components/admin/ResourceScreens";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminNowPage() {
  await requireAdmin();
  const items = await prisma.nowItem.findMany({ orderBy: [{ type: "asc" }, { sortOrder: "asc" }, { updatedAt: "desc" }] });

  return (
    <AdminLayout title="Now 管理" description="管理当前项目、研究方向、学习内容和下一步计划。">
      <NowManager items={JSON.parse(JSON.stringify(items))} />
    </AdminLayout>
  );
}
