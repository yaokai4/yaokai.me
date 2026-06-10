import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";
import { decryptText, encryptText, randomToken } from "@/lib/secure-config";
import { getSecureAccessReadiness } from "@/lib/secure-access-readiness";
import { getRequestMeta, hashValue } from "@/lib/security";
import { parseJsonArray, stringifyArray } from "@/lib/utils";
import { ensureCurrentEndpoint } from "@/lib/vps-endpoint";
import { vpsAccessProfileSchema } from "@/lib/validations";
import { syncWireGuardEndpointConfig } from "@/lib/wireguard-system";
import type { AdminActor } from "@/lib/vps-data";

export const ACCESS_PROFILE_STATUSES = ["active", "paused", "expired", "revoked"] as const;
const PROFILE_TTL_DAYS = 180;

type ProfileRecord = Record<string, unknown> & {
  id: string;
  name: string;
  deviceName: string;
  status: string;
  expiresAt: Date;
  encryptedConfig?: string | null;
  encryptedPrivateKey?: string | null;
  serverPeerStatus?: string | null;
  configText?: string;
  allowedServices?: string | null;
  allowedNodeIds?: string | null;
  allowedCidrs?: string | null;
};

export function canManageAccessProfiles(actor: AdminActor) {
  return ["ADMIN", "OWNER", "owner", "admin"].includes(actor.role);
}

export function canUseOwnAccessProfile(actor: AdminActor) {
  return !["VIEWER", "AUDITOR", "viewer", "auditor"].includes(actor.role);
}

export function canDownloadAccessProfile(actor: AdminActor, profileUserEmail?: string | null) {
  if (!canUseOwnAccessProfile(actor)) return false;
  return canManageAccessProfiles(actor) || Boolean(profileUserEmail && profileUserEmail === actor.email);
}

export function sanitizeAccessProfile<T extends ProfileRecord | null>(profile: T, includeConfig = false) {
  if (!profile) return null;
  const safe = { ...profile };
  delete safe.encryptedConfig;
  delete safe.encryptedPrivateKey;
  if (safe.endpoint && typeof safe.endpoint === "object") {
    const endpoint = { ...(safe.endpoint as Record<string, unknown>) };
    delete endpoint.encryptedServerPrivateKey;
    safe.endpoint = endpoint;
  }
  if (!includeConfig) delete safe.configText;
  return {
    ...safe,
    allowedServices: parseJsonArray(String(profile.allowedServices || "[]")),
    allowedNodeIds: parseJsonArray(String(profile.allowedNodeIds || "[]")),
    allowedCidrs: parseJsonArray(String(profile.allowedCidrs || "[]"))
  };
}

export function accessProfilePayload(input: unknown) {
  const parsed = vpsAccessProfileSchema.parse(input);
  return {
    ...parsed,
    allowedServices: stringifyArray(parsed.allowedServices),
    allowedNodeIds: stringifyArray(parsed.allowedNodeIds),
    allowedCidrs: stringifyArray(parsed.allowedCidrs),
    expiresAt: new Date(parsed.expiresAt),
    deviceType: parsed.deviceType || null,
    notes: parsed.notes || null
  };
}

export async function actorCanViewProfile(actor: AdminActor, profileId: string) {
  if (canManageAccessProfiles(actor) || ["AUDITOR", "auditor"].includes(actor.role)) return true;
  const profile = await prisma.vpsAccessProfile.findUnique({
    where: { id: profileId },
    include: { user: { select: { email: true } } }
  });
  return profile?.user.email === actor.email;
}

export async function ensureVpsIdentity(actor: AdminActor & { name?: string | null }) {
  const role = actor.role.toLowerCase();
  const mappedRole = role === "admin" || role === "owner" ? "admin" : role === "auditor" ? "auditor" : role === "viewer" ? "viewer" : "operator";
  return prisma.vpsUser.upsert({
    where: { email: actor.email },
    update: {
      name: actor.name || actor.email,
      role: mappedRole,
      status: "active"
    },
    create: {
      name: actor.name || actor.email,
      email: actor.email,
      role: mappedRole,
      status: "active"
    }
  });
}

function generateWireGuardKeyPair() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("x25519");
  const privateDer = privateKey.export({ format: "der", type: "pkcs8" }) as Buffer;
  const publicDer = publicKey.export({ format: "der", type: "spki" }) as Buffer;
  return {
    privateKey: privateDer.subarray(-32).toString("base64"),
    publicKey: publicDer.subarray(-32).toString("base64")
  };
}

