import { AdminLayout } from "@/components/admin/AdminLayout";
import { ManifestoManager } from "@/components/admin/ResourceScreens";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminManifestoPage() {
  await requireAdmin();
  const items = await prisma.manifestoItem.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] });

  return (
    <AdminLayout title="宣言管理" description="管理个人原则、创造理念和公开可见状态。">
      <ManifestoManager items={JSON.parse(JSON.stringify(items))} />
    </AdminLayout>
  );
}
