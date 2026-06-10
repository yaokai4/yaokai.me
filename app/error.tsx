"use client";

import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  reset
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section className="section-container grid min-h-screen place-items-center py-24">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-red-200">错误</p>
        <h1 className="mt-5 text-4xl font-semibold text-slate-950">页面加载时遇到了一点问题。</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">系统没有成功完成这次请求。你可以重试，或返回上一级页面继续浏览。</p>
        <Button className="mt-8" onClick={reset}>重试</Button>
      </div>
    </section>
  );
}
