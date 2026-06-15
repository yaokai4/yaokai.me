"use client";

import { Activity, CirclePause, CirclePlay, Clipboard, Download, Globe2, KeyRound, Link2, QrCode, RefreshCw, RotateCw, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getSecureAccessReadiness } from "@/lib/secure-access-readiness";
import { formatDate } from "@/lib/utils";

type EndpointView = {
  id: string;
  name: string;
  hostname: string;
  publicHost?: string | null;
  publicIp?: string | null;
  status: string;
  serviceStatus?: string | null;
  wireGuardInstalled?: boolean;
  dryRun?: boolean | null;
  allowSystemApply?: boolean | null;
  serviceConfigReady?: boolean | null;
  serviceApplied?: boolean | null;
  serviceRunning?: boolean | null;
  wireGuardQuickInstalled?: boolean | null;
  wgInterfacePresent?: boolean | null;
  portListening?: boolean | null;
  ipForwardingEnabled?: boolean | null;
  publicHostResolved?: boolean | null;
  publicHostResolvedIp?: string | null;
  systemApplyError?: string | null;
  serverPublicKey?: string | null;
  listenPort?: number;
  lastHealthCheckAt?: string | Date | null;
};

type DownloadView = {
  id: string;
  requestedBy: string;
  expiresAt: string | Date;
  usedAt?: string | Date | null;
  createdAt: string | Date;
};

type ProfileView = {
  id: string;
  name: string;
  deviceName: string;
  deviceType?: string | null;
  status: string;
  configType?: string;
  publicKey?: string | null;
  assignedAddress?: string | null;
  serverPeerStatus?: string | null;
  serverAppliedAt?: string | Date | null;
  peerApplied?: boolean | null;
  serviceReloadedAfterPeer?: boolean | null;
  serverSyncError?: string | null;
  configText?: string;
  expiresAt: string | Date;
  lastUsedAt?: string | Date | null;
  lastDownloadedAt?: string | Date | null;
  downloads?: DownloadView[];
};

type AuditLogView = {
  id: string;
  action: string;
  result: string;
  createdAt: string | Date;
  actorEmail?: string | null;
};

type RuntimeStatusView = {
  available: boolean;
  interfaceName: string;
  checkedAt: string;
  status: string;
  hasRuntimePeer: boolean;
  latestHandshakeAt?: string | null;
  latestHandshakeAgeSeconds?: number | null;
  transferRxBytes: number;
  transferTxBytes: number;
  transferTotalBytes: number;
  hasTransfer: boolean;
  hasRemoteEndpoint: boolean;
  detail?: string;
};

type HandshakeVerificationView = {
  passed: boolean;
  timedOut: boolean;
  timeoutSeconds: number;
  transferDeltaBytes: number;
  baselineStatus: RuntimeStatusView;
  runtimeStatus: RuntimeStatusView;
};

type EgressVerificationView = {
  passed: boolean;
  expectedIp: string | null;
  observedIp: string;
  provider: string;
  checkedAt: string;
  message: string;
};

function tone(status?: string | null): "default" | "success" | "warning" | "danger" {
  if (!status) return "default";
  if (["active", "success", "ready", "installed", "applied", "connected", "seen"].includes(status)) return "success";
  if (["needs_initialization", "paused", "expired", "degraded", "unknown", "pending", "not_applicable", "waiting_handshake", "not_applied"].includes(status)) return "warning";
  if (["revoked", "offline", "failed", "unavailable"].includes(status)) return "danger";
  return "default";
}

function statusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    active: "已启用",
    needs_initialization: "需要初始化",
    degraded: "需检查",
    offline: "不可用",
    paused: "已暂停",
    expired: "已过期",
    revoked: "已吊销",
    installed: "已安装",
    unknown: "未知",
    pending: "等待应用",
    applied: "已应用",
    failed: "应用失败",
    not_applicable: "不适用"
  };
  return labels[String(status)] || String(status || "未知");
}

