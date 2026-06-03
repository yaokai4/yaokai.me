import { AdminLayout } from "@/components/admin/AdminLayout";
import { ProjectsManager } from "@/components/admin/ResourceScreens";
import { requireAdmin } from "@/lib/auth";
import { normalizeProject } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  await requireAdmin();
  const projects = (await prisma.project.findMany({ orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }] })).map(normalizeProject);

  return (
    <AdminLayout title="项目管理" description="管理项目案例、技术栈、链接和精选排序。">
      <ProjectsManager items={JSON.parse(JSON.stringify(projects))} />
    </AdminLayout>
  );
}