export function generateServerKeyPair() {
  return generateWireGuardKeyPair();
}

function endpointHost(endpoint: { publicHost: string | null; publicIp: string | null }) {
  return endpoint.publicHost || endpoint.publicIp || "";
}

function subnetPrefix(cidr: string) {
  const [address] = cidr.split("/");
  const parts = address.split(".");
  if (parts.length !== 4) return "10.66.0";
  return parts.slice(0, 3).join(".");
}

async function nextAssignedAddress(endpointId: string, allowedIpTemplate: string) {
  const prefix = subnetPrefix(allowedIpTemplate);
  const profiles = await prisma.vpsAccessProfile.findMany({
    where: {
      endpointId,
      assignedAddress: { not: null },
      status: { not: "revoked" }
    },
    select: { assignedAddress: true }
  });
  const used = new Set(profiles.map((profile) => profile.assignedAddress).filter(Boolean));
  for (let index = 2; index < 255; index += 1) {
    const address = `${prefix}.${index}/32`;
    if (!used.has(address)) return address;
  }
  throw new Error("NO_AVAILABLE_PROFILE_ADDRESS");
}

function buildWireGuardConfig({
  peerPrivateKey,
  assignedAddress,
  endpoint,
  keepalive = 25
}: {
  peerPrivateKey: string;
  assignedAddress: string;
  endpoint: {
    publicHost: string | null;
    publicIp: string | null;
    serverPublicKey: string | null;
    listenPort: number;
    dns: string;
    mtu: number | null;
    allowedIpTemplate: string;
    clientAllowedIps?: string | null;
  };
  keepalive?: number;
}) {
  const host = endpointHost(endpoint);
  if (!host) throw new Error("ENDPOINT_PUBLIC_HOST_REQUIRED");
  if (!endpoint.serverPublicKey) throw new Error("ENDPOINT_SERVER_KEY_REQUIRED");

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
    `Endpoint = ${host}:${endpoint.listenPort}`,
    `PersistentKeepalive = ${keepalive}`
  ].filter((line) => line !== "").join("\n") + "\n";
}

export function decryptAccessProfileConfig(encryptedConfig: string) {
  return decryptText(encryptedConfig);
}

export function validateWireGuardConfigText(configText: string) {
  const requiredPatterns = [
    /^\[Interface\]$/m,
    /^PrivateKey = \S+$/m,
    /^Address = \S+$/m,
    /^DNS = \S+$/m,
    /^\[Peer\]$/m,
    /^PublicKey = \S+$/m,
    /^AllowedIPs = [0-9a-fA-F:./,\s]+$/m,
    /^Endpoint = [^:\s]+:\d+$/m,
    /^PersistentKeepalive = 25$/m
  ];
  return requiredPatterns.every((pattern) => pattern.test(configText));
}

export function assertCompleteWireGuardConfig(configText: string) {
  if (!validateWireGuardConfigText(configText)) throw new Error("CONFIG_INCOMPLETE");
}

export function createDownloadTokenHash(token: string) {
  return hashValue(`access-profile-download:${token}`);
}

export function createShadowrocketTokenHash(token: string) {
  return hashValue(`access-profile-shadowrocket:${token}`);
}

export function defaultProfileExpiry() {
  const days = Number(process.env.VPS_DEFAULT_PROFILE_EXPIRE_DAYS || PROFILE_TTL_DAYS);
  return new Date(Date.now() + days * 86_400_000);
}

async function syncEndpointIfSystemApplyEnabled(endpointId: string) {
  const endpoint = await prisma.vpsEndpoint.findUnique({
    where: { id: endpointId },
    select: { dryRun: true, allowSystemApply: true }
  });
  if (endpoint?.dryRun === false && endpoint.allowSystemApply === true) {
    await syncWireGuardEndpointConfig(endpointId);
  }
}

