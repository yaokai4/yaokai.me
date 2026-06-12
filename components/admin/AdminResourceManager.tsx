"use client";

import { AlertTriangle, CheckCircle2, Edit, Gauge, Info, Plus, Save, Trash2, X } from "lucide-react";
import * as React from "react";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type FieldType = "text" | "textarea" | "markdown" | "tags" | "checkbox" | "select" | "number" | "url" | "datetime";

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  full?: boolean;
};

type Item = Record<string, unknown> & { id: string };
type QualityTone = "success" | "warning" | "info";
type QualityCheck = {
  label: string;
  detail: string;
  tone: QualityTone;
};

function toInputValue(value: unknown, field?: FieldConfig) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value;
  if (!value) return "";
  if (field?.type === "datetime") return new Date(String(value)).toISOString().slice(0, 16);
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString().slice(0, 16);
  return String(value);
}

function normalizePayload(form: Record<string, unknown>, fields: FieldConfig[]) {
  const payload: Record<string, unknown> = {};

  for (const field of fields) {
    const value = form[field.name];
    if (field.type === "tags") {
      payload[field.name] = String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    } else if (field.type === "checkbox") {
      payload[field.name] = Boolean(value);
    } else if (field.type === "number") {
      payload[field.name] = Number(value || 0);
    } else if (field.type === "datetime") {
      payload[field.name] = value ? String(value) : null;
    } else {
      payload[field.name] = value === "" ? null : value;
    }
  }

  return payload;
}

function buildEmpty(fields: FieldConfig[]) {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === "checkbox" ? false : field.type === "number" ? 0 : field.type === "select" ? field.options?.[0] || "" : ""
    ])
  );
}

function displayOption(option: string) {
  if (option === "PUBLISHED") return "已发布";
  if (option === "DRAFT") return "草稿";
  if (option === "true") return "是";
  if (option === "false") return "否";
  return option;
}

function stringValue(form: Record<string, unknown>, key: string) {
  return String(form[key] || "").trim();
}

