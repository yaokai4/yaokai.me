import { AdminLayout } from "@/components/admin/AdminLayout";
import { SiteCopyEditor } from "@/components/admin/SiteCopyEditor";
import { requireAdmin } from "@/lib/auth";
import { getCopyOverrides } from "@/lib/copy-overrides.server";
import { getSiteCopyDefaultValues } from "@/lib/site-copy-defaults";

export const dynamic = "force-dynamic";

export default async function AdminCopyPage() {
  await requireAdmin();
  const overrides = await getCopyOverrides();
  const defaults = getSiteCopyDefaultValues();

  return (
    <AdminLayout title="全站文案" description="编辑头部、底部、首页、作品、文章、技术栈等静态文案；文章和项目正文仍在各自内容模块管理。">
      <SiteCopyEditor defaults={defaults} overrides={overrides} />
    </AdminLayout>
  );
}