export async function buildSecureAccessConfig(profileId: string, assignedAddress?: string) {
  const profile = await prisma.vpsAccessProfile.findUnique({
    where: { id: profileId },
    include: {
      endpoint: true,
      user: { select: { email: true, name: true } }
    }
  });
  if (!profile) throw new Error("ACCESS_PROFILE_NOT_FOUND");
  if (profile.status === "revoked" || profile.revokedAt) throw new Error("ACCESS_PROFILE_REVOKED");
  if (profile.expiresAt.getTime() <= Date.now()) throw new Error("ACCESS_PROFILE_EXPIRED");
  const endpointReadiness = getSecureAccessReadiness(profile.endpoint, null);
  if (!endpointReadiness.canGenerateProfile) throw new Error("ENDPOINT_NOT_READY_FOR_PROFILE");

  const peer = generateWireGuardKeyPair();
  const address = assignedAddress || profile.assignedAddress || await nextAssignedAddress(profile.endpointId, profile.endpoint.allowedIpTemplate);
  const configText = buildWireGuardConfig({
    peerPrivateKey: peer.privateKey,
    assignedAddress: address,
    endpoint: profile.endpoint
  });

  return {
    publicKey: peer.publicKey,
    privateKey: peer.privateKey,
    assignedAddress: address,
    configText
  };
}

export async function rotateAccessProfile(profileId: string) {
  const generated = await buildSecureAccessConfig(profileId);
  const profile = await prisma.vpsAccessProfile.update({
    where: { id: profileId },
    data: {
      publicKey: generated.publicKey,
      encryptedPrivateKey: encryptText(generated.privateKey),
      encryptedConfig: encryptText(generated.configText),
      assignedAddress: generated.assignedAddress,
      configType: "wireguard",
      serverPeerStatus: "pending",
      serverAppliedAt: null,
      peerApplied: false,
      serviceReloadedAfterPeer: false,
      serverSyncError: null,
      status: "active",
      configVersion: { increment: 1 }
    }
  });
  await syncEndpointIfSystemApplyEnabled(profile.endpointId);
  return prisma.vpsAccessProfile.findUniqueOrThrow({ where: { id: profileId } });
}

export async function getDecryptedProfileConfig(profileId: string) {
  const profile = await prisma.vpsAccessProfile.findUnique({
    where: { id: profileId },
    select: { encryptedConfig: true }
  });
  if (!profile?.encryptedConfig) return null;
  return decryptAccessProfileConfig(profile.encryptedConfig);
}

