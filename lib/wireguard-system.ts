import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { prisma } from "@/lib/prisma";
import { decryptText } from "@/lib/secure-config";

const execFileAsync = promisify(execFile);

function systemApplyEnabled() {
  return process.env.VPS_DRY_RUN === "false" && process.env.VPS_ALLOW_SYSTEM_APPLY === "true";
}

async function run(command: string, args: string[], timeout = 30_000) {
  return execFileAsync(command, args, {
    timeout,
    maxBuffer: 1024 * 1024 * 4
  });
}

function subnetServerAddress(cidr: string) {
  const [address, prefix = "24"] = cidr.split("/");
  const parts = address.split(".");
  if (parts.length !== 4) return "10.66.0.1/24";
  return `${parts.slice(0, 3).join(".")}.1/${prefix}`;
}

async function portListening(port: number) {
  try {
    const { stdout } = await run("ss", ["-lunp"], 2000);
    return stdout.includes(`:${port} `) || stdout.includes(`:${port}\n`);
  } catch {
    return false;
  }
}

async function serviceActive() {
  try {
    await run("systemctl", ["is-active", "--quiet", "wg-quick@wg0"], 2000);
    return true;
  } catch {
    return false;
  }
}

async function commandInstalled(command: string) {
  try {
    await run("which", [command], 2000);
    return true;
  } catch {
    return false;
  }
}

async function wgInterfacePresent() {
  try {
    await run("ip", ["link", "show", "wg0"], 2000);
    return true;
  } catch {
    return false;
  }
}

async function ipForwardingEnabled() {
  try {
    const { stdout } = await run("cat", ["/proc/sys/net/ipv4/ip_forward"], 1000);
    return stdout.trim() === "1";
  } catch {
    return false;
  }
}

async function defaultRouteInterface() {
  try {
    const { stdout } = await run("ip", ["route", "show", "default"], 2000);
    const match = stdout.match(/\bdev\s+(\S+)/);
    return match?.[1] || "eth0";
  } catch {
    return "eth0";
  }
}

async function enableIpv4Forwarding() {
  const temp = path.join(os.tmpdir(), `secure-access-sysctl-${process.pid}-${Date.now()}.conf`);
  await fs.writeFile(
    temp,
    [
      "net.ipv4.ip_forward=1",
      "net.ipv4.conf.all.rp_filter=0",
      "net.ipv4.conf.default.rp_filter=0",
      "net.ipv4.conf.all.src_valid_mark=1",
      ""
    ].join("\n"),
    { mode: 0o644 }
  );
  try {
    await run("sudo", ["install", "-m", "644", temp, "/etc/sysctl.d/99-secure-access.conf"]);
  } finally {
    await fs.rm(temp, { force: true });
  }
  await run("sudo", ["sysctl", "-w", "net.ipv4.ip_forward=1"], 5000);
  await run("sudo", ["sysctl", "--system"], 15_000);
}

async function wgShow() {
  try {
    const { stdout } = await run("sudo", ["wg", "show"], 3000);
    return stdout;
  } catch {
    return "";
  }
}

function buildServerConfig({
  endpoint,
  outboundInterface,
  serverPrivateKey,
  peers
}: {
  endpoint: {
    listenPort: number;
    allowedIpTemplate: string;
    mtu: number | null;
  };
  outboundInterface: string;
  serverPrivateKey: string;
  peers: Array<{ publicKey: string | null; assignedAddress: string | null; status: string }>;
}) {
  const sourceCidr = endpoint.allowedIpTemplate;
  const natRule = `POSTROUTING -s ${sourceCidr} -o ${outboundInterface} -j MASQUERADE`;
  const forwardOutboundRule = `FORWARD -i wg0 -s ${sourceCidr} -o ${outboundInterface} -j ACCEPT`;
  const forwardReturnRule = `FORWARD -i ${outboundInterface} -d ${sourceCidr} -o wg0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT`;
  const lines = [
    "[Interface]",
    `Address = ${subnetServerAddress(sourceCidr)}`,
    `ListenPort = ${endpoint.listenPort}`,
    `MTU = ${endpoint.mtu || 1280}`,
    `PrivateKey = ${serverPrivateKey}`,
    "SaveConfig = false",
    `PostUp = sysctl -w net.ipv4.ip_forward=1; iptables -C ${forwardOutboundRule} || iptables -I ${forwardOutboundRule}; iptables -C ${forwardReturnRule} || iptables -I ${forwardReturnRule}; iptables -t nat -C ${natRule} || iptables -t nat -A ${natRule}`,
    `PostDown = iptables -D ${forwardOutboundRule} || true; iptables -D ${forwardReturnRule} || true; iptables -t nat -D ${natRule} || true`,
    ""
  ];

  for (const peer of peers) {
    if (peer.status !== "active" || !peer.publicKey || !peer.assignedAddress) continue;
    lines.push("[Peer]", `PublicKey = ${peer.publicKey}`, `AllowedIPs = ${peer.assignedAddress}`, "");
  }

  return lines.join("\n");
}

