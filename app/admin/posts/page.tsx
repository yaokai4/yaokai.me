import { AdminLayout } from "@/components/admin/AdminLayout";
import { PostsManager } from "@/components/admin/ResourceScreens";
import { requireAdmin } from "@/lib/auth";
import { normalizePost } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  await requireAdmin();
  const posts = (await prisma.post.findMany({ orderBy: { createdAt: "desc" } })).map(normalizePost);

  return (
    <AdminLayout title="动态管理" description="发布短想法、更新记录和公告。">
      <PostsManager items={JSON.parse(JSON.stringify(posts))} />
    </AdminLayout>
  );
}