function listValue(form: Record<string, unknown>, key: string) {
  const value = form[key];
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isPublicUrl(value: string) {
  if (!value) return true;
  if (value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function hasField(fields: FieldConfig[], name: string) {
  return fields.some((field) => field.name === name);
}

function makeLengthCheck(label: string, value: string, min: number, max: number, emptyDetail: string): QualityCheck {
  const length = value.length;
  if (!length) return { label, detail: emptyDetail, tone: "warning" };
  if (length < min) return { label, detail: `当前 ${length} 字，建议至少 ${min} 字。`, tone: "warning" };
  if (length > max) return { label, detail: `当前 ${length} 字，建议控制在 ${max} 字以内。`, tone: "warning" };
  return { label, detail: `当前 ${length} 字，适合展示与检索。`, tone: "success" };
}

function buildQualityChecks(form: Record<string, unknown>, fields: FieldConfig[]) {
  const checks: QualityCheck[] = [];

  if (hasField(fields, "title")) {
    checks.push(makeLengthCheck("标题", stringValue(form, "title"), 6, 70, "标题会直接影响列表点击和浏览器标题。"));
  }

  if (hasField(fields, "slug")) {
    const slug = stringValue(form, "slug");
    const valid = /^[a-z0-9\u4e00-\u9fa5-]+$/i.test(slug);
    checks.push({
      label: "链接标识",
      detail: slug && valid ? "结构稳定，适合长期收录。" : "建议只使用中文、英文、数字和连字符，避免后续改 URL。",
      tone: slug && valid ? "success" : "warning"
    });
  }

  if (hasField(fields, "excerpt")) {
    checks.push(makeLengthCheck("摘要", stringValue(form, "excerpt"), 40, 180, "摘要会出现在列表、搜索和社交分享里。"));
  } else if (hasField(fields, "description")) {
    checks.push(makeLengthCheck("描述", stringValue(form, "description"), 35, 180, "描述需要说明资源价值，而不只是重复标题。"));
  }

  if (hasField(fields, "content")) {
    const content = stringValue(form, "content");
    const minLength = fields.find((field) => field.name === "content")?.type === "markdown" ? 600 : 80;
    checks.push({
      label: "正文深度",
      detail: content.length >= minLength ? `当前 ${content.length} 字，具备完整阅读价值。` : `当前 ${content.length} 字，建议补到 ${minLength} 字以上再公开。`,
      tone: content.length >= minLength ? "success" : "warning"
    });
  }

  if (hasField(fields, "tags")) {
    const tags = listValue(form, "tags");
    checks.push({
      label: "标签",
      detail: tags.length >= 2 ? `${tags.length} 个标签，利于搜索和筛选。` : "建议至少 2 个标签，方便前台检索。",
      tone: tags.length >= 2 ? "success" : "warning"
    });
  }

  if (hasField(fields, "seoTitle")) {
    checks.push(makeLengthCheck("SEO 标题", stringValue(form, "seoTitle") || stringValue(form, "title"), 18, 65, "建议填写独立 SEO 标题，便于搜索结果展示。"));
  }

  if (hasField(fields, "seoDescription")) {
    checks.push(makeLengthCheck("SEO 描述", stringValue(form, "seoDescription") || stringValue(form, "excerpt"), 70, 160, "建议填写 70-160 字搜索摘要。"));
  }

  for (const key of ["coverImage", "ogImage", "demoUrl", "githubUrl", "url"]) {
    if (!hasField(fields, key)) continue;
    const value = stringValue(form, key);
    const required = fields.find((field) => field.name === key)?.required;
    if (!value && !required) {
      checks.push({ label: key === "url" ? "外部链接" : "图片/链接", detail: "可选字段未填写，不影响保存。", tone: "info" });
      continue;
    }
    checks.push({
      label: key === "url" ? "外部链接" : "图片/链接",
      detail: isPublicUrl(value) ? "格式可访问，适合前台使用。" : "建议使用 https:// 或站内 / 开头的路径。",
      tone: isPublicUrl(value) ? "success" : "warning"
    });
  }

  const projectEvidenceFields = ["role", "challenge", "solution", "result"];
  if (projectEvidenceFields.every((key) => hasField(fields, key))) {
    const missing = projectEvidenceFields.filter((key) => stringValue(form, key).length < 30);
    checks.push({
      label: "案例证据链",
      detail: missing.length ? "角色、挑战、方案、结果里还有字段偏短，案例说服力会打折。" : "角色、挑战、方案、结果齐全，适合作为作品案例。",
      tone: missing.length ? "warning" : "success"
    });
  }

  if (hasField(fields, "technicalHighlights")) {
    const highlights = listValue(form, "technicalHighlights");
    checks.push({
      label: "技术亮点",
      detail: highlights.length >= 3 ? `${highlights.length} 条技术亮点，能支撑工程能力判断。` : "建议至少 3 条技术亮点，避免案例只停留在描述层。",
      tone: highlights.length >= 3 ? "success" : "warning"
    });
  }

  if (hasField(fields, "status") && stringValue(form, "status") === "PUBLISHED") {
    const warnings = checks.filter((check) => check.tone === "warning").length;
    checks.push({
      label: "发布状态",
      detail: warnings ? `已选择发布，但还有 ${warnings} 个优化项。` : "发布前检查全部关键项通过。",
      tone: warnings ? "warning" : "success"
    });
  }

  return checks;
}

export function AdminResourceManager({
  title,
  endpoint,
  fields,
  initialItems,
  columns,
  filters = []
}: {
  title: string;
  endpoint: string;
  fields: FieldConfig[];
  initialItems: Item[];
  columns: Column<Item>[];
  filters?: Array<{ label: string; key: string; value: string }>;
}) {
  const { toast } = useToast();
  const [items, setItems] = React.useState<Item[]>(initialItems);
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState("all");
  const [editing, setEditing] = React.useState<Item | null>(null);
  const [form, setForm] = React.useState<Record<string, unknown>>(buildEmpty(fields));
  const [saving, setSaving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Item | null>(null);

  const filtered = items.filter((item) => {
    const haystack = JSON.stringify(item).toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const activeFilter = filters.find((entry) => entry.label === filter);
    const matchesFilter = !activeFilter || String(item[activeFilter.key]) === activeFilter.value;
    return matchesQuery && matchesFilter;
  });
  const qualityChecks = React.useMemo(() => buildQualityChecks(form, fields), [fields, form]);

  function startCreate() {
    setEditing(null);
    setForm(buildEmpty(fields));
  }

  function startEdit(item: Item) {
    setEditing(item);
    setForm(Object.fromEntries(fields.map((field) => [field.name, toInputValue(item[field.name], field)])));
  }

  async function save() {
    setSaving(true);
    const payload = normalizePayload(form, fields);
    const url = editing ? `${endpoint}/${editing.id}` : endpoint;
    const response = await fetch(url, {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const json = await response.json();
    setSaving(false);

    if (!json.success) {
      toast({ title: "保存失败", description: json.error?.message || "请检查表单内容。", type: "error" });
      return;
    }

    const saved = json.data as Item;
    setItems((current) => (editing ? current.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...current]));
    setEditing(null);
    setForm(buildEmpty(fields));
    toast({ title: "保存成功", description: `${title} 已更新。`, type: "success" });
  }

  async function deleteItem() {
    if (!deleteTarget) return;
    setSaving(true);
    const response = await fetch(`${endpoint}/${deleteTarget.id}`, { method: "DELETE" });
    const json = await response.json();
    setSaving(false);

    if (!json.success) {
      toast({ title: "删除失败", description: json.error?.message || "请稍后再试。", type: "error" });
      return;
    }

    setItems((current) => current.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast({ title: "删除成功", description: `${title} 已移除。`, type: "success" });
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">{editing ? `编辑${title}` : `新建${title}`}</h2>
            <p className="mt-1 text-sm text-slate-500">保存草稿、发布内容，并让前台展示保持最新。</p>
          </div>
          <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            <Plus className="h-4 w-4" />
            新建
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className={field.full ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
              <span className="text-sm font-medium text-slate-700">
                {field.label}
                {field.required ? <span className="text-red-500"> *</span> : null}
              </span>
              <FieldInput
                field={field}
                value={form[field.name]}
                onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))}
              />
            </label>
          ))}
        </div>

        {qualityChecks.length ? <PublishQualityPanel checks={qualityChecks} /> : null}

        <div className="mt-5 flex justify-end gap-2">
          {editing ? (
            <button type="button" onClick={startCreate} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              <X className="h-4 w-4" />
              取消编辑
            </button>
          ) : null}
          <Button onClick={save} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </section>

      <section className="grid gap-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索列表"
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
          />
          {filters.length ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-md border px-3 py-2 text-sm ${filter === "all" ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}
              >
                全部
              </button>
              {filters.map((entry) => (
                <button
                  key={entry.label}
                  type="button"
                  onClick={() => setFilter(entry.label)}
                  className={`rounded-md border px-3 py-2 text-sm ${filter === entry.label ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-700"}`}
                >
                  {entry.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <DataTable
          data={filtered}
          columns={columns}
          actions={(item) => (
            <div className="inline-flex gap-2">
              <button type="button" onClick={() => startEdit(item)} className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-50" aria-label="编辑">
                <Edit className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setDeleteTarget(item)} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50" aria-label="删除">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`删除${title}`}
        description="这个操作不可撤销。请确认后再删除该内容。"
        loading={saving}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={deleteItem}
      />
    </div>
  );
}

function PublishQualityPanel({ checks }: { checks: QualityCheck[] }) {
  const actionable = checks.filter((check) => check.tone !== "info");
  const passed = actionable.filter((check) => check.tone === "success").length;
  const warnings = actionable.filter((check) => check.tone === "warning").length;
  const score = actionable.length ? Math.round((passed / actionable.length) * 100) : 100;
  const scoreTone = score >= 90 ? "text-emerald-700" : score >= 70 ? "text-amber-700" : "text-red-700";

  return (
    <aside className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-indigo-100 bg-white text-indigo-700">
            <Gauge className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-sm font-black text-slate-950">发布前质量检查</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">用于检查 SEO、内容完整度、链接格式和案例证据，不会阻止保存。</p>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-right">
          <p className={`text-xl font-black ${scoreTone}`}>{score}</p>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{warnings ? `${warnings} 项待优化` : "Ready"}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {checks.map((check) => (
          <div key={`${check.label}-${check.detail}`} className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3">
            <QualityIcon tone={check.tone} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">{check.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

function QualityIcon({ tone }: { tone: QualityTone }) {
  if (tone === "success") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />;
  if (tone === "warning") return <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />;
  return <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />;
}

function FieldInput({
  field,
  value,
  onChange
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const base =
    "w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

  if (field.type === "markdown") {
    return <MarkdownEditor value={String(value || "")} onChange={onChange} />;
  }

  if (field.type === "textarea") {
    return (
      <textarea
        value={String(value || "")}
        onChange={(event) => onChange(event.target.value)}
        className={`${base} min-h-28 py-3`}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex h-11 items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 rounded border-slate-300" />
        启用
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <select value={String(value || "")} onChange={(event) => onChange(event.target.value)} className={`${base} h-11`}>
        {field.options?.map((option) => (
          <option key={option} value={option}>{displayOption(option)}</option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : field.type === "url" ? "url" : "text"}
      value={String(value || "")}
      onChange={(event) => onChange(event.target.value)}
      className={`${base} h-11`}
      placeholder={field.type === "tags" ? "用英文逗号分隔多个值" : undefined}
    />
  );
}

export function adminTextColumn(key: string, label: string): Column<Item> {
  return { key, label, sortable: true };
}

export function adminStatusColumn(key: string, label: string): Column<Item> {
  return {
    key,
    label,
    render: (item) => {
      const value = String(item[key]);
      return <StatusBadge label={displayOption(value)} tone={value === "PUBLISHED" || value === "true" ? "success" : "warning"} />;
    }
  };
}
