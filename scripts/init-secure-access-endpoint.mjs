#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import dgram from "node:dgram";
import dns from "node:dns/promises";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DEFAULT_ENDPOINT_ID = "default-endpoint";
const DEFAULT_PORT = 51820;

function loadEnvFile(path) {
  if (!fs.existsSync(path)) return;
  const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (process.env[key]) continue;
    const raw = rest.join("=").trim();
    process.env[key] = raw.replace(/^"|"$/g, "");
  }
}

function encryptionKey() {
  const source = process.env.VPS_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || process.env.VPS_AUTH_SECRET || process.env.AUTH_SECRET || process.env.JWT_SECRET || "local-development-key";
  return crypto.createHash("sha256").update(source).digest();
}

function encryptText(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

function generateWireGuardKeyPair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("x25519");
  const privateDer = privateKey.export({ format: "der", type: "pkcs8" });
  const publicDer = publicKey.export({ format: "der", type: "spki" });
  return {
    privateKey: privateDer.subarray(-32).toString("base64"),
    publicKey: publicDer.subarray(-32).toString("base64")
  };
}

function checkCommand(command, args) {
  try {
    return execFileSync(command, args, { timeout: 2000, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch {
    return "";
  }
}

function checkSystemctlActive(service) {
  try {
    execFileSync("systemctl", ["is-active", "--quiet", service], { timeout: 2000, stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkCommandInstalled(command) {
  return Boolean(checkCommand("which", [command]));
}

function checkWgInterfacePresent() {
  return Boolean(checkCommand("ip", ["link", "show", "wg0"]));
}

async function resolvePublicEntry(publicHost, publicIp) {
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

function checkUdpListening(port) {
  const output = checkCommand("ss", ["-lunp"]);
  return output.includes(`:${port} `) || output.includes(`:${port}\n`);
}

function checkIpForwarding() {
  try {
    return fs.readFileSync("/proc/sys/net/ipv4/ip_forward", "utf8").trim() === "1";
  } catch {
    return false;
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
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

async function main() {
  loadEnvFile(".env.production");
  loadEnvFile(".env");

  const existing = await prisma.vpsEndpoint.findFirst({ orderBy: { createdAt: "asc" } });
  const publicHost = process.env.VPS_DEFAULT_ENDPOINT_HOST || process.env.VPS_PUBLIC_HOST || process.env.DOMAIN || existing?.publicHost || null;
  const publicIp = process.env.VPS_PUBLIC_IP || process.env.EC2_HOST || existing?.publicIp || null;
  const listenPort = Number(process.env.VPS_DEFAULT_LISTEN_PORT || process.env.VPS_WG_PORT || existing?.listenPort || DEFAULT_PORT);
  const wgVersion = checkCommand("wg", ["--version"]);
  const wgShow = checkCommand("sudo", ["wg", "show"]);
  const wireGuardInstalled = Boolean(wgVersion);
  const wireGuardQuickInstalled = checkCommandInstalled("wg-quick");
  const wgInterfacePresent = checkWgInterfacePresent();
  const serviceRunning = checkSystemctlActive("wg-quick@wg0") || Boolean(wgShow);
  const serviceStatus = serviceRunning ? "active" : wireGuardInstalled ? "installed" : "unknown";
  const portAvailable = await checkPort(listenPort);
  const portListening = checkUdpListening(listenPort);
  const dryRun = (process.env.VPS_DRY_RUN ?? "true") !== "false";
  const allowSystemApply = process.env.VPS_ALLOW_SYSTEM_APPLY === "true";
  const ipForwardingEnabled = checkIpForwarding();
  const publicEntry = await resolvePublicEntry(publicHost, publicIp);
  const serviceConfigReady = wireGuardInstalled && wireGuardQuickInstalled && wgInterfacePresent && serviceRunning && portListening && ipForwardingEnabled;
  const serviceApplied = serviceConfigReady;
  const keyPair = existing?.serverPublicKey ? null : generateWireGuardKeyPair();
  const status = (publicHost || publicIp) && publicEntry.publicHostResolved && wireGuardInstalled && wireGuardQuickInstalled && wgInterfacePresent && serviceStatus === "active" && !dryRun && allowSystemApply && portListening && ipForwardingEnabled
    ? "active"
    : "needs_initialization";

  const data = {
    name: `${os.hostname()} Secure Access Endpoint`,
    hostname: os.hostname(),
    publicHost,
    publicIp,
    region: process.env.VPS_REGION || existing?.region || null,
    status,
    configType: "wireguard",
    serverPublicKey: keyPair?.publicKey || existing?.serverPublicKey || null,
    encryptedServerPrivateKey: keyPair?.privateKey ? encryptText(keyPair.privateKey) : existing?.encryptedServerPrivateKey || null,
    listenPort,
    dns: process.env.VPS_DEFAULT_DNS || process.env.VPS_WG_DNS || existing?.dns || "1.1.1.1",
    mtu: process.env.VPS_DEFAULT_MTU ? Number(process.env.VPS_DEFAULT_MTU) : process.env.VPS_WG_MTU ? Number(process.env.VPS_WG_MTU) : existing?.mtu || null,
    allowedIpTemplate: process.env.VPS_WG_ALLOWED_IPS || existing?.allowedIpTemplate || "10.66.0.0/24",
    clientAllowedIps: process.env.VPS_CLIENT_ALLOWED_IPS || existing?.clientAllowedIps || "0.0.0.0/0",
    operatingSystem: `${os.platform()} ${os.release()}`,
    architecture: os.arch(),
    defaultProfileExpireDays: Number(process.env.VPS_DEFAULT_PROFILE_EXPIRE_DAYS || existing?.defaultProfileExpireDays || 180),
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
    systemApplyError: serviceApplied ? null : existing?.systemApplyError || null,
    serviceAppliedAt: serviceApplied ? new Date() : existing?.serviceAppliedAt || null,
    systemInfo: JSON.stringify({
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      cpuCount: os.cpus().length,
      totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
      node: process.version,
      wireGuardDetail: wgVersion || "wireguard-tools not found"
    }),
    availablePorts: JSON.stringify(portAvailable ? [listenPort] : []),
    serviceStatus,
    wireGuardInstalled,
    lastHealthCheckAt: new Date()
  };

  const endpoint = existing
    ? await prisma.vpsEndpoint.update({ where: { id: existing.id }, data })
    : await prisma.vpsEndpoint.create({ data: { id: DEFAULT_ENDPOINT_ID, ...data } });

  await prisma.vpsSetting.upsert({
    where: { key: "secure_access_public_host" },
    update: { value: publicHost || publicIp || "", description: "Secure Access Endpoint public host fallback." },
    create: { key: "secure_access_public_host", value: publicHost || publicIp || "", description: "Secure Access Endpoint public host fallback." }
  });

  await prisma.vpsAuditLog.create({
    data: {
      action: "endpoint_initialized",
      targetType: "endpoint",
      targetId: endpoint.id,
      result: "success",
      afterJson: JSON.stringify({
        status: endpoint.status,
        publicHost: endpoint.publicHost,
        publicIp: endpoint.publicIp,
        wireGuardInstalled: endpoint.wireGuardInstalled,
        listenPort: endpoint.listenPort,
        serviceStatus: endpoint.serviceStatus,
        portListening: endpoint.portListening,
        dryRun: endpoint.dryRun
      })
    }
  });

  console.log(JSON.stringify({
    id: endpoint.id,
    status: endpoint.status,
    publicHost: endpoint.publicHost,
    publicIp: endpoint.publicIp,
    wireGuardInstalled: endpoint.wireGuardInstalled,
    listenPort: endpoint.listenPort,
    serviceStatus: endpoint.serviceStatus,
    portListening: endpoint.portListening,
    dryRun: endpoint.dryRun
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
