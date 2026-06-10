"use client";

import { Eye, EyeOff, KeyRound, Save } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function SecurityForm() {
  const { toast } = useToast();
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [form, setForm] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      toast({ title: "两次新密码不一致", type: "error" });
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      })
    });
    const json = await response.json();
    setLoading(false);

    if (!json.success) {
      toast({ title: "密码修改失败", description: json.error?.message || "请检查当前密码。", type: "error" });
      return;
    }

    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    toast({ title: "密码已更新", description: "下次登录请使用新密码。", type: "success" });
  }

  const type = show ? "text" : "password";

  return (
    <form onSubmit={submit} className="max-w-2xl rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3 rounded-md border border-indigo-100 bg-indigo-50/55 p-4">
        <KeyRound className="mt-1 h-5 w-5 text-indigo-700" />
        <div>
          <p className="font-semibold text-slate-950">修改后台登录密码</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">为了安全，需要先输入当前密码。新密码至少 10 个字符。</p>
        </div>
      </div>

      <div className="grid gap-4">
        <PasswordField
          label="当前密码"
          type={type}
          value={form.currentPassword}
          onChange={(value) => setForm((current) => ({ ...current, currentPassword: value }))}
        />
        <PasswordField
          label="新密码"
          type={type}
          value={form.newPassword}
          onChange={(value) => setForm((current) => ({ ...current, newPassword: value }))}
        />
        <PasswordField
          label="确认新密码"
          type={type}
          value={form.confirmPassword}
          onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={() => setShow((value) => !value)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {show ? "隐藏密码" : "显示密码"}
        </button>
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4" />
          {loading ? "保存中..." : "保存新密码"}
        </Button>
      </div>
    </form>
  );
}

function PasswordField({
  label,
  type,
  value,
  onChange
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
        autoComplete="new-password"
      />
    </label>
  );
}
