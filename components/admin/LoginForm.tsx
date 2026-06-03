"use client";

import { Eye, EyeOff, Lock, LogIn, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useToast } from "@/components/ui/Toast";

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [form, setForm] = React.useState({ account: "yaokai", password: "" });
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
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-[1.5rem] border border-amber-200/70 bg-white/66 p-6 shadow-[0_28px_90px_rgba(120,74,31,0.16)] backdrop-blur-xl">
      <label className="grid gap-2 text-sm font-medium text-slate-700">
        账号
        <span className="relative">
          <UserRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={form.account}
            onChange={(event) => setForm({ ...form, account: event.target.value })}
            className="h-[52px] w-full rounded-2xl border border-amber-100 bg-white/86 pl-11 pr-4 text-base text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100"
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
            className="h-[52px] w-full rounded-2xl border border-amber-100 bg-white/86 pl-11 pr-12 text-base text-slate-950 outline-none transition placeholder:text-slate-300 focus:border-amber-300 focus:bg-white focus:ring-4 focus:ring-amber-100"
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-amber-50 hover:text-slate-700"
            aria-label={showPassword ? "隐藏密码" : "显示密码"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 text-base font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" />
        {loading ? "登录中..." : "登录后台"}
      </button>
      <p className="text-center text-xs text-slate-500">入口已隐藏：只有访问 /yaokai 才能进入这里。</p>
    </form>
  );
}
