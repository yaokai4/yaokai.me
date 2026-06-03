"use client";

import { Send } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";

type Errors = Partial<Record<"name" | "email" | "content", string>>;

export function ContactForm() {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [form, setForm] = React.useState({ name: "", email: "", content: "" });

  function validate() {
    const nextErrors: Errors = {};
    if (form.name.trim().length < 2) nextErrors.name = "请输入你的姓名。";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "请输入有效邮箱。";
    if (form.content.trim().length < 10) nextErrors.content = "留言至少需要 10 个字符。";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setLoading(false);

    const json = await response.json();
    if (!json.success) {
      toast({ title: "发送失败", description: json.error?.message || "请稍后再试。", type: "error" });
      return;
    }

    setForm({ name: "", email: "", content: "" });
    setErrors({});
    toast({ title: "留言已发送", description: "我会尽快回复你。", type: "success" });
  }

  return (
    <form onSubmit={onSubmit} className="premium-glass-card grid gap-4 rounded-md p-5 md:p-6">
      <div>
        <p className="text-sm font-black text-cyan-700">Contact Form</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">告诉我你想构建什么。</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">最好包含目标、当前状态、期望结果和时间范围，我会更快判断如何推进。</p>
      </div>
      <Field label="姓名" error={errors.name}>
        <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="你的姓名" />
      </Field>
      <Field label="邮箱" error={errors.email}>
        <Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
      </Field>
      <Field label="留言" error={errors.content}>
        <Textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="告诉我你想一起构建或讨论什么。" />
      </Field>
      <Button type="submit" disabled={loading}>
        <Send className="h-4 w-4" />
        {loading ? "发送中..." : "发送留言"}
      </Button>
    </form>
  );
}
