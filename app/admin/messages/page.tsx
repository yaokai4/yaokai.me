import { AdminLayout } from "@/components/admin/AdminLayout";
import { MessagesManager } from "@/components/admin/MessagesManager";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdmin();
  const messages = await prisma.message.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <AdminLayout title="留言收件箱" description="查看联系表单提交内容，并标记已读或未读。">
      <MessagesManager initialMessages={JSON.parse(JSON.stringify(messages))} />
    </AdminLayout>
  );
}
