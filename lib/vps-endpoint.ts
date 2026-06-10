import { execFile } from "node:child_process";
import crypto from "node:crypto";
import dgram from "node:dgram";
import dns from "node:dns/promises";
import net from "node:net";
import os from "node:os";
import { promisify } from "node:util";
import { prisma } from "@/lib/prisma";
import { encryptText } from "@/lib/secure-config";
import type { AdminActor } from "@/lib/vps-data";

const execFileAsync = promisify(execFile);
const DEFAULT_ENDPOINT_ID = "default-endpoint";
const DEFAULT_LISTEN_PORT = 51820;

type EndpointInput = {
  publicHost?: string | null;
  publicIp?: string | null;
  region?: string | null;
  listenPort?: number | null;
  dns?: string | null;
  mtu?: number | null;
  allowedIpTemplate?: string | null;
  clientAllowedIps?: string | null;
};

function generateWireGuardKeyPair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("x25519");
  const privateDer = privateKey.export({ format: "der", type: "pkcs8" }) as Buffer;
  const publicDer = publicKey.export({ format: "der", type: "spki" }) as Buffer;
  return {
    privateKey: privateDer.subarray(-32).toString("base64"),
    publicKey: publicDer.subarray(-32).toString("base64")
  };
}

function hostFromRequest(request?: Request) {
  if (!request) return null;
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host || host.startsWith("localhost") || host.startsWith("127.0.0.1")) return null;
  return host;
}

async function readSetting(key: string) {
  const setting = await prisma.vpsSetting.findUnique({ where: { key } });
  return setting?.value || null;
}

