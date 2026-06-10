"use client";

import { Loader2, Send } from "lucide-react";
import * as React from "react";
import { useLocale } from "@/components/site/LocaleProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { useToast } from "@/components/ui/Toast";

type Errors = Partial<Record<"name" | "email" | "content", string>>;

const copy = {
  zh: {
    kicker: "Contact Form",
    title: "告诉我你想构建什么。",
    description: "最好包含目标、当前状态、期望结果和时间范围，我会更快判断如何推进。",
    name: "姓名",
    email: "邮箱",
    message: "留言",
    namePlaceholder: "你的姓名",
    emailPlaceholder: "name@your-mail.com",
    messagePlaceholder: "告诉我你想一起构建或讨论什么。",
    nameError: "请输入你的姓名。",
    emailError: "请输入有效邮箱。",
    contentError: "留言至少需要 10 个字符。",
    loading: "发送中...",
    submit: "发送留言",
    successTitle: "留言已发送",
    successDescription: "我会尽快回复你。",
    failTitle: "发送失败",
    failDescription: "请稍后再试。",
    connectedNotice: "留言会保存到网站后台，我会尽快处理。"
  },
  ja: {
    kicker: "Contact Form",
    title: "作りたいものを教えてください。",
    description: "目的、現在の状態、期待する結果、希望時期を書いていただくと判断しやすくなります。",
    name: "お名前",
    email: "メール",
    message: "メッセージ",
    namePlaceholder: "お名前",
    emailPlaceholder: "name@your-mail.com",
    messagePlaceholder: "相談したい内容を教えてください。",
    nameError: "お名前を入力してください。",
    emailError: "有効なメールアドレスを入力してください。",
    contentError: "メッセージは 10 文字以上で入力してください。",
    loading: "送信中...",
    submit: "送信する",
    successTitle: "送信しました",
    successDescription: "できるだけ早く返信します。",
    failTitle: "送信に失敗しました",
    failDescription: "時間をおいてもう一度お試しください。",
    connectedNotice: "フォーム内容は管理画面に保存され、できるだけ早く確認します。"
  },
  en: {
    kicker: "Contact Form",
    title: "Tell me what you want to build.",
    description: "Share the goal, current state, expected outcome, and timeline so I can respond with better context.",
    name: "Name",
    email: "Email",
    message: "Message",
    namePlaceholder: "Your name",
    emailPlaceholder: "name@your-mail.com",
    messagePlaceholder: "Tell me what you want to build or discuss.",
    nameError: "Please enter your name.",
    emailError: "Please enter a valid email.",
    contentError: "Message must be at least 10 characters.",
    loading: "Sending...",
    submit: "Send message",
    successTitle: "Message sent",
    successDescription: "I will reply as soon as I can.",
    failTitle: "Send failed",
    failDescription: "Please try again later.",
    connectedNotice: "Messages are saved to the site admin and reviewed as soon as possible."
  }
} as const;

export function ContactForm() {
  const { toast } = useToast();
  const { locale } = useLocale();
  const t = copy[locale];
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Errors>({});
  const [status, setStatus] = React.useState<"idle" | "success" | "error">("idle");
  const [form, setForm] = React.useState({ name: "", email: "", content: "", company: "", source: "contact" });

  function validate() {
    const nextErrors: Errors = {};
    if (form.name.trim().length < 2) nextErrors.name = t.nameError;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = t.emailError;
    if (form.content.trim().length < 10) nextErrors.content = t.contentError;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (!validate()) return;

    try {
      setLoading(true);
      setStatus("idle");
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await response.json().catch(() => ({ success: false, error: { message: t.failDescription } }));

      if (!response.ok || !json.success) {
        setStatus("error");
        toast({ title: t.failTitle, description: json.error?.message || t.failDescription, type: "error" });
        return;
      }

      setForm({ name: "", email: "", content: "", company: "", source: "contact" });
      setErrors({});
      setStatus("success");
      toast({ title: t.successTitle, description: t.successDescription, type: "success" });
    } catch {
      setStatus("error");
      toast({ title: t.failTitle, description: t.failDescription, type: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="premium-glass-card grid gap-4 rounded-md p-5 md:p-6">
      <div>
        <p className="text-sm font-black text-indigo-700">{t.kicker}</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">{t.title}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">{t.description}</p>
        <p className="mt-2 text-xs font-semibold leading-6 text-slate-500">{t.connectedNotice}</p>
      </div>
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <Input tabIndex={-1} autoComplete="off" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
        </label>
      </div>
      <Field label={t.name} error={errors.name}>
        <Input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder={t.namePlaceholder} aria-invalid={Boolean(errors.name)} />
      </Field>
      <Field label={t.email} error={errors.email}>
        <Input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder={t.emailPlaceholder} aria-invalid={Boolean(errors.email)} />
      </Field>
      <Field label={t.message} error={errors.content}>
        <Textarea required value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder={t.messagePlaceholder} aria-invalid={Boolean(errors.content)} />
      </Field>
      <div aria-live="polite" className="min-h-5 text-sm font-semibold">
        {status === "success" ? <span className="text-emerald-700">{t.successDescription}</span> : null}
        {status === "error" ? <span className="text-red-600">{t.failDescription}</span> : null}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? t.loading : t.submit}
      </Button>
    </form>
  );
}
