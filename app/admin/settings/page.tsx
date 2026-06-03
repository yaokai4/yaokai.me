import { AdminLayout } from "@/components/admin/AdminLayout";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();

  return (
    <AdminLayout title="站点设置" description="更新品牌文案、SEO 默认配置、联系方式和当前关注内容。">
      <SettingsForm settings={settings} />
    </AdminLayout>
  );
}