async function detectPublicIp() {
  if (process.env.VPS_PUBLIC_IP) return process.env.VPS_PUBLIC_IP;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch("https://api.ipify.org?format=text", {
      cache: "no-store",
      signal: controller.signal
    });
    if (!response.ok) return null;
    const value = (await response.text()).trim();
    return value && value.length < 64 ? value : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function checkWireGuardInstalled() {
  try {
    const { stdout, stderr } = await execFileAsync("wg", ["--version"], { timeout: 2000 });
    return {
      installed: true,
      detail: (stdout || stderr).trim()
    };
  } catch {
    return {
      installed: false,
      detail: "wireguard-tools not found"
    };
  }
}

async function checkCommandInstalled(command: string) {
  try {
    await execFileAsync("which", [command], { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

async function checkWireGuardService() {
  try {
    await execFileAsync("systemctl", ["is-active", "--quiet", "wg-quick@wg0"], { timeout: 2000 });
    return "active";
  } catch {
    // Fall back to wg output below: systems without systemd can still expose an active interface.
  }
  try {
    const { stdout } = await execFileAsync("wg", ["show"], { timeout: 2000 });
    return stdout.trim() ? "active" : "installed";
  } catch {
    return "unknown";
  }
}

async function checkWgInterfacePresent() {
  try {
    await execFileAsync("ip", ["link", "show", "wg0"], { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

async function checkUdpListening(port: number) {
  try {
    const { stdout } = await execFileAsync("ss", ["-lunp"], { timeout: 2000 });
    return stdout.includes(`:${port} `) || stdout.includes(`:${port}\n`);
  } catch {
    return false;
  }
}

async function resolvePublicEntry(publicHost?: string | null, publicIp?: string | null) {
  if (publicHost) {
    if (net.isIP(publicHost)) return { publicHostResolved: true, publicHostResolvedIp: publicHost };
    try {
      const result = await dns.lookup(publicHost, { family: 4 });
      return { publicHostResolved: true, publicHostResolvedIp: result.address };
    } catch {
      if (publicIp) return { publicHostResolved: true, publicHostResolvedIp: publicIp };
      return { publicHostResolved: false, publicHostResolvedIp: null };
    }
  }
  return { publicHostResolved: Boolean(publicIp), publicHostResolvedIp: publicIp || null };
}

async function checkIpForwarding() {
  try {
    const { stdout } = await execFileAsync("cat", ["/proc/sys/net/ipv4/ip_forward"], { timeout: 1000 });
    return stdout.trim() === "1";
  } catch {
    return false;
  }
}

async function readWireGuardState() {
  try {
    const { stdout } = await execFileAsync("sudo", ["wg", "show"], { timeout: 2000 });
    return {
      ok: true,
      output: stdout
    };
  } catch (error) {
    return {
      ok: false,
      output: error instanceof Error ? error.message : "wg show failed"
    };
  }
}

function checkUdpPort(port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = dgram.createSocket("udp4");
    const timer = setTimeout(() => {
      socket.close();
      resolve(false);
    }, 1200);
    socket.once("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
    socket.once("listening", () => {
      clearTimeout(timer);
      socket.close(() => resolve(true));
    });
    socket.bind(port);
  });
}

function systemInfo() {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpuCount: os.cpus().length,
    totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
    node: process.version
  };
}

export function secureAccessInitializationPlan(endpoint?: { listenPort?: number | null; allowedIpTemplate?: string | null; clientAllowedIps?: string | null; dryRun?: boolean | null; serviceApplied?: boolean | null }) {
  const port = endpoint?.listenPort || DEFAULT_LISTEN_PORT;
  const cidr = endpoint?.allowedIpTemplate || "10.66.0.0/24";
  const clientRoutes = endpoint?.clientAllowedIps || "0.0.0.0/0";
  const applied = endpoint?.dryRun === false && endpoint?.serviceApplied === true;
  return {
    mode: applied ? "system-applied" : "dry-run",
    warning: applied
      ? "系统配置已通过安全初始化流程应用。后续生成、暂停、启用或吊销 Access Profile 会同步服务端 peer。"
      : "系统不会静默安装软件、写入 /etc/wireguard 或重载系统服务。请先确认这些命令符合当前服务器策略。",
    commands: [
      "sudo dnf install -y wireguard-tools",
      "sudo dnf install -y iptables-nft  # 如果缺少 iptables",
      "wg --version",
      "ip route show default",
      "sudo sysctl -w net.ipv4.ip_forward=1",
      "echo 'net.ipv4.ip_forward=1' | sudo tee /etc/sysctl.d/99-secure-access.conf",
      "sudo sysctl --system",
      `sudo install -m 700 -d /etc/wireguard`,
      `sudo cp /etc/wireguard/wg0.conf /etc/wireguard/wg0.conf.backup.$(date +%Y%m%d%H%M%S)  # 如果文件已存在`,
      `sudo iptables -t nat -C POSTROUTING -s ${cidr} -o <default-interface> -j MASQUERADE || sudo iptables -t nat -A POSTROUTING -s ${cidr} -o <default-interface> -j MASQUERADE`,
      `sudo install -m 600 /tmp/secure-access-wg0.conf /etc/wireguard/wg0.conf  # listenPort=${port}, address=${cidr}, deviceRoutes=${clientRoutes}`,
      "sudo systemctl enable wg-quick@wg0",
      "sudo systemctl restart wg-quick@wg0",
      `sudo ss -lunp | grep ${port}`
    ]
  };
}

export async function detectEndpointEnvironment(request?: Request, input: EndpointInput = {}) {
  const listenPort = input.listenPort || Number(process.env.VPS_DEFAULT_LISTEN_PORT || process.env.VPS_WG_PORT || DEFAULT_LISTEN_PORT);
  const [wireGuard, wireGuardQuickInstalled, serviceStatus, wgInterfacePresent, configuredHost, configuredIp, portAvailable, portListening, ipForwardingEnabled] = await Promise.all([
    checkWireGuardInstalled(),
    checkCommandInstalled("wg-quick"),
    checkWireGuardService(),
    checkWgInterfacePresent(),
    readSetting("secure_access_public_host"),
    detectPublicIp(),
    checkUdpPort(listenPort),
    checkUdpListening(listenPort),
    checkIpForwarding()
  ]);
  const publicHost = input.publicHost || process.env.VPS_DEFAULT_ENDPOINT_HOST || process.env.VPS_PUBLIC_HOST || configuredHost || hostFromRequest(request);
  const publicIp = input.publicIp || configuredIp;
  const publicEntry = await resolvePublicEntry(publicHost, publicIp);
  const hasPublicEntry = Boolean(publicHost || publicIp);
  const publicEntryReady = publicEntry.publicHostResolved || Boolean(publicIp && !publicHost);
  const dryRun = (process.env.VPS_DRY_RUN ?? "true") !== "false";
  const allowSystemApply = process.env.VPS_ALLOW_SYSTEM_APPLY === "true";
  const serviceRunning = serviceStatus === "active";
  const serviceConfigReady = wireGuard.installed && wireGuardQuickInstalled && wgInterfacePresent && serviceRunning && portListening && ipForwardingEnabled;
  const serviceApplied = serviceConfigReady;
  const status = wireGuard.installed && wireGuardQuickInstalled && wgInterfacePresent && hasPublicEntry && publicEntryReady && serviceStatus === "active" && !dryRun && allowSystemApply && portListening && ipForwardingEnabled ? "active" : "needs_initialization";

  return {
    name: `${os.hostname()} Secure Access Endpoint`,
    hostname: os.hostname(),
    publicHost,
    publicIp,
    region: input.region || process.env.VPS_REGION || null,
    status,
    configType: "wireguard",
    listenPort,
    dns: input.dns || process.env.VPS_DEFAULT_DNS || process.env.VPS_WG_DNS || "1.1.1.1",
    mtu: input.mtu || (process.env.VPS_DEFAULT_MTU ? Number(process.env.VPS_DEFAULT_MTU) : null),
    allowedIpTemplate: input.allowedIpTemplate || process.env.VPS_WG_ALLOWED_IPS || "10.66.0.0/24",
    clientAllowedIps: input.clientAllowedIps || process.env.VPS_CLIENT_ALLOWED_IPS || "0.0.0.0/0",
    operatingSystem: `${os.platform()} ${os.release()}`,
    architecture: os.arch(),
    defaultProfileExpireDays: Number(process.env.VPS_DEFAULT_PROFILE_EXPIRE_DAYS || 180),
    dryRun,
    allowSystemApply,
    serviceConfigReady,
    serviceApplied,
    serviceRunning,
    wireGuardQuickInstalled,
    wgInterfacePresent,
    portListening,
    ipForwardingEnabled,
    publicHostResolved: publicEntry.publicHostResolved,
    publicHostResolvedIp: publicEntry.publicHostResolvedIp,
    systemApplyError: serviceRunning ? null : undefined,
    serviceAppliedAt: serviceApplied ? new Date() : undefined,
    systemInfo: JSON.stringify({
      ...systemInfo(),
      wireGuardDetail: wireGuard.detail
    }),
    availablePorts: JSON.stringify(portAvailable ? [listenPort] : []),
    serviceStatus,
    wireGuardInstalled: wireGuard.installed,
    lastHealthCheckAt: new Date()
  };
}

export async function getCurrentEndpoint() {
  return prisma.vpsEndpoint.findFirst({
    orderBy: { createdAt: "asc" }
  });
}

export function sanitizeEndpoint<T extends Record<string, unknown> | null>(endpoint: T): T {
  if (!endpoint) return endpoint;
  const safe = { ...endpoint };
  delete safe.encryptedServerPrivateKey;
  return safe as T;
}

export async function ensureCurrentEndpoint({
  request,
  actor,
  initializeKeys = false,
  input = {}
}: {
  request?: Request;
  actor?: AdminActor | null;
  initializeKeys?: boolean;
  input?: EndpointInput;
} = {}) {
  const existing = await getCurrentEndpoint();
  const detected = await detectEndpointEnvironment(request, input);
  const needsServerKey = initializeKeys && !existing?.serverPublicKey;
  const keyPair = needsServerKey ? generateWireGuardKeyPair() : null;
  const data = {
    ...detected,
    publicHost: detected.publicHost || existing?.publicHost || null,
    publicIp: detected.publicIp || existing?.publicIp || null,
    serverPublicKey: keyPair?.publicKey || existing?.serverPublicKey || null,
    encryptedServerPrivateKey: keyPair?.privateKey ? encryptText(keyPair.privateKey) : existing?.encryptedServerPrivateKey || null
  };

  const endpoint = existing
    ? await prisma.vpsEndpoint.update({
      where: { id: existing.id },
      data
    })
    : await prisma.vpsEndpoint.create({
      data: {
        id: DEFAULT_ENDPOINT_ID,
        ...data
      }
    });

  if (actor) {
    await prisma.vpsAuditLog.create({
      data: {
        actorId: actor.id,
        actorEmail: actor.email,
        action: existing ? "endpoint_health_checked" : "endpoint_initialized",
        targetType: "endpoint",
        targetId: endpoint.id,
        afterJson: JSON.stringify({
          status: endpoint.status,
          publicHost: endpoint.publicHost,
          publicIp: endpoint.publicIp,
          wireGuardInstalled: endpoint.wireGuardInstalled,
          serviceStatus: endpoint.serviceStatus
        })
      }
    });
  }

  await refreshEndpointPeerStatuses(endpoint.id, endpoint.wireGuardInstalled);

  return endpoint;
}

export async function refreshEndpointPeerStatuses(endpointId = DEFAULT_ENDPOINT_ID, wireGuardInstalled?: boolean | null) {
  const profiles = await prisma.vpsAccessProfile.findMany({
    where: {
      endpointId,
      status: { in: ["active", "paused"] },
      publicKey: { not: null }
    },
    select: { id: true, publicKey: true, serverPeerStatus: true }
  });
  if (!profiles.length) return;

  if (!wireGuardInstalled) {
    await prisma.vpsAccessProfile.updateMany({
      where: { id: { in: profiles.map((profile) => profile.id) } },
      data: {
        serverPeerStatus: "pending",
        serverAppliedAt: null,
        peerApplied: false,
        serviceReloadedAfterPeer: false,
        serverSyncError: "WireGuard tools are not installed on this server."
      }
    });
    return;
  }

  const state = await readWireGuardState();
  const now = new Date();
  await Promise.all(profiles.map((profile) => {
    const applied = Boolean(profile.publicKey && state.ok && state.output.includes(profile.publicKey));
    return prisma.vpsAccessProfile.update({
      where: { id: profile.id },
      data: {
        serverPeerStatus: applied ? "applied" : "pending",
        serverAppliedAt: applied ? now : null,
        peerApplied: applied,
        serviceReloadedAfterPeer: applied,
        serverSyncError: state.ok ? null : state.output
      }
    });
  }));
}

export async function initializeCurrentEndpoint({
  request,
  actor,
  input = {}
}: {
  request?: Request;
  actor: AdminActor;
  input?: EndpointInput;
}) {
  return ensureCurrentEndpoint({ request, actor, initializeKeys: true, input });
}
