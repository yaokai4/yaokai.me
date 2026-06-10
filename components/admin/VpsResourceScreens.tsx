"use client";

import { Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AdminResourceManager, type FieldConfig } from "@/components/admin/AdminResourceManager";
import { DataTable } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";
import type { VpsResourceConfig } from "@/lib/vps-config";

type Item = Record<string, unknown> & { id: string };

function fieldLabel(config: VpsResourceConfig, key: string) {
  return config.fields.find((field) => field.name === key)?.label || key;
}

function tone(value: unknown): "default" | "success" | "warning" | "danger" {
  const text = String(value);
  if (["operational", "active", "success", "resolved", "true"].includes(text)) return "success";
  if (["warning", "degraded", "partial_outage", "maintenance", "acknowledged", "running"].includes(text)) return "warning";
  if (["offline", "major_outage", "critical", "emergency", "failed", "false", "disabled", "retired"].includes(text)) return "danger";
  return "default";
}

function renderValue(value: unknown, key?: string) {
  if (value === null || value === undefined || value === "") return <span className="text-slate-400">未设置</span>;
  if (typeof value === "boolean") return <StatusBadge label={value ? "是" : "否"} tone={value ? "success" : "warning"} />;
  if (Array.isArray(value)) return value.length ? <span>{value.join(", ")}</span> : <span className="text-slate-400">未设置</span>;
  if (key?.endsWith("At") || key?.endsWith("Exp")) return <span>{formatDate(String(value))}</span>;
  if (["status", "publicStatus", "internalStatus", "level", "lastStatus", "enabled", "encrypted", "mfaEnabled", "autoRenew"].includes(String(key))) {
    return <StatusBadge label={String(value)} tone={tone(value)} />;
  }
  return <span className="line-clamp-2">{String(value)}</span>;
}

function toInputValue(value: unknown, field?: FieldConfig) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value;
  if (!value) return "";
  if (field?.type === "datetime") return new Date(String(value)).toISOString().slice(0, 16);
  return String(value);
}

function buildEmpty(fields: FieldConfig[]) {
  return Object.fromEntries(
    fields.map((field) => [
      field.name,
      field.type === "checkbox" ? false : field.type === "number" ? 0 : field.type === "select" ? field.options?.[0] || "" : ""
    ])
  );
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
      payload[field.name] = value === "" || value === null || value === undefined ? null : Number(value);
    } else if (field.type === "datetime") {
      payload[field.name] = value ? String(value) : null;
    } else {
      payload[field.name] = value === "" ? null : value;
    }
  }
  return payload;
}

export function VpsSectionManager({ config, items }: { config: VpsResourceConfig; items: Item[] }) {
  const fields = config.fields as FieldConfig[];
  const columns = config.columns.map((key, index) => ({
    key,
    label: fieldLabel(config, key),
    sortable: true,
    render: (item: Item) => (
      index === 0 ? (
        <Link href={`/admin/vps/${config.key}/${item.id}`} className="font-semibold text-slate-950 hover:text-indigo-700">
          {renderValue(item[key], key)}
        </Link>
      ) : renderValue(item[key], key)
    )
  }));

  if (config.readOnly) {
    return (
      <div className="grid gap-4">
        <div className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:flex sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">审计日志为只读资源，可筛选查看并导出 CSV。</p>
          <Link href="/api/admin/vps/audit-logs/export" className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            导出 CSV
          </Link>
        </div>
        <DataTable data={items} columns={columns} />
      </div>
    );
  }

  return (
    <AdminResourceManager
      title={config.singular}
      endpoint={config.endpoint}
      fields={fields}
      initialItems={items}
      columns={columns}
    />
  );
}

export function VpsRecordEditor({
  config,
  initialItem
}: {
  config: VpsResourceConfig;
  initialItem?: Item | null;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const fields = config.fields as FieldConfig[];
  const [form, setForm] = React.useState<Record<string, unknown>>(() =>
    initialItem ? Object.fromEntries(fields.map((field) => [field.name, toInputValue(initialItem[field.name], field)])) : buildEmpty(fields)
  );
  const [saving, setSaving] = React.useState(false);

  async function save() {
    setSaving(true);
    const response = await fetch(initialItem ? `${config.endpoint}/${initialItem.id}` : config.endpoint, {
      method: initialItem ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizePayload(form, fields))
    });
    const json = await response.json();
    setSaving(false);

    if (!json.success) {
      toast({ title: "保存失败", description: json.error?.message || "请检查表单。", type: "error" });
      return;
    }

    toast({ title: "保存成功", description: `${config.singular} 已更新。`, type: "success" });
    const id = json.data?.id || initialItem?.id;
    router.push(id ? `/admin/vps/${config.key}/${id}` : `/admin/vps/${config.key}`);
    router.refresh();
  }

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{initialItem ? `编辑${config.singular}` : `新建${config.singular}`}</h2>
          <p className="mt-1 text-sm text-slate-500">{config.description}</p>
        </div>
        <Button onClick={save} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "保存中..." : "保存"}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className={field.full ? "grid gap-2 md:col-span-2" : "grid gap-2"}>
            <span className="text-sm font-medium text-slate-700">
              {field.label}
              {field.required ? <span className="text-red-500"> *</span> : null}
            </span>
            <RecordFieldInput field={field} value={form[field.name]} onChange={(value) => setForm((current) => ({ ...current, [field.name]: value }))} />
          </label>
        ))}
      </div>
    </section>
  );
}

function RecordFieldInput({
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

  if (field.type === "textarea") {
    return <textarea value={String(value || "")} onChange={(event) => onChange(event.target.value)} className={`${base} min-h-28 py-3`} />;
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
          <option key={option} value={option}>{option}</option>
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

export function VpsRecordSummary({ config, item }: { config: VpsResourceConfig; item: Item }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 grid gap-3 sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">记录详情</h2>
          <p className="mt-1 text-sm text-slate-500">只展示后台安全字段，敏感 secret 不应写入这些表单。</p>
        </div>
        <Link href={`/admin/vps/${config.key}`} className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          返回列表
        </Link>
      </div>
      <dl className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {config.fields.map((field) => (
          <div key={field.name} className="rounded-md border border-slate-100 bg-slate-50 p-3">
            <dt className="text-xs font-semibold text-slate-500">{field.label}</dt>
            <dd className="mt-2 text-sm text-slate-800">{renderValue(item[field.name], field.name)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
