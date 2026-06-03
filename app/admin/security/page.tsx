import { AdminLayout } from "@/components/admin/AdminLayout";
import { SecurityForm } from "@/components/admin/SecurityForm";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSecurityPage() {
  await requireAdmin();

  return (
    <AdminLayout title="账号安全" description="修改后台登录密码，保护内容管理入口。">
      <SecurityForm />
    </AdminLayout>
  );
}
