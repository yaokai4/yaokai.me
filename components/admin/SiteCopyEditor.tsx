"use client";

import { Code2, RotateCcw, Save } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { CopyOverrides } from "@/lib/copy-overrides";
import { cn } from "@/lib/utils";

type CopyField = {
  key: string;
  label: string;
  multiline?: boolean;
  hint?: string;
};

type CopyGroup = {
  id: string;
  title: string;
  description: string;
  fields: CopyField[];
};

const locales = [
  ["zh", "中文"],
  ["ja", "日本語"],
  ["en", "English"]
] as const;

function localizedFields(prefix: string, label: string, keys: Array<Omit<CopyField, "key"> & { path: string }>): CopyGroup[] {
  return locales.map(([locale, localeLabel]) => ({
    id: `${prefix}-${locale}`,
    title: `${label} / ${localeLabel}`,
    description: "这里显示的是前台当前使用的文案；保存后会覆盖代码里的默认值。",
    fields: keys.map(({ path, ...field }) => ({
      ...field,
      key: `${prefix}.${locale}.${path}`
    }))
  }));
}

const fieldGroups: CopyGroup[] = [
  ...localizedFields("root", "SEO 默认文案", [
    { path: "title", label: "默认标题" },
    { path: "description", label: "默认描述", multiline: true }
  ]),
  ...localizedFields("shell", "头部 / 底部 / 搜索", [
    { path: "brandSubtitle", label: "头部副标题" },
    { path: "primaryNav.0.0", label: "导航 1" },
    { path: "primaryNav.1.0", label: "导航 2" },
    { path: "primaryNav.2.0", label: "导航 3" },
    { path: "primaryNav.3.0", label: "导航 4" },
    { path: "primaryNav.4.0", label: "导航 5" },
    { path: "searchShort", label: "搜索按钮短文案" },
    { path: "searchPlaceholder", label: "搜索框占位", multiline: true },
    { path: "searchEmpty", label: "搜索无结果文案", multiline: true },
    { path: "footerTitle", label: "底部介绍", multiline: true },
    { path: "footerRights", label: "底部版权" },
    { path: "footerNote", label: "底部备注", multiline: true }
  ]),
  ...localizedFields("home", "首页", [
    { path: "eyebrow", label: "首屏 eyebrow" },
    { path: "heroTitle", label: "首屏标题", multiline: true },
    { path: "heroSubtitle", label: "首屏副标题", multiline: true },
    { path: "heroLead", label: "首屏正文", multiline: true },
    { path: "workCta", label: "作品按钮" },
    { path: "resumeCta", label: "简历按钮" },
    { path: "runningLabel", label: "运营区标题" },
    { path: "runningNote", label: "GitHub 链接说明" },
    { path: "proofEyebrow", label: "证明区 eyebrow" },
    { path: "proofTitle", label: "证明区标题", multiline: true },
    { path: "proofLead", label: "证明区说明", multiline: true },
    { path: "projectsEyebrow", label: "作品区 eyebrow" },
    { path: "projectsTitle", label: "作品区标题", multiline: true },
    { path: "projectsLead", label: "作品区说明", multiline: true },
    { path: "scopeEyebrow", label: "能力区 eyebrow" },
    { path: "scopeTitle", label: "能力区标题", multiline: true },
    { path: "writingEyebrow", label: "文章区 eyebrow" },
    { path: "writingTitle", label: "文章区标题", multiline: true },
    { path: "writingLead", label: "文章区说明", multiline: true },
    { path: "ctaTitle", label: "底部 CTA 标题", multiline: true },
    { path: "ctaLead", label: "底部 CTA 说明", multiline: true },
    { path: "ctaButton", label: "底部 CTA 按钮" }
  ]),
  ...localizedFields("site", "作品 / 文章 / 指南 / 资源 / 动态页面", [
    { path: "pages.projects.metaTitle", label: "作品 SEO 标题" },
    { path: "pages.projects.metaDescription", label: "作品 SEO 描述", multiline: true },
    { path: "pages.projects.eyebrow", label: "作品 eyebrow" },
    { path: "pages.projects.title", label: "作品页标题", multiline: true },
    { path: "pages.projects.description", label: "作品页说明", multiline: true },
    { path: "explorers.projects.filterHint", label: "作品筛选提示", multiline: true },
    { path: "explorers.projects.placeholder", label: "作品搜索占位" },
    { path: "explorers.projects.featured", label: "精选案例标签" },
    { path: "explorers.projects.view", label: "查看案例按钮" },
    { path: "pages.blog.metaTitle", label: "文章 SEO 标题" },
    { path: "pages.blog.metaDescription", label: "文章 SEO 描述", multiline: true },
    { path: "pages.blog.eyebrow", label: "文章 eyebrow" },
    { path: "pages.blog.title", label: "文章页标题", multiline: true },
    { path: "pages.blog.description", label: "文章页说明", multiline: true },
    { path: "explorers.blog.filterHint", label: "文章筛选提示", multiline: true },
    { path: "explorers.blog.placeholder", label: "文章搜索占位" },
    { path: "explorers.blog.readMore", label: "阅读全文" },
    { path: "explorers.blog.featureKicker", label: "精选文章小标题" },
    { path: "explorers.blog.featureLead", label: "精选文章说明", multiline: true },
    { path: "pages.guide.metaTitle", label: "指南 SEO 标题" },
    { path: "pages.guide.metaDescription", label: "指南 SEO 描述", multiline: true },
    { path: "pages.guide.eyebrow", label: "指南 eyebrow" },
    { path: "pages.guide.title", label: "指南页标题", multiline: true },
    { path: "pages.guide.description", label: "指南页说明", multiline: true },
    { path: "explorers.guide.filterHint", label: "指南筛选提示", multiline: true },
    { path: "explorers.guide.placeholder", label: "指南搜索占位" },
    { path: "explorers.guide.enter", label: "进入指南按钮" },
    { path: "pages.resources.metaTitle", label: "资源 SEO 标题" },
    { path: "pages.resources.metaDescription", label: "资源 SEO 描述", multiline: true },
    { path: "pages.resources.eyebrow", label: "资源 eyebrow" },
    { path: "pages.resources.title", label: "资源页标题", multiline: true },
    { path: "pages.resources.description", label: "资源页说明", multiline: true },
    { path: "explorers.resources.filterHint", label: "资源筛选提示", multiline: true },
    { path: "explorers.resources.placeholder", label: "资源搜索占位" },
    { path: "explorers.resources.open", label: "资源打开按钮" },
    { path: "pages.posts.eyebrow", label: "动态 eyebrow" },
    { path: "pages.posts.title", label: "动态页标题", multiline: true },
    { path: "pages.posts.description", label: "动态页说明", multiline: true }
  ]),
  ...localizedFields("stack", "技术栈", [
    { path: "metaTitle", label: "SEO 标题" },
    { path: "metaDescription", label: "SEO 描述", multiline: true },
    { path: "eyebrow", label: "eyebrow" },
    { path: "title", label: "页面标题", multiline: true },
    { path: "description", label: "页面说明", multiline: true },
    { path: "narratives.0.0", label: "叙事卡 1 标题" },
    { path: "narratives.0.1", label: "叙事卡 1 说明", multiline: true },
    { path: "narratives.1.0", label: "叙事卡 2 标题" },
    { path: "narratives.1.1", label: "叙事卡 2 说明", multiline: true },
    { path: "narratives.2.0", label: "叙事卡 3 标题" },
    { path: "narratives.2.1", label: "叙事卡 3 说明", multiline: true },
    { path: "skillTitle", label: "技能区标题", multiline: true },
    { path: "skillDescription", label: "技能区说明", multiline: true },
    { path: "resourceTitle", label: "资源区标题", multiline: true },
    { path: "resourceDescription", label: "资源区说明", multiline: true }
  ]),
  ...locales.map(([locale, localeLabel]) => ({
    id: `about-${locale}`,
    title: `关于 / ${localeLabel}`,
    description: "关于页默认文案这次不主动改，但这里可以后台覆盖。",
    fields: [
      { key: `about.title.${locale}`, label: "职业标题", multiline: true },
      { key: `about.summary.${locale}`, label: "个人概要", multiline: true },
      { key: `about.valueLabel.${locale}`, label: "价值区标题" },
      { key: `about.values.${locale}.0`, label: "价值 1", multiline: true },
      { key: `about.values.${locale}.1`, label: "价值 2", multiline: true },
      { key: `about.values.${locale}.2`, label: "价值 3", multiline: true },
      { key: `about.values.${locale}.3`, label: "价值 4", multiline: true },
      { key: `about.prTitle.${locale}`, label: "自我 PR 标题", multiline: true },
      { key: `about.pr1.${locale}`, label: "自我 PR 第一段", multiline: true },
      { key: `about.pr2.${locale}`, label: "自我 PR 第二段", multiline: true },
      { key: `about.download.${locale}`, label: "简历下载按钮" },
      { key: `about.contactCta.${locale}`, label: "联系按钮" }
    ]
  })),
  ...localizedFields("contact", "联系页", [
    { path: "metadata.title", label: "SEO 标题" },
    { path: "metadata.description", label: "SEO 描述", multiline: true },
    { path: "eyebrow", label: "eyebrow" },
    { path: "title", label: "页面标题", multiline: true },
    { path: "description", label: "页面说明", multiline: true },
    { path: "collaborationBody", label: "当前方向说明", multiline: true },
    { path: "fitTitle", label: "可聊内容标题" },
    { path: "fitBody", label: "可聊内容说明", multiline: true }
  ]),
  ...localizedFields("contactForm", "联系表单", [
    { path: "title", label: "表单标题", multiline: true },
    { path: "description", label: "表单说明", multiline: true },
    { path: "name", label: "姓名字段" },
    { path: "email", label: "邮箱字段" },
    { path: "message", label: "留言字段" },
    { path: "messagePlaceholder", label: "留言占位", multiline: true },
    { path: "submit", label: "提交按钮" },
    { path: "successDescription", label: "成功提示", multiline: true }
  ]),
  ...localizedFields("library", "资源库别名页", [
    { path: "metaTitle", label: "SEO 标题" },
    { path: "metaDescription", label: "SEO 描述", multiline: true },
    { path: "eyebrow", label: "eyebrow" },
    { path: "title", label: "页面标题", multiline: true },
    { path: "description", label: "页面说明", multiline: true }
  ])
];

