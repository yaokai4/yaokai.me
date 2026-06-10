#!/usr/bin/env node
import { execFile, spawn } from "node:child_process";
import crypto from "node:crypto";
import dns from "node:dns/promises";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { PrismaClient } from "@prisma/client";

const execFileAsync = promisify(execFile);
const prisma = new PrismaClient();
const DEFAULT_ENDPOINT_ID = "default-endpoint";
const args = new Set(process.argv.slice(2));
const apply = args.has("--apply");
const rotateProfile = args.has("--rotate-profile");
const emailArg = process.argv.find((arg) => arg.startsWith("--email="));
const hostArg = process.argv.find((arg) => arg.startsWith("--host="));
const envPathArg = process.argv.find((arg) => arg.startsWith("--env="));

function log(message) {
  console.log(message);
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

async function run(command, args = [], options = {}) {
  if (!apply && options.mutates) {
    log(`[plan] ${[command, ...args].join(" ")}`);
    return { stdout: "", stderr: "" };
  }
  return execFileAsync(command, args, {
    timeout: options.timeout || 120_000,
    maxBuffer: 1024 * 1024 * 8
  });
}

function runStreaming(command, args = [], options = {}) {
  if (!apply && options.mutates) {
    log(`[plan] ${[command, ...args].join(" ")}`);
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "inherit", "inherit"] });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

function parseEnv(raw) {
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    values[key] = rawValue.trim().replace(/^"|"$/g, "");
  }
  return values;
}

async function loadEnv() {
  const envPath = envPathArg?.slice("--env=".length) || (fsSync.existsSync(".env.production") ? ".env.production" : ".env");
  if (!fsSync.existsSync(envPath)) throw new Error(`Env file not found: ${envPath}`);
  const raw = await fs.readFile(envPath, "utf8");
  const values = parseEnv(raw);
  Object.assign(process.env, values);
  return { envPath, raw, values };
}

function randomSecret() {
  return crypto.randomBytes(32).toString("hex");
}

function quoteEnv(value) {
  return `"${String(value).replace(/(["\\$`])/g, "\\$1")}"`;
}

function hostFromUrl(value) {
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return value.replace(/^https?:\/\//, "").split("/")[0].split(":")[0] || null;
  }
}

