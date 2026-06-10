"use client";

import { Save, ShieldCheck } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

type EndpointSettings = {
  publicHost?: string | null;
  publicIp?: string | null;
  region?: string | null;
  listenPort?: number | null;
  dns?: string | null;
  mtu?: number | null;
  allowedIpTemplate?: string | null;
  clientAllowedIps?: string | null;
};

type Plan = {
  warning: string;
  commands: string[];
};

export function EndpointSettingsForm({
  endpoint,
  initializationPlan
}: {
  endpoint: EndpointSettings | null;
  initializationPlan: Plan;
}) {
  const { toast } = useToast();
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    publicHost: endpoint?.publicHost || "",
    publicIp: endpoint?.publicIp || "",
    region: endpoint?.region || "",
    listenPort: endpoint?.listenPort || 51820,
    dns: endpoint?.dns || "1.1.1.1",
    mtu: endpoint?.mtu || "",
    allowedIpTemplate: endpoint?.allowedIpTemplate || "10.66.0.0/24",
    clientAllowedIps: endpoint?.clientAllowedIps || "0.0.0.0/0"
  });

  async function save() {
    setSaving(true);
    const response = await fetch("/api/admin/vps/endpoint/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await response.json();
    setSaving(false);
    if (!json.success) {
      toast({ title: "保存失败", description: json.error?.message || "请检查设置。", type: "error" });
      return;
    }
    toast({ title: "设置已保存", description: "Endpoint 已重新检测。", type: "success" });
  }

  function update(key: keyof typeof form, value: string | number) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Endpoint 入口设置</h2>
            <p className="mt-1 text-sm text-slate-500">当系统无法自动识别公网入口时，在这里设置域名或 IP。</p>
          </div>
          <Button onClick={save} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "保存中..." : "保存并检测"}
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="公网域名">
            <input value={form.publicHost} onChange={(event) => update("publicHost", event.target.value)} className={inputClass} placeholder="access.example.com" />
          </Field>
          <Field label="公网 IP">
            <input value={form.publicIp} onChange={(event) => update("publicIp", event.target.value)} className={inputClass} placeholder="203.0.113.10" />
          </Field>
          <Field label="区域">
            <input value={form.region} onChange={(event) => update("region", event.target.value)} className={inputClass} placeholder="Tokyo" />
          </Field>
          <Field label="监听端口">
            <input type="number" value={form.listenPort} onChange={(event) => update("listenPort", Number(event.target.value))} className={inputClass} />
          </Field>
          <Field label="DNS">
            <input value={form.dns} onChange={(event) => update("dns", event.target.value)} className={inputClass} />
          </Field>
          <Field label="MTU">
            <input value={form.mtu} onChange={(event) => update("mtu", event.target.value)} className={inputClass} placeholder="可选" />
          </Field>
          <Field label="允许地址模板">
            <input value={form.allowedIpTemplate} onChange={(event) => update("allowedIpTemplate", event.target.value)} className={inputClass} />
          </Field>
          <Field label="设备路由范围">
            <input value={form.clientAllowedIps} onChange={(event) => update("clientAllowedIps", event.target.value)} className={inputClass} />
          </Field>
        </div>
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5 text-slate-700 shadow-sm">
        <div className="flex gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-700" />
          <div>
            <h2 className="text-base font-semibold text-slate-950">安全初始化说明</h2>
            <p className="mt-2 text-sm leading-6">{initializationPlan.warning}</p>
            <pre className="mt-4 overflow-x-auto rounded-md bg-slate-950 p-4 text-xs leading-6 text-slate-50">
              {initializationPlan.commands.join("\n")}
            </pre>
          </div>
        </div>
      </section>
    </div>
  );
}

const inputClass = "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
