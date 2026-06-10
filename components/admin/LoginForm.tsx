"use client";

import { Eye, EyeOff, Lock, LogIn, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useToast } from "@/components/ui/Toast";

type LoginFormProps = {
  redirectTo?: string;
  defaultAccount?: string;
  submitLabel?: string;
  footerText?: string;
};

export function LoginForm({
  redirectTo = "/admin",
  defaultAccount = "yaokai",
  submitLabel = "登录后台",
  footerText = "入口已隐藏：只有访问 /yaokai 才能进入这里。"
}: LoginFormProps = {}) {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = React.useState({ account: defaultAccount, password: "" });
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await response.json();
    setLoading(false);

    if (!json.success) {
      toast({ title: "登录失败", description: json.error?.message || "请检查账号和密码。", type: "error" });
      return;
    }

    toast({ title: "欢迎回来", type: "success" });
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-md border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,45,78,0.04)]">
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        账号
        <span className="relative">
          <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={form.account}
            onChange={(event) => setForm({ ...form, account: event.target.value })}
            className="h-[52px] w-full rounded-md border border-slate-200 bg-white pl-11 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            placeholder="yaokai"
            autoComplete="username"
          />
        </span>
      </label>
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        密码
        <span className="relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="h-[52px] w-full rounded-md border border-slate-200 bg-white pl-11 pr-12 text-base text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:bg-indigo-50 hover:text-slate-700"
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-[52px] items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-base font-semibold text-white shadow-[0_1px_2px_rgba(15,45,78,0.04)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {loading ? "登录中..." : submitLabel}
      </button>
      <p className="text-center text-xs text-slate-500">{footerText}</p>
    </form>
  );
}
