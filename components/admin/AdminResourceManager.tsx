"use client";

import { Edit, Plus, Save, Trash2, X } from "lucide-react";
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
      type={field.type === "number" ? "number" : field.type === "datetime" ? "datetime-local" : "text"}
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