async function qrData(value: string) {
  const QRCode = await import("qrcode");
  return QRCode.toDataURL(value, { margin: 1, width: 240 });
}

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size >= 10 || unit === 0 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function formatAge(seconds?: number | null) {
  if (seconds === null || seconds === undefined) return "";
  if (seconds < 5) return "刚刚";
  if (seconds < 60) return `${seconds} 秒前`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟前`;
  return `${Math.floor(seconds / 3600)} 小时前`;
}

async function fetchClientEgressIp() {
  const providers = [
    {
      name: "api.ipify.org",
      url: "https://api.ipify.org?format=json",
      parse: async (response: Response) => String((await response.json()).ip || "")
    },
    {
      name: "api64.ipify.org",
      url: "https://api64.ipify.org?format=json",
      parse: async (response: Response) => String((await response.json()).ip || "")
    },
    {
      name: "ipinfo.io",
      url: "https://ipinfo.io/json",
      parse: async (response: Response) => String((await response.json()).ip || "")
    },
    {
      name: "icanhazip.com",
      url: "https://icanhazip.com",
      parse: async (response: Response) => (await response.text()).trim()
    }
  ];

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, { cache: "no-store" });
      if (!response.ok) continue;
      const ip = (await provider.parse(response)).trim();
      if (ip) return { ip, provider: provider.name };
    } catch {
      // Try the next public IP endpoint.
    }
  }

  throw new Error("EGRESS_IP_UNAVAILABLE");
}

export function SecureAccessConsole({
  initialEndpoint,
  initialProfile,
  recentAuditLogs = [],
  showEndpointActions = false,
  showQrInitially = false
}: {
  initialEndpoint: EndpointView | null;
  initialProfile: ProfileView | null;
  recentAuditLogs?: AuditLogView[];
  showEndpointActions?: boolean;
  showQrInitially?: boolean;
}) {
  const { toast } = useToast();
  const [endpoint, setEndpoint] = React.useState(initialEndpoint);
  const [profile, setProfile] = React.useState(initialProfile);
  const [loading, setLoading] = React.useState<string | null>(null);
  const [qr, setQr] = React.useState("");
  const [downloadUrl, setDownloadUrl] = React.useState("");
  const [shadowrocketUrl, setShadowrocketUrl] = React.useState("");
  const [runtimeStatus, setRuntimeStatus] = React.useState<RuntimeStatusView | null>(null);
  const [previousRuntimeStatus, setPreviousRuntimeStatus] = React.useState<RuntimeStatusView | null>(null);
  const [handshakeVerification, setHandshakeVerification] = React.useState<HandshakeVerificationView | null>(null);
  const [egressVerification, setEgressVerification] = React.useState<EgressVerificationView | null>(null);

  const readiness = getSecureAccessReadiness(endpoint, profile);
  const importReady = readiness.usable;
  const configText = profile?.configText || "";
  const firstBlocker = readiness.reasons[0] || "当前状态不满足操作条件。";

  React.useEffect(() => {
    if (!showQrInitially || !configText || !readiness.canShowConfig) return;
    qrData(configText).then(setQr).catch(() => undefined);
  }, [configText, readiness.canShowConfig, showQrInitially]);

  React.useEffect(() => {
    if (!profile?.id) return;

    let active = true;
    fetch("/api/vps/access/my-profile/runtime-status", { cache: "no-store" })
      .then((response) => response.json())
      .then((json) => {
        if (!active || !json.success) return;
        setRuntimeStatus(json.data.runtimeStatus);
        if (json.data.profile?.lastUsedAt) {
          setProfile((current) => current && current.id === json.data.profile.id ? { ...current, lastUsedAt: json.data.profile.lastUsedAt } : current);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [profile?.id]);

  async function refreshProfile() {
    const response = await fetch("/api/vps/access/my-profile", { cache: "no-store" });
    const json = await response.json();
    if (json.success) setProfile(json.data.profile);
    return json.data?.profile as ProfileView | null;
  }

  async function postJson(path: string, label: string, body?: Record<string, unknown>) {
    try {
      setLoading(label);
      const response = await fetch(path, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined
      });
      const json = await response.json();
      if (!json.success) {
        toast({ title: `${label}失败`, description: json.error?.message || "请稍后再试。", type: "error" });
        return null;
      }
      toast({ title: `${label}成功`, type: "success" });
      return json.data;
    } finally {
      setLoading(null);
    }
  }

  async function checkRuntimeStatus() {
    if (!profile?.id) {
      toast({ title: "尚未生成访问配置", description: "请先生成 Access Profile，再检查连接状态。", type: "error" });
      return;
    }

    try {
      setLoading("检查连接握手");
      const response = await fetch("/api/vps/access/my-profile/runtime-status", { cache: "no-store" });
      const json = await response.json();
      if (!json.success) {
        toast({ title: "连接状态检查失败", description: json.error?.message || "请稍后再试。", type: "error" });
        return;
      }

      setPreviousRuntimeStatus(runtimeStatus);
      setRuntimeStatus(json.data.runtimeStatus);
      if (json.data.profile?.lastUsedAt) {
        setProfile((current) => current && current.id === json.data.profile.id ? { ...current, lastUsedAt: json.data.profile.lastUsedAt } : current);
      }
      toast({
        title: "连接状态已刷新",
        description: json.data.runtimeStatus?.latestHandshakeAt ? "服务端已经看到 latest handshake。" : "服务端尚未看到新的 handshake。",
        type: json.data.runtimeStatus?.latestHandshakeAt ? "success" : "info"
      });
    } finally {
      setLoading(null);
    }
  }

  async function waitForHandshake() {
    if (!profile?.id) {
      toast({ title: "尚未生成访问配置", description: "请先生成 Access Profile，再等待真实设备连接。", type: "error" });
      return;
    }

    try {
      setLoading("等待真实设备连接");
      setHandshakeVerification(null);
      const response = await fetch("/api/vps/access/my-profile/wait-for-handshake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timeoutSeconds: 60 })
      });
      const json = await response.json();
      if (!json.success) {
        toast({ title: "真实设备验证失败", description: json.error?.message || "请稍后再试。", type: "error" });
        return;
      }

      setPreviousRuntimeStatus(json.data.baselineStatus);
      setRuntimeStatus(json.data.runtimeStatus);
      setHandshakeVerification(json.data);
      if (json.data.profile?.lastUsedAt) {
        setProfile((current) => current && current.id === json.data.profile.id ? { ...current, lastUsedAt: json.data.profile.lastUsedAt } : current);
      }

      toast({
        title: json.data.passed ? "真实设备验证通过" : "真实设备验证未通过",
        description: json.data.passed ? "服务端已看到 handshake，并且 transfer 字节增长。" : "60 秒内没有看到新的 transfer 增长，请确认客户端已开启并访问网页。",
        type: json.data.passed ? "success" : "info"
      });
    } finally {
      setLoading(null);
    }
  }

  async function verifyEgressIp() {
    if (!profile?.id) {
      toast({ title: "尚未生成访问配置", description: "请先生成 Access Profile，再验证全隧道出口。", type: "error" });
      return;
    }
    if (!connectionVerified) {
      toast({ title: "隧道尚未连接", description: "请先完成 latest handshake 与真实流量验证，再检查全隧道出口。", type: "error" });
      return;
    }

    try {
      setLoading("验证全隧道出口");
      setEgressVerification(null);
      const observed = await fetchClientEgressIp();
      const response = await fetch("/api/vps/access/my-profile/egress-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ observedIp: observed.ip, provider: observed.provider })
      });
      const json = await response.json();
      if (!json.success) {
        toast({ title: "出口 IP 验证失败", description: json.error?.message || "请稍后再试。", type: "error" });
        return;
      }

      setEgressVerification(json.data);
      toast({
        title: json.data.passed ? "全隧道出口验证通过" : "全隧道出口不一致",
        description: json.data.message,
        type: json.data.passed ? "success" : "error"
      });
    } catch (error) {
      toast({
        title: "出口 IP 验证失败",
        description: error instanceof Error && error.message === "EGRESS_IP_UNAVAILABLE" ? "设备浏览器没有拿到公网出口 IP，请确认网络可访问公网 IP 检测服务。" : "请稍后再试。",
        type: "error"
      });
    } finally {
      setLoading(null);
    }
  }

  async function initializeEndpoint() {
    const data = await postJson("/api/admin/vps/endpoint/init", "初始化 Endpoint");
    if (data?.endpoint) setEndpoint(data.endpoint);
    await refreshProfile();
  }

  async function healthCheckEndpoint() {
    const data = await postJson("/api/admin/vps/endpoint/health-check", "检查 Endpoint");
    if (data?.endpoint) setEndpoint(data.endpoint);
    await refreshProfile();
  }

  async function generateProfile() {
    if (!readiness.canGenerateProfile) {
      toast({ title: "暂不能生成配置", description: firstBlocker, type: "error" });
      return;
    }
    const data = await postJson("/api/vps/access/my-profile/generate", "生成访问配置", {
      deviceName: window.navigator.platform || "Personal Device",
      deviceType: "client"
    });
    if (data?.profile) {
      setProfile(data.profile);
      setDownloadUrl("");
      setShadowrocketUrl("");
      setQr("");
      setRuntimeStatus(null);
      setPreviousRuntimeStatus(null);
      setHandshakeVerification(null);
      setEgressVerification(null);
    }
  }

  async function showQr() {
    if (!readiness.canShowConfig) {
      toast({ title: "暂不能显示二维码", description: firstBlocker, type: "error" });
      return;
    }
    const current = configText ? profile : await refreshProfile();
    if (!current?.configText) {
      toast({ title: "暂无可显示的配置", description: "请先生成 active 访问配置。", type: "error" });
      return;
    }
    setLoading("WireGuard 二维码");
    setQr(await qrData(current.configText));
    setLoading(null);
  }

  async function copyConfig() {
    if (!readiness.canShowConfig) {
      toast({ title: "暂不能复制配置", description: firstBlocker, type: "error" });
      return;
    }
    const current = configText ? profile : await refreshProfile();
    if (!current?.configText) {
      toast({ title: "暂无可复制的配置", description: "请先生成 active 访问配置。", type: "error" });
      return;
    }
    await navigator.clipboard.writeText(current.configText);
    toast({ title: "WireGuard 配置文本已复制", description: "请只导入到本人设备。", type: "success" });
  }

  async function createDownloadToken(openNow = false) {
    if (!readiness.canDownloadConfig) {
      toast({ title: "暂不能下载配置", description: firstBlocker, type: "error" });
      return;
    }
    const data = await postJson("/api/vps/access/my-profile/download-token", openNow ? "下载 WireGuard .conf" : "生成一次性配置下载链接");
    if (!data?.downloadUrl) return;
    const url = `${window.location.origin}${data.downloadUrl}`;
    setDownloadUrl(url);
    if (openNow) {
      const link = document.createElement("a");
      link.href = url;
      link.rel = "noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => refreshProfile(), 700);
    }
  }

  async function createShadowrocketImportUrl() {
    if (!readiness.canDownloadConfig) {
      toast({ title: "暂不能生成私有导入链接", description: firstBlocker, type: "error" });
      return;
    }
    const data = await postJson("/api/vps/access/my-profile/shadowrocket-token", "生成 Shadowrocket 私有导入链接");
    if (!data?.importUrl) return;
    setShadowrocketUrl(`${window.location.origin}${data.importUrl}`);
  }

  async function copyShadowrocketImportUrl() {
    if (!shadowrocketUrl) return;
    await navigator.clipboard.writeText(shadowrocketUrl);
    toast({ title: "私有导入链接已复制", description: "请删除旧节点后重新订阅，并选择新导入的 WireGuard 节点。链接 180 天内可读取一次。", type: "success" });
  }

  async function rotateProfile() {
    if (!readiness.canRotateProfile) {
      toast({ title: "暂不能重新生成", description: firstBlocker, type: "error" });
      return;
    }
    if (!window.confirm("重新生成后，旧设备配置将不再作为当前版本使用。")) return;
    const data = await postJson("/api/vps/access/my-profile/rotate", "重新生成配置");
    if (data?.profile) {
      setProfile(data.profile);
      setDownloadUrl("");
      setShadowrocketUrl("");
      setQr("");
      setRuntimeStatus(null);
      setPreviousRuntimeStatus(null);
      setHandshakeVerification(null);
      setEgressVerification(null);
    }
  }

  async function revokeProfile() {
    if (!window.confirm("吊销后，这份访问配置不能再下载或使用。")) return;
    const data = await postJson("/api/vps/access/my-profile/revoke", "吊销配置");
    setProfile(data?.profile || null);
    setDownloadUrl("");
    setShadowrocketUrl("");
    setQr("");
    setRuntimeStatus(null);
    setPreviousRuntimeStatus(null);
    setHandshakeVerification(null);
    setEgressVerification(null);
  }

  async function pauseProfile() {
    if (!profile || !readiness.canPauseProfile) return;
    const data = await postJson("/api/vps/access/my-profile/pause", "暂停配置");
    if (data?.profile) {
      setProfile(data.profile);
      setShadowrocketUrl("");
      setRuntimeStatus(null);
      setPreviousRuntimeStatus(null);
      setHandshakeVerification(null);
      setEgressVerification(null);
    }
  }

  async function activateProfile() {
    if (!profile || !readiness.canActivateProfile) return;
    const data = await postJson("/api/vps/access/my-profile/activate", "启用配置");
    if (data?.profile) {
      setProfile(data.profile);
      setShadowrocketUrl("");
      setRuntimeStatus(null);
      setPreviousRuntimeStatus(null);
      setHandshakeVerification(null);
      setEgressVerification(null);
    }
  }

  const configActionDisabled = Boolean(loading) || !readiness.canShowConfig;
  const generateDisabled = Boolean(loading) || !readiness.canGenerateProfile;
  const rotateDisabled = Boolean(loading) || !readiness.canRotateProfile;
  const runtimeTransferDelta = runtimeStatus && previousRuntimeStatus && runtimeStatus.transferTotalBytes >= previousRuntimeStatus.transferTotalBytes
    ? runtimeStatus.transferTotalBytes - previousRuntimeStatus.transferTotalBytes
    : null;
  const expectedExitIp = endpoint?.publicHostResolvedIp || endpoint?.publicIp || endpoint?.publicHost || "未确认";
  const connectionVerified = Boolean(
    runtimeStatus?.available &&
    runtimeStatus.hasRuntimePeer &&
    runtimeStatus.latestHandshakeAt &&
    runtimeStatus.hasTransfer &&
    runtimeStatus.hasRemoteEndpoint
  );
  const hasTunnelTraffic = Boolean(runtimeStatus?.latestHandshakeAt && runtimeStatus.hasTransfer);
  const connectionReason = !importReady
    ? null
    : !runtimeStatus
      ? "配置可以导入，但尚未执行真实连接检查，不能判定网络可用。"
      : !runtimeStatus.latestHandshakeAt
        ? runtimeStatus.hasTransfer
          ? "服务端已收到握手请求并发出响应，但客户端没有完成握手。请删除 Shadowrocket 中的旧节点，使用新链接重新订阅并选择新节点。"
          : `服务端尚未收到任何 handshake。请优先确认 AWS/Lightsail 防火墙允许 UDP ${endpoint?.listenPort || 51820} 入站，并重新导入当前配置。`
        : !runtimeStatus.hasTransfer
          ? "服务端已看到 handshake，但尚未看到 transfer 字节，请在客户端打开网页产生流量后重新检查。"
          : !runtimeStatus.hasRemoteEndpoint
            ? "服务端尚未记录客户端远端地址，真实连接仍未完成。"
            : null;
  const displayedReasons = [...readiness.reasons, ...(connectionReason ? [connectionReason] : [])];
  const displayedNextSteps = [
    ...readiness.nextSteps,
    ...(importReady && !connectionVerified
      ? [
          `确认云防火墙已放行 UDP ${endpoint?.listenPort || 51820}，删除客户端旧配置后重新扫描当前二维码。`,
          "开启 WireGuard 后访问任意网页，再点击“检查连接握手”；只有 handshake 与 transfer 同时出现才算可用。"
        ]
      : [])
  ];

  return (
    <div className="grid gap-6">
      <section className="rounded-md border border-indigo-100 bg-white p-5 text-slate-700 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-700">Secure Access Device Profile</p>
        <h2 className="mt-2 text-xl font-semibold">WireGuard 配置与 Shadowrocket 私有导入</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7">
          当前设备配置使用 WireGuard 协议。可以用 WireGuard 客户端扫描二维码或导入 `.conf`，也可以生成一次性的 Shadowrocket 私有导入链接。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatusPanel
          icon={ShieldCheck}
          label="Endpoint 状态"
          title={endpoint ? statusLabel(endpoint.status) : "尚未初始化"}
          badge={endpoint ? statusLabel(endpoint.status) : "未初始化"}
          tone={tone(endpoint?.status)}
          meta={endpoint ? `${endpoint.publicHost || endpoint.publicIp || "未设置公网入口"}:${endpoint.listenPort || 51820}` : "需要创建 Endpoint"}
        />
        <StatusPanel
          icon={ShieldCheck}
          label="WireGuard 服务状态"
          title={endpoint?.serviceRunning ? "active" : statusLabel(endpoint?.serviceStatus || "unknown")}
          badge={endpoint?.serviceRunning ? "active" : statusLabel(endpoint?.serviceStatus || "unknown")}
          tone={endpoint?.serviceRunning ? "success" : "warning"}
          meta={`wg=${endpoint?.wireGuardInstalled ? "yes" : "no"} / wg-quick=${endpoint?.wireGuardQuickInstalled ? "yes" : "no"} / wg0=${endpoint?.wgInterfacePresent ? "yes" : "no"}`}
        />
        <StatusPanel
          icon={KeyRound}
          label="Peer 状态"
          title={profile ? statusLabel(profile.serverPeerStatus || "pending") : "尚未生成"}
          badge={profile?.peerApplied ? "applied" : statusLabel(profile?.serverPeerStatus || "pending")}
          tone={profile?.peerApplied ? "success" : "warning"}
          meta={profile?.assignedAddress || "尚未分配设备地址"}
        />
        <StatusPanel
          icon={KeyRound}
          label="Profile 状态"
          title={profile ? statusLabel(profile.status) : "尚未生成访问配置"}
          badge={profile ? statusLabel(profile.status) : "未生成"}
          tone={tone(profile?.status)}
          meta={profile?.expiresAt ? `过期时间 ${formatDate(profile.expiresAt)}` : "默认有效期 180 天"}
        />
        <StatusPanel
          icon={ShieldAlert}
          label="配置导入状态"
          title={importReady ? "可以导入" : "暂不可导入"}
          badge={importReady ? "import-ready" : "blocked"}
          tone={importReady ? "success" : "warning"}
          meta={importReady ? "仅表示配置完整，不代表真实网络已经连通" : "下方列出阻断原因"}
        />
        <StatusPanel
          icon={connectionVerified ? ShieldCheck : ShieldAlert}
          label="真实连接状态"
          title={connectionVerified ? "已验证可用" : importReady ? "尚未验证可用" : "等待配置就绪"}
          badge={connectionVerified ? "handshake + transfer" : "unverified"}
          tone={connectionVerified ? "success" : "warning"}
          meta={connectionVerified ? "服务端已看到 handshake、远端地址和 transfer 字节" : "未通过真实连接验收时，不显示为可用"}
        />
      </section>

      <section className={`rounded-md border p-5 text-sm leading-7 ${connectionVerified ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-700 shadow-sm"}`}>
        <p className="font-semibold">{connectionVerified ? "已通过真实连接验收" : importReady ? "配置已生成，但尚未验证网络可用" : "暂不可导入"}</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">当前状态</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {(displayedReasons.length ? displayedReasons : ["服务端已看到有效 handshake、客户端远端地址和 transfer 字节。"]).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] opacity-70">下一步</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {(displayedNextSteps.length ? displayedNextSteps : ["继续保持 WireGuard 连接，并用出口 IP 验证确认流量经过当前东京 VPS。"]).map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">导入说明</h2>
          <div className="mt-4 grid gap-3 text-sm leading-7 text-slate-600">
            <p><span className="font-semibold text-slate-950">WireGuard 客户端：</span>使用二维码 / .conf 导入。</p>
            <p><span className="font-semibold text-slate-950">Shadowrocket：</span>删除旧节点，生成新的私有导入链接，在右上角 `+` 中选择 Subscribe 后粘贴链接，并选择新导入的 WireGuard 节点。</p>
            <p><span className="font-semibold text-slate-950">链接安全：</span>链接 180 天内有效，成功读取一次后立即失效，不能用于后续刷新。</p>
            <p className="rounded-md border border-indigo-100 bg-indigo-50/55 p-3 text-slate-700">
              Shadowrocket 导入的是当前账号的 WireGuard Device Profile。重新生成、暂停、过期或吊销后，旧配置不能继续下载或接入。
            </p>
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">导入失败常见原因</h2>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-600">
            <li>把 WireGuard `.conf` 下载地址直接填入 Shadowrocket，或仍在使用旧格式节点。请删除旧节点并使用新生成的 Shadowrocket 私有导入链接。</li>
            <li>私有导入链接已读取、已超过 180 天，或对应 Access Profile 已暂停、过期或吊销。</li>
            <li>Endpoint 未初始化，当前服务器还没有真正启动 WireGuard 服务。</li>
            <li>publicHost 不正确，配置中的 Endpoint 必须是公网可访问域名或 IP。</li>
            <li>UDP 端口未开放，服务器和云厂商安全组需要允许 UDP listenPort。</li>
            <li>peer 未应用，客户端配置生成后，服务端也必须写入对应 peer。</li>
            <li>dry-run 模式只生成预览，不能真实连接。</li>
          </ol>
        </div>
      </section>

      {showEndpointActions ? (
        <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Endpoint 初始化</h2>
              <p className="mt-1 text-sm text-slate-500">只执行安全检测和数据库初始化；系统级安装、写入和重载命令需要人工确认。</p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
              <Button variant="secondary" onClick={healthCheckEndpoint} disabled={Boolean(loading)} className="w-full whitespace-nowrap">
                <RefreshCw className="h-4 w-4" />
                检查
              </Button>
              <Button onClick={initializeEndpoint} disabled={Boolean(loading)} className="w-full whitespace-nowrap">
                <ShieldCheck className="h-4 w-4" />
                初始化
              </Button>
            </div>
          </div>
          {endpoint?.wireGuardInstalled === false ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
              需要初始化：当前环境未检测到 WireGuard 工具。请在服务器确认安装策略后，再根据设置页中的 dry-run 命令完成系统级初始化。
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">私有访问配置</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">配置只绑定当前登录账号、当前设备和当前 Endpoint。请勿转发或公开分享。</p>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-2 xl:grid-cols-4">
            {!profile ? (
              <Button onClick={generateProfile} disabled={generateDisabled} size="lg" className="col-span-2 w-full whitespace-normal leading-5 xl:col-span-2">
                <KeyRound className="h-4 w-4" />
                生成我的访问配置
              </Button>
            ) : (
              <>
                {readiness.canShowConfig ? (
                  <>
                    <Button variant="secondary" onClick={showQr} disabled={configActionDisabled} className="w-full whitespace-normal leading-5">
                      <QrCode className="h-4 w-4" />
                      显示 WireGuard 二维码
                    </Button>
                    <Button variant="secondary" onClick={copyConfig} disabled={configActionDisabled} className="w-full whitespace-normal leading-5">
                      <Clipboard className="h-4 w-4" />
                      复制 WireGuard 配置文本
                    </Button>
                    <Button variant="secondary" onClick={() => createDownloadToken(true)} disabled={Boolean(loading) || !readiness.canDownloadConfig} className="w-full whitespace-normal leading-5">
                      <Download className="h-4 w-4" />
                      下载 WireGuard .conf
                    </Button>
                    <Button variant="secondary" onClick={() => createDownloadToken(false)} disabled={Boolean(loading) || !readiness.canDownloadConfig} className="w-full whitespace-normal leading-5">
                      <Download className="h-4 w-4" />
                      生成一次性配置下载链接
                    </Button>
                    <Button variant="secondary" onClick={createShadowrocketImportUrl} disabled={Boolean(loading) || !readiness.canDownloadConfig} className="w-full whitespace-normal leading-5">
                      <Link2 className="h-4 w-4" />
                      生成 Shadowrocket 私有导入链接
                    </Button>
                  </>
                ) : null}
                <Button variant="secondary" onClick={rotateProfile} disabled={rotateDisabled} className="w-full whitespace-normal leading-5">
                  <RotateCw className="h-4 w-4" />
                  重新生成
                </Button>
                <Button variant="secondary" onClick={checkRuntimeStatus} disabled={Boolean(loading) || !profile.publicKey} className="w-full whitespace-normal leading-5">
                  <Activity className="h-4 w-4" />
                  检查连接握手
                </Button>
                <Button variant="secondary" onClick={waitForHandshake} disabled={Boolean(loading) || !profile.publicKey} className="w-full whitespace-normal leading-5">
                  <Activity className="h-4 w-4" />
                  等待真实设备连接
                </Button>
                <Button variant="secondary" onClick={verifyEgressIp} disabled={Boolean(loading) || !profile.publicKey} className="w-full whitespace-normal leading-5">
                  <Globe2 className="h-4 w-4" />
                  验证全隧道出口
                </Button>
                {profile.status === "paused" ? (
                  <Button variant="secondary" onClick={activateProfile} disabled={Boolean(loading) || !readiness.canActivateProfile} className="w-full whitespace-normal leading-5">
                    <CirclePlay className="h-4 w-4" />
                    启用
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={pauseProfile} disabled={Boolean(loading) || !readiness.canPauseProfile} className="w-full whitespace-normal leading-5">
                    <CirclePause className="h-4 w-4" />
                    暂停
                  </Button>
                )}
                <Button variant="danger" onClick={revokeProfile} disabled={Boolean(loading) || !profile || profile.status === "revoked"} className="w-full whitespace-normal leading-5">
                  <ShieldX className="h-4 w-4" />
                  吊销
                </Button>
              </>
            )}
          </div>
        </div>

        {!profile ? (
          <div className="mt-6 rounded-md border border-dashed border-slate-300 bg-slate-50 p-6">
            <p className="text-lg font-semibold text-slate-950">尚未生成访问配置</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">生成后可以用 WireGuard 二维码导入，也可以复制配置文本或下载 `.conf` 文件。</p>
            <Button onClick={generateProfile} disabled={generateDisabled} className="mt-5 whitespace-normal leading-5">
              <KeyRound className="h-4 w-4" />
              生成我的访问配置
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
            {readiness.canShowConfig ? (
              <div className="rounded-md border border-slate-100 bg-slate-50 p-4">
                <div className="grid h-64 place-items-center rounded-md bg-white">
                  {qr ? <Image src={qr} alt="安全接入配置二维码" width={240} height={240} unoptimized /> : <QrCode className="h-16 w-16 text-slate-300" />}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  此二维码包含 WireGuard 配置内容。请使用支持 WireGuard 配置导入的客户端扫描。
                </p>
                <Button variant="secondary" onClick={showQr} disabled={configActionDisabled} className="mt-3 w-full whitespace-normal leading-5">
                  <QrCode className="h-4 w-4" />
                  显示 WireGuard 二维码
                </Button>
              </div>
            ) : (
              <div className="rounded-md border border-slate-200 bg-white p-4 text-slate-700 shadow-sm">
                <p className="font-semibold">暂不可导入</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6">
                  {readiness.reasons.map((reason) => <li key={reason}>{reason}</li>)}
                </ul>
              </div>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              <Info label="配置状态" value={<StatusBadge label={statusLabel(profile.status)} tone={tone(profile.status)} />} />
              <Info label="设备名称" value={profile.deviceName} />
              <Info label="设备类型" value={profile.deviceType || "client"} />
              <Info label="配置类型" value={profile.configType || "wireguard"} />
              <Info label="分配地址" value={profile.assignedAddress || "未分配"} />
              <Info label="服务端 Peer 状态" value={<StatusBadge label={statusLabel(profile.serverPeerStatus || "pending")} tone={tone(profile.serverPeerStatus || "pending")} />} />
              <Info label="Peer 已应用" value={profile.peerApplied ? "是" : "否"} />
              <Info label="服务已重载" value={profile.serviceReloadedAfterPeer ? "是" : "否"} />
              <Info label="服务端应用时间" value={profile.serverAppliedAt ? formatDate(profile.serverAppliedAt) : "尚未确认应用"} />
              <Info label="过期时间" value={formatDate(profile.expiresAt)} />
              <Info label="最近使用时间" value={profile.lastUsedAt ? formatDate(profile.lastUsedAt) : "暂无记录"} />
              <Info label="最近下载时间" value={profile.lastDownloadedAt ? formatDate(profile.lastDownloadedAt) : "暂无记录"} />
              {profile.serverSyncError ? <Info label="服务端同步提示" value={profile.serverSyncError} /> : null}
            </div>
          </div>
        )}

        {downloadUrl ? (
          <div className="mt-5 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-950">一次性下载链接</p>
            <p className="mt-1 text-sm text-slate-600">一次性下载链接仅用于下载 WireGuard .conf 配置文件，不要填入客户端 URL 配置入口。10 分钟内仅可使用一次。</p>
            <p className="mt-2 break-all text-sm text-slate-600">{downloadUrl}</p>
          </div>
        ) : null}
        {shadowrocketUrl ? (
          <div className="mt-5 rounded-md border border-indigo-100 bg-indigo-50/55 p-4">
            <p className="text-sm font-semibold text-slate-950">Shadowrocket 私有导入链接</p>
            <p className="mt-1 text-sm leading-6 text-slate-600">先删除旧节点，再在 Shadowrocket 右上角 `+` 中选择 Subscribe，粘贴此链接并选择新导入的 WireGuard 节点。链接 180 天内仅可成功读取一次。</p>
            <p className="mt-2 break-all text-sm text-indigo-800">{shadowrocketUrl}</p>
            <Button variant="secondary" onClick={copyShadowrocketImportUrl} className="mt-3 whitespace-normal leading-5">
              <Clipboard className="h-4 w-4" />
              复制私有导入链接
            </Button>
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <ActivityPanel title="Endpoint 系统状态">
          {endpoint ? (
            <>
              <ActivityRow title="Dry-run" meta={endpoint.dryRun === false ? "false" : "true"} status={endpoint.dryRun === false ? "success" : "pending"} />
              <ActivityRow title="系统应用开关" meta={endpoint.allowSystemApply ? "已开启" : "未开启"} status={endpoint.allowSystemApply ? "success" : "pending"} />
              <ActivityRow title="wg" meta={endpoint.wireGuardInstalled ? "已安装" : "未检测到"} status={endpoint.wireGuardInstalled ? "success" : "pending"} />
              <ActivityRow title="wg-quick" meta={endpoint.wireGuardQuickInstalled ? "已安装" : "未检测到"} status={endpoint.wireGuardQuickInstalled ? "success" : "pending"} />
              <ActivityRow title="wg0" meta={endpoint.wgInterfacePresent ? "已存在" : "未确认"} status={endpoint.wgInterfacePresent ? "success" : "pending"} />
              <ActivityRow title="publicHost" meta={endpoint.publicHostResolved ? `已解析${endpoint.publicHostResolvedIp ? `：${endpoint.publicHostResolvedIp}` : ""}` : "未确认解析"} status={endpoint.publicHostResolved ? "success" : "pending"} />
              <ActivityRow title="服务配置" meta={endpoint.serviceConfigReady ? "已写入并通过检查" : "未确认"} status={endpoint.serviceConfigReady ? "success" : "pending"} />
              <ActivityRow title="wg-quick@wg0" meta={endpoint.serviceRunning ? "active" : endpoint.serviceStatus || "unknown"} status={endpoint.serviceRunning ? "success" : "pending"} />
              <ActivityRow title="UDP 端口" meta={endpoint.portListening ? `${endpoint.listenPort || 51820}/udp 已监听` : "未监听"} status={endpoint.portListening ? "success" : "pending"} />
              <ActivityRow title="IP forwarding" meta={endpoint.ipForwardingEnabled ? "已开启" : "未开启"} status={endpoint.ipForwardingEnabled ? "success" : "pending"} />
              {endpoint.systemApplyError ? <ActivityRow title="系统应用错误" meta={endpoint.systemApplyError} status="failed" /> : null}
            </>
          ) : <EmptyLine label="尚未初始化 Endpoint" />}
        </ActivityPanel>
        <ActivityPanel title="连接验证">
          {profile ? (
            <>
              <div className="rounded-md border border-indigo-100 bg-indigo-50/55 p-4 text-sm leading-6 text-slate-700">
                <p className="font-semibold">真实设备验收流程</p>
                <p className="mt-1">先点击“等待真实设备连接”，再在手机或电脑 WireGuard 客户端开启连接，并打开网页产生流量。通过条件是服务端看到 latest handshake，且 transfer 字节增长。</p>
                <p className="mt-1">握手通过后，将 Shadowrocket 全局路由设为“代理”，再点击“验证全隧道出口”；设备浏览器观测到的公网 IP 应显示为 {expectedExitIp}。</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <Button variant="secondary" onClick={waitForHandshake} disabled={Boolean(loading) || !profile.publicKey} className="whitespace-normal leading-5">
                    <Activity className="h-4 w-4" />
                    等待真实设备连接
                  </Button>
                  <Button variant="secondary" onClick={checkRuntimeStatus} disabled={Boolean(loading) || !profile.publicKey} className="whitespace-normal leading-5">
                    <Activity className="h-4 w-4" />
                    检查连接握手
                  </Button>
                  <Button variant="secondary" onClick={verifyEgressIp} disabled={Boolean(loading) || !profile.publicKey || !connectionVerified} className="whitespace-normal leading-5">
                    <Globe2 className="h-4 w-4" />
                    验证全隧道出口
                  </Button>
                </div>
              </div>
              {handshakeVerification ? (
                <>
                  <ActivityRow
                    title="真实设备验证"
                    meta={handshakeVerification.passed ? `通过 / transfer 增长 ${formatBytes(handshakeVerification.transferDeltaBytes)}` : `${handshakeVerification.timedOut ? "超时" : "未通过"} / transfer 增长 ${formatBytes(handshakeVerification.transferDeltaBytes)}`}
                    status={handshakeVerification.passed ? "success" : "pending"}
                  />
                  <ActivityRow
                    title="验证基线"
                    meta={`Handshake ${handshakeVerification.baselineStatus.latestHandshakeAt ? formatDate(handshakeVerification.baselineStatus.latestHandshakeAt) : "无"} / Transfer ${formatBytes(handshakeVerification.baselineStatus.transferTotalBytes)}`}
                    status="seen"
                  />
                </>
              ) : null}
              {runtimeStatus ? (
                <>
                  <ActivityRow
                    title="wg show 读取"
                    meta={runtimeStatus.available ? `已读取 ${runtimeStatus.interfaceName} / ${formatDate(runtimeStatus.checkedAt)}` : runtimeStatus.detail || "运行状态不可用"}
                    status={runtimeStatus.available ? "success" : "failed"}
                  />
                  <ActivityRow
                    title="Peer 运行状态"
                    meta={runtimeStatus.hasRuntimePeer ? "服务端已找到当前 Access Profile peer" : "服务端尚未找到当前 peer"}
                    status={runtimeStatus.hasRuntimePeer ? "success" : "pending"}
                  />
                  <ActivityRow
                    title="Latest handshake"
                    meta={runtimeStatus.latestHandshakeAt ? `${formatDate(runtimeStatus.latestHandshakeAt)}${runtimeStatus.latestHandshakeAgeSeconds !== null && runtimeStatus.latestHandshakeAgeSeconds !== undefined ? ` / ${formatAge(runtimeStatus.latestHandshakeAgeSeconds)}` : ""}` : "暂无 handshake，客户端导入并开启后再检查"}
                    status={runtimeStatus.latestHandshakeAt ? "success" : "pending"}
                  />
                  <ActivityRow
                    title="Transfer"
                    meta={!runtimeStatus.latestHandshakeAt && runtimeStatus.hasTransfer
                      ? `仅检测到握手尝试：Rx ${formatBytes(runtimeStatus.transferRxBytes)} / Tx ${formatBytes(runtimeStatus.transferTxBytes)}，隧道尚未建立`
                      : `Rx ${formatBytes(runtimeStatus.transferRxBytes)} / Tx ${formatBytes(runtimeStatus.transferTxBytes)}${runtimeTransferDelta !== null ? ` / 本次增长 ${formatBytes(runtimeTransferDelta)}` : ""}`}
                    status={hasTunnelTraffic ? "success" : "pending"}
                  />
                  <ActivityRow
                    title="全隧道出口 IP 预期"
                    meta={expectedExitIp === "未确认" ? "Endpoint 公网 IP 尚未确认" : `${expectedExitIp}（东京 VPS）`}
                    status={expectedExitIp === "未确认" ? "pending" : "success"}
                  />
                </>
              ) : <EmptyLine label="尚未检查连接握手" />}
              {egressVerification ? (
                <>
                  <ActivityRow
                    title="全隧道出口验证"
                    meta={egressVerification.message}
                    status={egressVerification.passed ? "success" : "failed"}
                  />
                  <ActivityRow
                    title="设备观测出口 IP"
                    meta={`${egressVerification.observedIp} / 预期 ${egressVerification.expectedIp || "未确认"} / ${egressVerification.provider}`}
                    status={egressVerification.passed ? "success" : "failed"}
                  />
                </>
              ) : null}
            </>
          ) : <EmptyLine label="尚未生成访问配置" />}
        </ActivityPanel>
        <ActivityPanel title="最近连接记录">
          {profile?.lastUsedAt ? <ActivityRow title="最近使用" meta={formatDate(profile.lastUsedAt)} status="active" /> : <EmptyLine label="暂无最近使用记录" />}
          {profile?.downloads?.length ? profile.downloads.map((download) => (
            <ActivityRow
              key={download.id}
              title={download.usedAt ? "配置文件已下载" : "下载链接已创建"}
              meta={`${formatDate(download.createdAt)} / ${download.usedAt ? "已使用" : "未使用"}`}
              status={download.usedAt ? "success" : "pending"}
            />
          )) : null}
        </ActivityPanel>
        <ActivityPanel title="最近 10 条审计日志">
          {recentAuditLogs.length ? recentAuditLogs.map((log) => (
            <ActivityRow key={log.id} title={log.action} meta={`${log.actorEmail || "system"} / ${formatDate(log.createdAt)}`} status={log.result} />
          )) : <EmptyLine label="暂无审计记录" />}
        </ActivityPanel>
      </section>

      <section className="rounded-md border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900">
        <p className="font-semibold text-emerald-950">安全提示</p>
        <p className="mt-1">安全接入配置包含设备私钥，只能导入到本人设备。重新生成或吊销都会写入审计日志；一次性配置下载链接在 10 分钟后过期，Shadowrocket 私有导入链接在 180 天后过期，使用后均立即失效。</p>
      </section>
    </div>
  );
}

function StatusPanel({
  icon: Icon,
  label,
  title,
  badge,
  tone: badgeTone,
  meta
}: {
  icon: typeof ShieldCheck;
  label: string;
  title: string;
  badge: string;
  tone: "default" | "success" | "warning" | "danger";
  meta: string;
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <Icon className="h-5 w-5 text-indigo-700" />
        <StatusBadge label={badge} tone={badgeTone} />
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-500">{label}</p>
      <h2 className="mt-2 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm text-slate-500">{meta}</p>
    </article>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <div className="mt-2 break-all text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}

function ActivityPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-2">{children}</div>
    </section>
  );
}

function ActivityRow({ title, meta, status }: { title: string; meta: string; status: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-slate-100 p-3">
      <div className="min-w-0">
        <p className="line-clamp-1 text-sm font-medium text-slate-950">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{meta}</p>
      </div>
      <StatusBadge label={status} tone={tone(status)} />
    </div>
  );
}

function EmptyLine({ label }: { label: string }) {
  return <p className="rounded-md border border-dashed border-slate-300 p-4 text-sm text-slate-500">{label}</p>;
}