async function ensureEnvValues(envPath, raw, values) {
  const updates = new Map();
  const existingAuth = values.VPS_AUTH_SECRET || values.AUTH_SECRET || values.JWT_SECRET || randomSecret();
  const existingEncryption = values.VPS_ENCRYPTION_KEY || values.ENCRYPTION_KEY || existingAuth || randomSecret();
  const publicHost = hostArg?.slice("--host=".length) || values.VPS_DEFAULT_ENDPOINT_HOST || values.VPS_PUBLIC_HOST || hostFromUrl(values.NEXT_PUBLIC_SITE_URL) || "yaokai.me";
  const defaults = {
    VPS_APP_URL: values.APP_URL || values.NEXT_PUBLIC_SITE_URL || `https://${publicHost}`,
    VPS_AUTH_SECRET: existingAuth,
    VPS_ENCRYPTION_KEY: existingEncryption,
    VPS_DEFAULT_ENDPOINT_HOST: publicHost,
    VPS_DEFAULT_LISTEN_PORT: values.VPS_DEFAULT_LISTEN_PORT || "51820",
    VPS_DEFAULT_DNS: values.VPS_DEFAULT_DNS || "1.1.1.1",
    VPS_DEFAULT_MTU: values.VPS_DEFAULT_MTU || "1280",
    VPS_WG_ALLOWED_IPS: values.VPS_WG_ALLOWED_IPS || "10.66.0.0/24",
    VPS_CLIENT_ALLOWED_IPS: values.VPS_CLIENT_ALLOWED_IPS || "0.0.0.0/0",
    VPS_DEFAULT_PROFILE_EXPIRE_DAYS: values.VPS_DEFAULT_PROFILE_EXPIRE_DAYS || "180",
    VPS_ONE_TIME_TOKEN_MINUTES: values.VPS_ONE_TIME_TOKEN_MINUTES || "10",
    VPS_ALLOW_PUBLIC_STATUS: values.VPS_ALLOW_PUBLIC_STATUS || "false",
    VPS_DRY_RUN: apply ? "false" : values.VPS_DRY_RUN || "true",
    VPS_ALLOW_SYSTEM_APPLY: apply ? "true" : values.VPS_ALLOW_SYSTEM_APPLY || "false"
  };

  let next = raw;
  let changed = false;
  for (const [key, value] of Object.entries(defaults)) {
    process.env[key] = value;
    if (values[key] === value) continue;
    updates.set(key, value);
    const line = `${key}=${quoteEnv(value)}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");
    if (pattern.test(next)) next = next.replace(pattern, line);
    else next += `${next.endsWith("\n") ? "" : "\n"}${line}\n`;
    changed = true;
  }

  if (changed) {
    const backup = `${envPath}.backup.${timestamp()}`;
    log(`${apply ? "Env backup" : "Env backup planned"}: ${backup}`);
    if (apply) {
      await fs.copyFile(envPath, backup);
      await fs.writeFile(envPath, next, { mode: 0o600 });
    }
    const safeKeys = [...updates.keys()].map((key) => key.includes("SECRET") || key.includes("KEY") ? `${key}=<redacted>` : `${key}=${updates.get(key)}`);
    log(`Env updated keys: ${safeKeys.join(", ")}`);
  } else {
    log("Env required keys: already present");
  }
}

function timestamp() {
  const date = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
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

function decryptText(value) {
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) throw new Error("INVALID_ENCRYPTED_CONFIG");
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final()
  ]).toString("utf8");
}

async function commandExists(command) {
  try {
    await execFileAsync("which", [command], { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

async function ensureWireGuardTools() {
  if (await commandExists("wg")) return;
  const osRelease = fsSync.existsSync("/etc/os-release") ? await fs.readFile("/etc/os-release", "utf8") : "";
  if (/Amazon Linux|amzn/i.test(osRelease) || /ID="?amzn"?/i.test(osRelease)) {
    await runStreaming("sudo", ["dnf", "install", "-y", "wireguard-tools"], { mutates: true });
    return;
  }
  if (/Debian|Ubuntu|ID="?ubuntu"?|ID="?debian"?/i.test(osRelease)) {
    await runStreaming("sudo", ["apt", "update"], { mutates: true });
    await runStreaming("sudo", ["apt", "install", "-y", "wireguard", "wireguard-tools"], { mutates: true });
    return;
  }
  throw new Error("Unsupported OS for automatic WireGuard install. Install wireguard-tools manually first.");
}

async function ensureNatTools() {
  if (await commandExists("iptables")) return;
  const osRelease = fsSync.existsSync("/etc/os-release") ? await fs.readFile("/etc/os-release", "utf8") : "";
  if (/Amazon Linux|amzn/i.test(osRelease) || /ID="?amzn"?/i.test(osRelease)) {
    await runStreaming("sudo", ["dnf", "install", "-y", "iptables-nft"], { mutates: true });
    return;
  }
  if (/Debian|Ubuntu|ID="?ubuntu"?|ID="?debian"?/i.test(osRelease)) {
    await runStreaming("sudo", ["apt", "update"], { mutates: true });
    await runStreaming("sudo", ["apt", "install", "-y", "iptables"], { mutates: true });
    return;
  }
  throw new Error("Unsupported OS for automatic NAT tool install. Install iptables manually first.");
}

async function wgKeyPair() {
  const privateKey = (await execFileAsync("wg", ["genkey"], { timeout: 2000 })).stdout.trim();
  const child = spawn("wg", ["pubkey"], { stdio: ["pipe", "pipe", "pipe"] });
  child.stdin.end(`${privateKey}\n`);
  const publicKey = await new Promise((resolve, reject) => {
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve(stdout.trim()) : reject(new Error(stderr || `wg pubkey exited ${code}`)));
  });
  return { privateKey, publicKey };
}

async function ensureServerKey(endpoint) {
  if (endpoint?.encryptedServerPrivateKey && endpoint.serverPublicKey) {
    try {
      return {
        privateKey: decryptText(endpoint.encryptedServerPrivateKey),
        publicKey: endpoint.serverPublicKey
      };
    } catch {
      log("Existing server key could not be decrypted with current key; generating a new server keypair.");
    }
  }
  return wgKeyPair();
}

function subnetBase(cidr) {
  const [address, prefix = "24"] = cidr.split("/");
  const parts = address.split(".");
  if (parts.length !== 4) return { serverAddress: "10.66.0.1/24", peerPrefix: "10.66.0" };
  return { serverAddress: `${parts.slice(0, 3).join(".")}.1/${prefix}`, peerPrefix: parts.slice(0, 3).join(".") };
}

async function defaultRouteInterface() {
  try {
    const { stdout } = await execFileAsync("ip", ["route", "show", "default"], {
      timeout: 2000,
      maxBuffer: 1024 * 1024
    });
    const match = stdout.match(/\bdev\s+(\S+)/);
    return match?.[1] || "eth0";
  } catch {
    return "eth0";
  }
}

async function nextAssignedAddress(endpointId, cidr) {
  const { peerPrefix } = subnetBase(cidr);
  const profiles = await prisma.vpsAccessProfile.findMany({
    where: { endpointId, assignedAddress: { not: null }, status: { not: "revoked" } },
    select: { assignedAddress: true }
  });
  const used = new Set(profiles.map((profile) => profile.assignedAddress).filter(Boolean));
  for (let index = 2; index < 255; index += 1) {
    const address = `${peerPrefix}.${index}/32`;
    if (!used.has(address)) return address;
  }
  throw new Error("No available WireGuard address.");
}

function buildClientConfig({ peerPrivateKey, assignedAddress, endpoint }) {
  return [
    "[Interface]",
    `PrivateKey = ${peerPrivateKey}`,
    `Address = ${assignedAddress}`,
    endpoint.dns ? `DNS = ${endpoint.dns}` : "",
    endpoint.mtu ? `MTU = ${endpoint.mtu}` : "",
    "",
    "[Peer]",
    `PublicKey = ${endpoint.serverPublicKey}`,
    `AllowedIPs = ${endpoint.clientAllowedIps || process.env.VPS_CLIENT_ALLOWED_IPS || "0.0.0.0/0"}`,
    `Endpoint = ${endpoint.publicHost || endpoint.publicIp}:${endpoint.listenPort}`,
    "PersistentKeepalive = 25"
  ].filter(Boolean).join("\n") + "\n";
}

function buildServerConfig({ serverPrivateKey, endpoint, peers, outboundInterface }) {
  const sourceCidr = endpoint.allowedIpTemplate;
  const { serverAddress } = subnetBase(sourceCidr);
  const natRule = `POSTROUTING -s ${sourceCidr} -o ${outboundInterface} -j MASQUERADE`;
  const forwardOutboundRule = `FORWARD -i wg0 -s ${sourceCidr} -o ${outboundInterface} -j ACCEPT`;
  const forwardReturnRule = `FORWARD -i ${outboundInterface} -d ${sourceCidr} -o wg0 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT`;
  const lines = [
    "[Interface]",
    `Address = ${serverAddress}`,
    `ListenPort = ${endpoint.listenPort}`,
    `MTU = ${endpoint.mtu || 1280}`,
    `PrivateKey = ${serverPrivateKey}`,
    "SaveConfig = false",
    `PostUp = sysctl -w net.ipv4.ip_forward=1; iptables -C ${forwardOutboundRule} || iptables -I ${forwardOutboundRule}; iptables -C ${forwardReturnRule} || iptables -I ${forwardReturnRule}; iptables -t nat -C ${natRule} || iptables -t nat -A ${natRule}`,
    `PostDown = iptables -D ${forwardOutboundRule} || true; iptables -D ${forwardReturnRule} || true; iptables -t nat -D ${natRule} || true`,
    ""
  ];
  for (const peer of peers) {
    if (!peer.publicKey || !peer.assignedAddress || peer.status !== "active") continue;
    lines.push("[Peer]", `PublicKey = ${peer.publicKey}`, `AllowedIPs = ${peer.assignedAddress}`, "");
  }
  return lines.join("\n");
}

async function writeWireGuardConfig(content) {
  await run("sudo", ["install", "-m", "700", "-d", "/etc/wireguard"], { mutates: true });
  const existing = "/etc/wireguard/wg0.conf";
  try {
    await run("sudo", ["test", "-f", existing], { timeout: 2000 });
    await run("sudo", ["cp", existing, `${existing}.backup.${timestamp()}`], { mutates: true });
    log("Existing wg0.conf backup: created");
  } catch {
    log("Existing wg0.conf backup: not needed");
  }
  const temp = path.join(os.tmpdir(), `secure-access-wg0-${process.pid}.conf`);
  await fs.writeFile(temp, content, { mode: 0o600 });
  await run("sudo", ["install", "-m", "600", temp, existing], { mutates: true });
  await fs.rm(temp, { force: true });
}

async function enableIpv4Forwarding() {
  const temp = path.join(os.tmpdir(), `secure-access-sysctl-${process.pid}.conf`);
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
    await run("sudo", ["install", "-m", "644", temp, "/etc/sysctl.d/99-secure-access.conf"], { mutates: true });
  } finally {
    await fs.rm(temp, { force: true });
  }
  await run("sudo", ["sysctl", "-w", "net.ipv4.ip_forward=1"], { mutates: true });
  await run("sudo", ["sysctl", "--system"], { mutates: true });
}

async function serviceActive() {
  try {
    await execFileAsync("systemctl", ["is-active", "--quiet", "wg-quick@wg0"], { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

async function wgInterfacePresent() {
  try {
    await execFileAsync("ip", ["link", "show", "wg0"], { timeout: 2000 });
    return true;
  } catch {
    return false;
  }
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

async function portListening(port) {
  try {
    const { stdout } = await execFileAsync("ss", ["-lunp"], { timeout: 2000, maxBuffer: 1024 * 1024 });
    return stdout.includes(`:${port} `) || stdout.includes(`:${port}\n`);
  } catch {
    return false;
  }
}

async function ipForwardingEnabled() {
  try {
    const value = (await fs.readFile("/proc/sys/net/ipv4/ip_forward", "utf8")).trim();
    return value === "1";
  } catch {
    return false;
  }
}

async function wgShow() {
  try {
    return (await execFileAsync("sudo", ["wg", "show"], { timeout: 2000, maxBuffer: 1024 * 1024 })).stdout;
  } catch {
    return "";
  }
}

async function publicIpFallback() {
  if (process.env.VPS_PUBLIC_IP) return process.env.VPS_PUBLIC_IP;
  try {
    const response = await fetch("https://api.ipify.org?format=text");
    if (!response.ok) return null;
    const text = (await response.text()).trim();
    return text.length < 64 ? text : null;
  } catch {
    return null;
  }
}

async function ensureVpsUser(email) {
  const user = await prisma.user.findUnique({ where: { email } }) || await prisma.user.findFirst({ where: { role: { in: ["ADMIN", "OWNER", "admin", "owner"] } } });
  if (!user) throw new Error(`No admin user found for ${email}.`);
  const role = String(user.role).toLowerCase();
  return prisma.vpsUser.upsert({
    where: { email: user.email },
    update: { name: user.name || user.email, role: role === "admin" || role === "owner" ? "admin" : "operator", status: "active" },
    create: { name: user.name || user.email, email: user.email, role: role === "admin" || role === "owner" ? "admin" : "operator", status: "active" }
  });
}

async function applyProfile(endpoint, email) {
  const vpsUser = await ensureVpsUser(email);
  const existing = await prisma.vpsAccessProfile.findFirst({
    where: { endpointId: endpoint.id, userId: vpsUser.id, status: { in: ["active", "paused", "expired"] } },
    orderBy: { updatedAt: "desc" }
  });
  const assignedAddress = existing?.assignedAddress || await nextAssignedAddress(endpoint.id, endpoint.allowedIpTemplate);
  const expiresAt = new Date(Date.now() + Number(process.env.VPS_DEFAULT_PROFILE_EXPIRE_DAYS || 180) * 86_400_000);

  if (
    existing &&
    !rotateProfile &&
    existing.publicKey &&
    existing.encryptedPrivateKey &&
    existing.encryptedConfig &&
    existing.assignedAddress
  ) {
    const configText = buildClientConfig({
      peerPrivateKey: decryptText(existing.encryptedPrivateKey),
      assignedAddress: existing.assignedAddress,
      endpoint
    });
    return prisma.vpsAccessProfile.update({
      where: { id: existing.id },
      data: {
        name: existing.name || "我的 Secure Access Profile",
        deviceName: existing.deviceName || os.hostname(),
        deviceType: existing.deviceType || "client",
        status: "active",
        encryptedConfig: encryptText(configText),
        configVersion: { increment: 1 },
        expiresAt: existing.expiresAt && existing.expiresAt.getTime() > Date.now() ? existing.expiresAt : expiresAt,
        serverPeerStatus: "pending",
        peerApplied: false,
        serviceReloadedAfterPeer: false,
        serverAppliedAt: null,
        serverSyncError: null
      }
    });
  }

  const peer = await wgKeyPair();
  const configText = buildClientConfig({ peerPrivateKey: peer.privateKey, assignedAddress, endpoint });
  const data = {
    name: "我的 Secure Access Profile",
    deviceName: existing?.deviceName || os.hostname(),
    deviceType: existing?.deviceType || "client",
    status: "active",
    configType: "wireguard",
    publicKey: peer.publicKey,
    encryptedPrivateKey: encryptText(peer.privateKey),
    encryptedConfig: encryptText(configText),
    assignedAddress,
    serverPeerStatus: "pending",
    peerApplied: false,
    serviceReloadedAfterPeer: false,
    serverAppliedAt: null,
    serverSyncError: null,
    expiresAt,
    maxDevices: 1
  };
  return existing
    ? prisma.vpsAccessProfile.update({ where: { id: existing.id }, data: { ...data, configVersion: { increment: 1 } } })
    : prisma.vpsAccessProfile.create({ data: { endpointId: endpoint.id, userId: vpsUser.id, ...data } });
}

async function updateAudit(action, targetType, targetId, afterJson) {
  await prisma.vpsAuditLog.create({
    data: {
      actorEmail: process.env.ADMIN_EMAIL || "system",
      action,
      targetType,
      targetId,
      afterJson: JSON.stringify(afterJson),
      result: "success"
    }
  });
}

async function main() {
  log(`Mode: ${apply ? "apply" : "plan"}`);
  log("High-risk operations are gated behind --apply. Secrets and config private keys are never printed.");
  const { envPath, raw, values } = await loadEnv();
  await ensureEnvValues(envPath, raw, values);
  const publicHost = hostArg?.slice("--host=".length) || process.env.VPS_DEFAULT_ENDPOINT_HOST || "yaokai.me";
  const email = emailArg?.slice("--email=".length) || process.env.ADMIN_EMAIL || `admin@${publicHost}`;
  const listenPort = Number(process.env.VPS_DEFAULT_LISTEN_PORT || 51820);
  const dns = process.env.VPS_DEFAULT_DNS || "1.1.1.1";
  const mtu = Number(process.env.VPS_DEFAULT_MTU || 1280);
  const allowedIpTemplate = process.env.VPS_WG_ALLOWED_IPS || "10.66.0.0/24";
  const clientAllowedIps = process.env.VPS_CLIENT_ALLOWED_IPS || "0.0.0.0/0";
  const outboundInterface = await defaultRouteInterface();

  log("Planned system commands:");
  log("- sudo dnf install -y wireguard-tools (Amazon Linux) or apt equivalent");
  log("- sudo dnf install -y iptables-nft (Amazon Linux) or apt iptables equivalent when missing");
  log("- ip route show default");
  log("- sudo install -m 644 <generated> /etc/sysctl.d/99-secure-access.conf");
  log("- sudo sysctl -w net.ipv4.ip_forward=1");
  log("- sudo sysctl --system");
  log("- sudo install -m 700 -d /etc/wireguard");
  log("- sudo cp /etc/wireguard/wg0.conf /etc/wireguard/wg0.conf.backup.<timestamp> when existing");
  log(`- sudo install -m 600 <generated> /etc/wireguard/wg0.conf (NAT outbound interface: ${outboundInterface})`);
  log("- sudo systemctl enable wg-quick@wg0");
  log("- sudo systemctl restart wg-quick@wg0");
  log(`Impact: starts WireGuard interface wg0, listens on UDP ${listenPort}, and routes device traffic through the Endpoint.`);

  if (!apply) {
    log("Plan complete. Re-run with --apply to install and apply system configuration.");
    await prisma.$disconnect();
    return;
  }

  await ensureWireGuardTools();
  await ensureNatTools();
  const existingEndpoint = await prisma.vpsEndpoint.findFirst({ orderBy: { createdAt: "asc" } });
  const serverKey = await ensureServerKey(existingEndpoint);
  const publicIp = await publicIpFallback();
  const publicEntry = await resolvePublicEntry(publicHost, publicIp);
  const endpointBase = {
    name: `${os.hostname()} Secure Access Endpoint`,
    hostname: os.hostname(),
    publicHost,
    publicIp,
    status: "needs_initialization",
    configType: "wireguard",
    serverPublicKey: serverKey.publicKey,
    encryptedServerPrivateKey: encryptText(serverKey.privateKey),
    listenPort,
    dns,
    mtu,
    allowedIpTemplate,
    clientAllowedIps,
    operatingSystem: `${os.platform()} ${os.release()}`,
    architecture: os.arch(),
    defaultProfileExpireDays: Number(process.env.VPS_DEFAULT_PROFILE_EXPIRE_DAYS || 180),
    dryRun: !apply,
    allowSystemApply: apply,
    serviceConfigReady: false,
    serviceApplied: false,
    serviceRunning: false,
    wireGuardQuickInstalled: await commandExists("wg-quick"),
    wgInterfacePresent: await wgInterfacePresent(),
    portListening: false,
    ipForwardingEnabled: await ipForwardingEnabled(),
    publicHostResolved: publicEntry.publicHostResolved,
    publicHostResolvedIp: publicEntry.publicHostResolvedIp,
    systemInfo: JSON.stringify({
      hostname: os.hostname(),
      platform: os.platform(),
      release: os.release(),
      arch: os.arch(),
      node: process.version
    }),
    availablePorts: JSON.stringify([]),
    serviceStatus: "unknown",
    wireGuardInstalled: await commandExists("wg"),
    lastHealthCheckAt: new Date()
  };

  let endpoint = existingEndpoint
    ? await prisma.vpsEndpoint.update({ where: { id: existingEndpoint.id }, data: endpointBase })
    : await prisma.vpsEndpoint.create({ data: { id: DEFAULT_ENDPOINT_ID, ...endpointBase } });

  let profile = await applyProfile(endpoint, email);
  const peers = await prisma.vpsAccessProfile.findMany({
    where: { endpointId: endpoint.id, status: "active", publicKey: { not: null }, assignedAddress: { not: null } },
    select: { id: true, status: true, publicKey: true, assignedAddress: true }
  });
  await enableIpv4Forwarding();
  await writeWireGuardConfig(buildServerConfig({ serverPrivateKey: serverKey.privateKey, endpoint, peers, outboundInterface }));
  await run("sudo", ["systemctl", "enable", "wg-quick@wg0"], { mutates: true });
  await run("sudo", ["systemctl", "restart", "wg-quick@wg0"], { mutates: true });

  const show = await wgShow();
  const running = await serviceActive();
  const listening = await portListening(listenPort);
  const forwarding = await ipForwardingEnabled();
  const quickInstalled = await commandExists("wg-quick");
  const interfacePresent = await wgInterfacePresent();
  const endpointActive = running && listening && forwarding && quickInstalled && interfacePresent && publicEntry.publicHostResolved && show.includes("interface: wg0");
  endpoint = await prisma.vpsEndpoint.update({
    where: { id: endpoint.id },
    data: {
      status: endpointActive ? "active" : "needs_initialization",
      serviceStatus: endpointActive ? "active" : running ? "installed" : "unknown",
      wireGuardInstalled: true,
      dryRun: false,
      allowSystemApply: true,
      serviceConfigReady: endpointActive,
      serviceApplied: endpointActive,
      serviceRunning: running,
      wireGuardQuickInstalled: quickInstalled,
      wgInterfacePresent: interfacePresent,
      portListening: listening,
      ipForwardingEnabled: forwarding,
      publicHostResolved: publicEntry.publicHostResolved,
      publicHostResolvedIp: publicEntry.publicHostResolvedIp,
      availablePorts: JSON.stringify(listening ? [listenPort] : []),
      systemApplyError: endpointActive ? null : "WireGuard service, UDP port, or IPv4 forwarding is not ready.",
      serviceAppliedAt: endpointActive ? new Date() : null,
      lastHealthCheckAt: new Date()
    }
  });

  const peerApplied = Boolean(profile.publicKey && show.includes(profile.publicKey));
  profile = await prisma.vpsAccessProfile.update({
    where: { id: profile.id },
    data: {
      serverPeerStatus: peerApplied ? "applied" : "failed",
      peerApplied,
      serviceReloadedAfterPeer: running,
      serverAppliedAt: peerApplied ? new Date() : null,
      serverSyncError: peerApplied ? null : "Peer public key was not found in wg show after service restart."
    }
  });

  await updateAudit("endpoint_system_applied", "endpoint", endpoint.id, {
    status: endpoint.status,
    publicHost: endpoint.publicHost,
    listenPort: endpoint.listenPort,
    serviceRunning: endpoint.serviceRunning,
    portListening: endpoint.portListening,
    ipForwardingEnabled: endpoint.ipForwardingEnabled
  });
  await updateAudit("access_profile_peer_applied", "access_profile", profile.id, {
    status: profile.status,
    serverPeerStatus: profile.serverPeerStatus,
    peerApplied: profile.peerApplied,
    serviceReloadedAfterPeer: profile.serviceReloadedAfterPeer
  });

  log(`Endpoint status: ${endpoint.status}`);
  log(`WireGuard service active: ${running}`);
  log(`UDP ${listenPort} listening: ${listening}`);
  log(`Peer applied: ${peerApplied}`);
  log("No private keys or full configs were printed.");
  await prisma.$disconnect();
}

main().catch(async (error) => {
  try {
    const endpoint = await prisma.vpsEndpoint.findFirst({ orderBy: { createdAt: "asc" } });
    if (endpoint) {
      await prisma.vpsEndpoint.update({
        where: { id: endpoint.id },
        data: {
          status: "needs_initialization",
          serviceStatus: "unknown",
          systemApplyError: error instanceof Error ? error.message : "Secure Access system apply failed.",
          lastHealthCheckAt: new Date()
        }
      });
    }
  } catch {
    // Keep failure reporting focused on the original error.
  } finally {
    await prisma.$disconnect().catch(() => undefined);
  }
  fail(error instanceof Error ? error.message : "Secure Access system apply failed.");
});
