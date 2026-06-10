"use client";

import { MailOpen, Trash2 } from "lucide-react";
import * as React from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

type Message = {
  id: string;
  name: string;
  email: string;
  content: string;
  read: boolean;
  status?: string;
  source?: string;
  userAgent?: string | null;
  createdAt: string | Date;
};

export function MessagesManager({ initialMessages }: { initialMessages: Message[] }) {
  const { toast } = useToast();
  const [messages, setMessages] = React.useState(initialMessages);
  const [deleteTarget, setDeleteTarget] = React.useState<Message | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function markRead(message: Message) {
    const response = await fetch(`/api/messages/${message.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !message.read })
    });
    const json = await response.json();
    if (!json.success) {
      toast({ title: "更新失败", type: "error" });
      return;
    }
    setMessages((current) => current.map((item) => (item.id === message.id ? json.data : item)));
  }

  async function deleteMessage() {
    if (!deleteTarget) return;
    setLoading(true);
    const response = await fetch(`/api/messages/${deleteTarget.id}`, { method: "DELETE" });
    const json = await response.json();
    setLoading(false);
    if (!json.success) {
      toast({ title: "删除失败", type: "error" });
      return;
    }
    setMessages((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  return (
    <>
      <DataTable
        data={messages}
        columns={[
          { key: "name", label: "姓名", sortable: true },
          { key: "email", label: "邮箱", sortable: true },
          { key: "content", label: "留言", render: (item) => <span className="line-clamp-3">{item.content}</span> },
          { key: "source", label: "来源", render: (item) => <span>{item.source || "contact"}</span>, sortable: true },
          { key: "read", label: "状态", render: (item) => <StatusBadge label={item.status === "REPLIED" ? "已回复" : item.status === "ARCHIVED" ? "已归档" : item.read ? "已读" : "未读"} tone={item.read ? "success" : "warning"} /> },
          { key: "createdAt", label: "创建时间", render: (item) => formatDate(item.createdAt), sortable: true }
        ]}
        actions={(item) => (
          <div className="inline-flex gap-2">
            <button type="button" onClick={() => markRead(item)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="切换已读状态">
              <MailOpen className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="删除">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="删除留言"
        description="这条留言会从收件箱中永久删除。"
        loading={loading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteMessage}
      />
    </>
  );
}