async function installConfig(content: string) {
  await run("sudo", ["install", "-m", "700", "-d", "/etc/wireguard"]);
  const temp = path.join(os.tmpdir(), `secure-access-wg0-${process.pid}-${Date.now()}.conf`);
  await fs.writeFile(temp, content, { mode: 0o600 });
  try {
    await run("sudo", ["install", "-m", "600", temp, "/etc/wireguard/wg0.conf"]);
  } finally {
    await fs.rm(temp, { force: true });
  }
}

async function updateEndpointFailure(endpointId: string, error: string) {
  await prisma.vpsEndpoint.update({
    where: { id: endpointId },
    data: {
      status: "needs_initialization",
      serviceStatus: "unknown",
      serviceConfigReady: false,
      serviceApplied: false,
      serviceRunning: false,
      portListening: false,
      systemApplyError: error,
      lastHealthCheckAt: new Date()
    }
  });
}

export async function syncWireGuardEndpointConfig(endpointId: string) {
  const endpoint = await prisma.vpsEndpoint.findUnique({
    where: { id: endpointId },
    include: {
      accessProfiles: {
        where: {
          status: { in: ["active", "paused"] }
        },
        select: {
          id: true,
          status: true,
          publicKey: true,
          assignedAddress: true
        }
      }
    }
  });

  if (!endpoint) throw new Error("ENDPOINT_NOT_FOUND");
  if (!systemApplyEnabled()) {
    await prisma.vpsAccessProfile.updateMany({
      where: { endpointId, status: { in: ["active", "paused"] } },
      data: {
        serverPeerStatus: "pending",
        peerApplied: false,
        serviceReloadedAfterPeer: false,
        serverAppliedAt: null,
        serverSyncError: "System apply is disabled or dry-run is enabled."
      }
    });
    throw new Error("ENDPOINT_SYSTEM_APPLY_DISABLED");
  }
  if (!endpoint.encryptedServerPrivateKey) throw new Error("ENDPOINT_SERVER_KEY_REQUIRED");

  try {
    const serverPrivateKey = decryptText(endpoint.encryptedServerPrivateKey);
    const outboundInterface = await defaultRouteInterface();
    const config = buildServerConfig({
      endpoint,
      outboundInterface,
      serverPrivateKey,
      peers: endpoint.accessProfiles
    });
    await enableIpv4Forwarding();
    await installConfig(config);
    await run("sudo", ["systemctl", "enable", "wg-quick@wg0"], 15_000);
    await run("sudo", ["systemctl", "restart", "wg-quick@wg0"], 30_000);
    const [show, running, listening, forwarding, quickInstalled, interfacePresent] = await Promise.all([
      wgShow(),
      serviceActive(),
      portListening(endpoint.listenPort),
      ipForwardingEnabled(),
      commandInstalled("wg-quick"),
      wgInterfacePresent()
    ]);
    const active = running && listening && forwarding && quickInstalled && interfacePresent && show.includes("interface: wg0");
    const now = new Date();

    await prisma.vpsEndpoint.update({
      where: { id: endpointId },
      data: {
        status: active ? "active" : "needs_initialization",
        serviceStatus: active ? "active" : running ? "installed" : "unknown",
        wireGuardInstalled: true,
        dryRun: false,
        allowSystemApply: true,
        serviceConfigReady: active,
        serviceApplied: active,
        serviceRunning: running,
        wireGuardQuickInstalled: quickInstalled,
        wgInterfacePresent: interfacePresent,
        portListening: listening,
        ipForwardingEnabled: forwarding,
        availablePorts: JSON.stringify(listening ? [endpoint.listenPort] : []),
        systemApplyError: active ? null : "WireGuard service, UDP port, or IPv4 forwarding is not ready after sync.",
        serviceAppliedAt: active ? now : null,
        lastHealthCheckAt: now
      }
    });

    await Promise.all(endpoint.accessProfiles.map((profile) => {
      const applied = profile.status === "active" && Boolean(profile.publicKey && show.includes(profile.publicKey));
      return prisma.vpsAccessProfile.update({
        where: { id: profile.id },
        data: {
          serverPeerStatus: applied ? "applied" : profile.status === "paused" ? "pending" : "failed",
          peerApplied: applied,
          serviceReloadedAfterPeer: running,
          serverAppliedAt: applied ? now : null,
          serverSyncError: applied || profile.status === "paused" ? null : "Peer public key was not found in wg show after service restart."
        }
      });
    }));

    return {
      active,
      running,
      listening,
      output: show
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "WireGuard sync failed.";
    await updateEndpointFailure(endpointId, message);
    await prisma.vpsAccessProfile.updateMany({
      where: { endpointId, status: { in: ["active", "paused"] } },
      data: {
        serverPeerStatus: "failed",
        peerApplied: false,
        serviceReloadedAfterPeer: false,
        serverAppliedAt: null,
        serverSyncError: message
      }
    });
    throw error;
  }
}
