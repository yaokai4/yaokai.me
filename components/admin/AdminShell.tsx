import { AdminLayout } from "@/components/admin/AdminLayout";

export function AdminShell({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <AdminLayout title={title} description={description}>
      {children}
    </AdminLayout>
  );
}
