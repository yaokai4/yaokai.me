import { AdminLayout } from "@/components/admin/AdminLayout";
import { BlogManager } from "@/components/admin/ResourceScreens";
import { requireAdmin } from "@/lib/auth";
import { normalizeArticle } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  await requireAdmin();
  const articles = (await prisma.article.findMany({ orderBy: [{ updatedAt: "desc" }] })).map(normalizeArticle);

  return (
    <AdminLayout title="文章管理" description="创建、预览、发布和维护长期内容。">
      <BlogManager items={JSON.parse(JSON.stringify(articles))} />
    </AdminLayout>
  );
}