function mergeCopy(defaults: CopyOverrides, overrides: CopyOverrides): CopyOverrides {
  return { ...defaults, ...overrides };
}

function cleanOverrides(overrides: CopyOverrides, defaults: CopyOverrides): CopyOverrides {
  return Object.fromEntries(
    Object.entries(overrides).filter(([key, value]) => value.trim().length > 0 && value !== defaults[key])
  );
}

export function SiteCopyEditor({ defaults, overrides }: { defaults: CopyOverrides; overrides: CopyOverrides }) {
  const { toast } = useToast();
  const initialForm = React.useMemo(() => mergeCopy(defaults, overrides), [defaults, overrides]);
  const [form, setForm] = React.useState<CopyOverrides>(initialForm);
  const [activeGroup, setActiveGroup] = React.useState(fieldGroups[0]?.id || "");
  const [jsonText, setJsonText] = React.useState(() => JSON.stringify(initialForm, null, 2));
  const [loading, setLoading] = React.useState(false);
  const active = fieldGroups.find((group) => group.id === activeGroup) || fieldGroups[0];

  function updateField(key: string, value: string) {
    const next = { ...form, [key]: value };
    setForm(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function removeField(key: string) {
    const next = { ...form, [key]: defaults[key] || "" };
    setForm(next);
    setJsonText(JSON.stringify(next, null, 2));
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(jsonText || "{}");
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("JSON 必须是对象。");
      const next = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, String(value)]));
      const merged = mergeCopy(defaults, next);
      setForm(merged);
      setJsonText(JSON.stringify(merged, null, 2));
      toast({ title: "JSON 已应用", type: "success" });
    } catch (error) {
      toast({ title: "JSON 格式错误", description: error instanceof Error ? error.message : "请检查 JSON。", type: "error" });
    }
  }

  async function save() {
    setLoading(true);
    const response = await fetch("/api/site-copy", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanOverrides(form, defaults))
    });
    const json = await response.json();
    setLoading(false);

    if (!json.success) {
      toast({ title: "文案保存失败", description: json.error?.message || "请稍后再试。", type: "error" });
      return;
    }

    const next = mergeCopy(defaults, json.data || {});
    setForm(next);
    setJsonText(JSON.stringify(next, null, 2));
    toast({ title: "文案已保存", description: "刷新前台即可看到最新文案。", type: "success" });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
        <div className="grid gap-1">
          {fieldGroups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveGroup(group.id)}
              className={cn(
                "rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950",
                activeGroup === group.id && "bg-slate-950 text-white hover:bg-slate-950 hover:text-white"
              )}
            >
              {group.title}
            </button>
          ))}
        </div>
      </aside>

      <section className="grid gap-5">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">{active.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{active.description}</p>
            </div>
            <Button onClick={save} disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? "保存中..." : "保存文案"}
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {active.fields.map((field) => (
              <label key={field.key} className={cn("grid gap-2", field.multiline && "md:col-span-2")}>
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-slate-700">
                  <span>{field.label}</span>
                  <button type="button" onClick={() => removeField(field.key)} className="inline-flex items-center gap-1 text-xs text-slate-400 transition hover:text-indigo-700">
                    <RotateCcw className="h-3.5 w-3.5" />
                    恢复默认
                  </button>
                </span>
                {field.multiline ? (
                  <textarea
                    value={form[field.key] || ""}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    placeholder="当前没有默认文案"
                    className="min-h-28 rounded-md border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-950 outline-none focus:border-slate-400"
                  />
                ) : (
                  <input
                    value={form[field.key] || ""}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    placeholder="当前没有默认文案"
                    className="h-11 rounded-md border border-slate-200 px-3 text-sm text-slate-950 outline-none focus:border-slate-400"
                  />
                )}
                <span className="break-all text-[11px] font-mono text-slate-400">{field.key}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                <Code2 className="h-5 w-5" />
                高级 JSON
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                可以添加任何 flat key，例如 <code className="rounded bg-slate-100 px-1 py-0.5">about.prTitle.ja</code>。保存后前台会覆盖对应默认文案。
              </p>
            </div>
            <Button variant="secondary" onClick={applyJson}>应用 JSON</Button>
          </div>
          <textarea
            value={jsonText}
            onChange={(event) => setJsonText(event.target.value)}
            spellCheck={false}
            className="min-h-[320px] w-full rounded-md border border-slate-200 bg-slate-950 px-3 py-3 font-mono text-xs leading-6 text-slate-100 outline-none focus:border-slate-400"
          />
        </div>
      </section>
    </div>
  );
}