export async function getMyAccessProfile(actor: AdminActor & { name?: string | null }, includeConfig = true) {
  const vpsUser = await ensureVpsIdentity(actor);
  const profile = await prisma.vpsAccessProfile.findFirst({
    where: {
      userId: vpsUser.id,
      status: { not: "revoked" }
    },
    include: {
      endpoint: true,
      downloads: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, requestedBy: true, expiresAt: true, usedAt: true, createdAt: true, ipHash: true, userAgent: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
  if (!profile) return null;
  const status = profile.expiresAt.getTime() <= Date.now() && profile.status !== "revoked" ? "expired" : profile.status;
  const readiness = getSecureAccessReadiness(profile.endpoint, { ...profile, status });
  let configText: string | undefined;
  if (includeConfig && readiness.canShowConfig && profile.encryptedConfig) {
    const decrypted = decryptAccessProfileConfig(profile.encryptedConfig);
    configText = validateWireGuardConfigText(decrypted) ? decrypted : undefined;
  }
  return sanitizeAccessProfile({ ...profile, status, configText } as ProfileRecord, includeConfig);
}

export async function generateMyAccessProfile({
  actor,
  request,
  deviceName,
  deviceType,
  expiresAt
}: {
  actor: AdminActor & { name?: string | null };
  request?: Request;
  deviceName?: string | null;
  deviceType?: string | null;
  expiresAt?: Date | null;
}) {
  if (!canUseOwnAccessProfile(actor)) throw new Error("ROLE_CANNOT_GENERATE_PROFILE");
  const [vpsUser, endpoint] = await Promise.all([
    ensureVpsIdentity(actor),
    ensureCurrentEndpoint({ request, actor, initializeKeys: true })
  ]);
  const endpointReadiness = getSecureAccessReadiness(endpoint, null);
  if (!endpointReadiness.canGenerateProfile) throw new Error("ENDPOINT_NOT_READY_FOR_PROFILE");
  const expiry = expiresAt || defaultProfileExpiry();
  const existing = await prisma.vpsAccessProfile.findFirst({
    where: {
      userId: vpsUser.id,
      endpointId: endpoint.id,
      status: { in: ["active", "paused", "expired"] }
    },
    orderBy: { updatedAt: "desc" }
  });
  const profile = existing
    ? await prisma.vpsAccessProfile.update({
      where: { id: existing.id },
      data: {
        name: "我的 Secure Access Profile",
        deviceName: deviceName || existing.deviceName || "Personal Device",
        deviceType: deviceType || existing.deviceType,
        status: "active",
        expiresAt: expiry,
        revokedAt: null,
        revokedBy: null
      }
    })
    : await prisma.vpsAccessProfile.create({
      data: {
        endpointId: endpoint.id,
        userId: vpsUser.id,
        name: "我的 Secure Access Profile",
        deviceName: deviceName || "Personal Device",
        deviceType: deviceType || "client",
        status: "active",
        configType: "wireguard",
        expiresAt: expiry,
        maxDevices: 1
      }
    });

  return rotateAccessProfile(profile.id);
}

export async function revokeAccessProfile(profileId: string, actor: AdminActor) {
  const profile = await prisma.vpsAccessProfile.update({
    where: { id: profileId },
    data: {
      status: "revoked",
      revokedAt: new Date(),
      revokedBy: actor.email,
      peerApplied: false,
      serviceReloadedAfterPeer: false,
      serverPeerStatus: "pending",
      serverAppliedAt: null
    }
  });
  await syncEndpointIfSystemApplyEnabled(profile.endpointId);
  return prisma.vpsAccessProfile.findUniqueOrThrow({ where: { id: profileId } });
}

export async function pauseAccessProfile(profileId: string) {
  const profile = await prisma.vpsAccessProfile.update({
    where: { id: profileId },
    data: {
      status: "paused",
      peerApplied: false,
      serverPeerStatus: "pending",
      serverAppliedAt: null
    }
  });
  await syncEndpointIfSystemApplyEnabled(profile.endpointId);
  return prisma.vpsAccessProfile.findUniqueOrThrow({ where: { id: profileId } });
}

export async function activateAccessProfile(profileId: string) {
  const profile = await prisma.vpsAccessProfile.update({
    where: { id: profileId },
    data: {
      status: "active",
      revokedAt: null,
      revokedBy: null,
      serverPeerStatus: "pending",
      peerApplied: false,
      serviceReloadedAfterPeer: false,
      serverAppliedAt: null
    }
  });
  await syncEndpointIfSystemApplyEnabled(profile.endpointId);
  return prisma.vpsAccessProfile.findUniqueOrThrow({ where: { id: profileId } });
}

export async function assertProfileDownloadable(profileId: string) {
  const profile = await prisma.vpsAccessProfile.findUnique({
    where: { id: profileId },
    include: { endpoint: true }
  });
  if (!profile) throw new Error("ACCESS_PROFILE_NOT_FOUND");
  const readiness = getSecureAccessReadiness(profile.endpoint, profile);
  if (!readiness.canDownloadConfig) throw new Error("ACCESS_PROFILE_NOT_USABLE");
  if (!profile.encryptedConfig) throw new Error("CONFIG_INCOMPLETE");
  assertCompleteWireGuardConfig(decryptAccessProfileConfig(profile.encryptedConfig));
  return profile;
}

export async function createProfileDownloadToken({
  profileId,
  actor,
  request
}: {
  profileId: string;
  actor: AdminActor;
  request?: Request;
}) {
  const token = randomToken(32);
  const meta = request
    ? getRequestMeta(request)
    : { ipHash: undefined, userAgent: undefined };
  const download = await prisma.vpsAccessProfileDownload.create({
    data: {
      profileId,
      requestedBy: actor.email,
      tokenHash: createDownloadTokenHash(token),
      expiresAt: new Date(Date.now() + Number(process.env.VPS_ONE_TIME_TOKEN_MINUTES || 10) * 60_000),
      ipHash: meta.ipHash,
      userAgent: meta.userAgent
    }
  });
  return {
    token,
    download,
    downloadUrl: `/api/vps/access/download/${token}`
  };
}

export async function createProfileShadowrocketToken({
  profileId,
  actor,
  request
}: {
  profileId: string;
  actor: AdminActor;
  request?: Request;
}) {
  const token = randomToken(32);
  const meta = request
    ? getRequestMeta(request)
    : { ipHash: undefined, userAgent: undefined };
  const download = await prisma.vpsAccessProfileDownload.create({
    data: {
      profileId,
      requestedBy: actor.email,
      tokenHash: createShadowrocketTokenHash(token),
      expiresAt: new Date(Date.now() + Number(process.env.VPS_ONE_TIME_TOKEN_MINUTES || 10) * 60_000),
      ipHash: meta.ipHash,
      userAgent: meta.userAgent
    }
  });
  return {
    token,
    download,
    importUrl: `/api/vps/access/shadowrocket/${token}`
  };
}
