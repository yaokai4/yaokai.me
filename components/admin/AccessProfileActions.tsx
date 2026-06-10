"use client";

import { Copy, Download, Link2, Pause, Play, QrCode, RefreshCw, RotateCw, ShieldX } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

export function AccessProfileActions({ profileId, status }: { profileId: string; status?: string }) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState("");
  const [shadowrocketUrl, setShadowrocketUrl] = React.useState("");
  const [qrDataUrl, setQrDataUrl] = React.useState("");

  async function post(action: string, label: string) {
    setLoading(action);
    const response = await fetch(`/api/admin/vps/access-profiles/${profileId}/${action}`, { method: "POST" });
    const json = await response.json();
    setLoading(null);
    if (!json.success) {
      toast({ title: `${label}失败`, description: json.error?.message || "请稍后再试。", type: "error" });
      return null;
    }
    toast({ title: `${label}成功`, type: "success" });
    return json.data;
  }

  async function generate() {
    await post("generate", "生成配置");
  }

  async function rotate() {
    const data = await post("rotate", "重新生成");
    if (data) {
      setDownloadUrl("");
      setShadowrocketUrl("");
      setQrDataUrl("");
    }
  }

  async function pause() {
    await post("pause", "暂停");
  }

  async function activate() {
    await post("activate", "启用");
  }

  async function revoke() {
    if (!window.confirm("吊销后，该设备将无法继续使用此访问配置连接内部服务。此操作会写入审计日志。")) return;
    const data = await post("revoke", "吊销");
    if (data) {
      setDownloadUrl("");
      setShadowrocketUrl("");
      setQrDataUrl("");
    }
  }

  async function createToken() {
    const data = await post("download-token", "生成一次性下载链接");
    if (!data?.downloadUrl) return "";
    const url = `${window.location.origin}${data.downloadUrl}`;
    setDownloadUrl(url);
    return url;
  }

  async function readConfig() {
    const url = downloadUrl || await createToken();
    if (!url) return "";
    const response = await fetch(url);
    if (!response.ok) {
      toast({ title: "读取配置失败", description: "链接可能已使用、过期或配置已失效。", type: "error" });
      return "";
    }
    setDownloadUrl("");
    return response.text();
  }

  async function showQr() {
    const config = await readConfig();
    if (!config) return;
    setLoading("qr");
    const QRCode = await import("qrcode");
    setQrDataUrl(await QRCode.toDataURL(config, { margin: 1, width: 220 }));
    setLoading(null);
  }

  async function copyDownloadUrl() {
    const url = downloadUrl || await createToken();
    if (!url) return;
    await navigator.clipboard.writeText(url);
    toast({ title: "下载链接已复制", description: "链接短期有效且只能使用一次。", type: "success" });
  }

  async function copyConfig() {
    const config = await readConfig();
    if (!config) return;
    await navigator.clipboard.writeText(config);
    setQrDataUrl("");
    toast({ title: "配置已复制", description: "配置包含敏感凭据，请只放在本人设备。", type: "success" });
  }

  async function createShadowrocketUrl() {
    const data = await post("shadowrocket-token", "生成 Shadowrocket 私有导入链接");
    if (!data?.importUrl) return;
    setShadowrocketUrl(`${window.location.origin}${data.importUrl}`);
  }

  async function copyShadowrocketUrl() {
    if (!shadowrocketUrl) return;
    await navigator.clipboard.writeText(shadowrocketUrl);
    toast({ title: "私有导入链接已复制", description: "链接 10 分钟内有效，成功读取一次后立即失效。", type: "success" });
  }

  const disabled = Boolean(loading) || status === "revoked" || status === "expired";

  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">访问配置操作</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">配置文件包含敏感访问凭据。请只在本人设备上导入，不要转发、截图或公开分享。</p>
        </div>
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Button variant="secondary" onClick={generate} disabled={Boolean(loading)} className="w-full whitespace-nowrap">
          <RefreshCw className="h-4 w-4" />
          生成配置
        </Button>
        <Button variant="secondary" onClick={showQr} disabled={disabled} className="w-full whitespace-nowrap">
          <QrCode className="h-4 w-4" />
          查看二维码
        </Button>
        <Button variant="secondary" onClick={createToken} disabled={disabled} className="w-full whitespace-nowrap">
          <Download className="h-4 w-4" />
          生成一次性下载链接
        </Button>
        <Button variant="secondary" onClick={copyConfig} disabled={disabled} className="w-full whitespace-nowrap">
          <Copy className="h-4 w-4" />
          复制配置
        </Button>
        <Button variant="secondary" onClick={createShadowrocketUrl} disabled={disabled} className="w-full whitespace-normal leading-5">
          <Link2 className="h-4 w-4" />
          Shadowrocket 私有导入链接
        </Button>
        <Button variant="secondary" onClick={rotate} disabled={disabled} className="w-full whitespace-nowrap">
          <RotateCw className="h-4 w-4" />
          重新生成
        </Button>
        <Button variant="secondary" onClick={pause} disabled={Boolean(loading) || status === "paused" || status === "revoked"} className="w-full whitespace-nowrap">
          <Pause className="h-4 w-4" />
          暂停
        </Button>
        <Button variant="secondary" onClick={activate} disabled={Boolean(loading) || status === "active" || status === "revoked"} className="w-full whitespace-nowrap">
          <Play className="h-4 w-4" />
          启用
        </Button>
        <Button variant="danger" onClick={revoke} disabled={Boolean(loading) || status === "revoked"} className="w-full whitespace-nowrap">
          <ShieldX className="h-4 w-4" />
          吊销
        </Button>
      </div>
      {downloadUrl ? (
        <div className="mt-5 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-950">一次性下载链接</p>
          <p className="mt-1 text-sm text-slate-600">这是一次性的配置文件下载链接，不是服务器 Endpoint 地址；10 分钟内仅可使用一次。</p>
          <p className="mt-2 break-all text-sm text-slate-600">{downloadUrl}</p>
          <div className="mt-3 grid gap-2 sm:flex sm:flex-wrap">
            <a href={downloadUrl} className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">
              下载配置
            </a>
            <button type="button" onClick={copyDownloadUrl} className="inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-50">
              复制链接
            </button>
          </div>
        </div>
      ) : null}
      {shadowrocketUrl ? (
        <div className="mt-5 rounded-md border border-indigo-100 bg-indigo-50/55 p-4">
          <p className="text-sm font-semibold text-slate-950">Shadowrocket 私有导入链接</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">链接 10 分钟内仅可成功读取一次。导入时在 Shadowrocket 中选择 Subscribe 并粘贴此链接。</p>
          <p className="mt-2 break-all text-sm text-indigo-800">{shadowrocketUrl}</p>
          <Button variant="secondary" onClick={copyShadowrocketUrl} className="mt-3 whitespace-nowrap">
            <Copy className="h-4 w-4" />
            复制链接
          </Button>
        </div>
      ) : null}
      {qrDataUrl ? (
        <div className="mt-5 inline-block rounded-md border border-slate-200 bg-white p-3">
          <Image src={qrDataUrl} alt="安全接入配置二维码" width={220} height={220} unoptimized />
        </div>
      ) : null}
    </section>
  );
}
