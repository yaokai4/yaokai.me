"use client";

import { Save } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

const fields = [
  ["siteName", "站点名称"],
  ["siteDescription", "站点描述"],
  ["avatarUrl", "头像图片 URL"],
  ["heroTitle", "首页主标题"],
  ["heroSubtitle", "首页副标题"],
  ["email", "邮箱"],
  ["seoTitle", "默认 SEO 标题"],
  ["seoDescription", "默认 SEO 描述"],
  ["ogImage", "Open Graph 图片"],
  ["theme", "主题"],
  ["icp", "备案信息"],
  ["socials", "社交链接 JSON"],
  ["now", "当前关注 JSON"]
] as const;

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const { toast } = useToast();
  const [form, setForm] = React.useState<Record<string, string>>(settings);
  const [loading, setLoading] = React.useState(false);

  async function save() {
    setLoading(true);
    const response = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await response.json();
    setLoading(false);

    if (!json.success) {
      toast({ title: "设置保存失败", description: json.error?.message || "请稍后再试。", type: "error" });
      return;
    }

    toast({ title: "设置已保存", type: "success" });
  }

  return (
    <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 rounded-md border border-indigo-100 bg-indigo-50/45 p-4 md:flex-row md:items-center">
        <div className="h-20 w-20 overflow-hidden rounded-full border border-indigo-200 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.avatarUrl || "/images/avatar-yaokai.svg"} alt="头像预览" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950">头像预览</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            可以填本站图片路径，例如 <code className="rounded bg-white px-1 py-0.5">/images/avatar-yaokai.svg</code>，也可以粘贴外部图片链接。
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className={key === "heroSubtitle" || key === "socials" || key === "now" ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
            <span className="text-sm font-medium text-slate-700">{label}</span>
            {key === "heroSubtitle" || key === "socials" || key === "now" ? (
              <textarea
                value={form[key] || ""}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className="min-h-28 rounded-md border border-slate-200 px-3 py-3 text-sm text-slate-950 outline-none focus:border-slate-400"
              />
            ) : (
              <input
                value={form[key] || ""}
                onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                className="h-11 rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-400"
              />
            )}
          </label>
        ))}
      </div>
      <div className="mt-5 flex justify-end">
        <Button onClick={save} disabled={loading}>
          <Save className="h-4 w-4" />
          {loading ? "保存中..." : "保存设置"}
        </Button>
      </div>
    </div>
  );
}
