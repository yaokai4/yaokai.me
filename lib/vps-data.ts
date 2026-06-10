import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { z } from "zod";
import { getVpsResourceConfig, type VpsResourceConfig } from "@/lib/vps-config";
import { prisma } from "@/lib/prisma";
import { stringifyArray } from "@/lib/utils";
import { vpsResourceSchemas } from "@/lib/validations";
import { getRequestMeta } from "@/lib/security";

type Delegate = {
  findMany(args?: Record<string, unknown>): Promise<unknown[]>;
  findFirst(args?: Record<string, unknown>): Promise<unknown | null>;
  findUnique(args: Record<string, unknown>): Promise<unknown | null>;
  create(args: Record<string, unknown>): Promise<unknown>;
  update(args: Record<string, unknown>): Promise<unknown>;
  delete(args: Record<string, unknown>): Promise<unknown>;
  count(args?: Record<string, unknown>): Promise<number>;
};

export type AdminActor = {
  id: string;
  email: string;
  role: string;
};

const ownerRoles = new Set(["OWNER", "ADMIN", "owner", "admin"]);
const operatorRoles = new Set(["OPERATOR", "operator"]);
const auditorRoles = new Set(["AUDITOR", "auditor"]);
const adminOnlyResources = new Set(["users", "settings", "access-profile-downloads"]);

export function canManageVps(actor: AdminActor) {
  return ownerRoles.has(actor.role);
}

export function canOperateVps(actor: AdminActor) {
  return canManageVps(actor) || operatorRoles.has(actor.role);
}

export function canAuditVps(actor: AdminActor) {
  return canManageVps(actor) || auditorRoles.has(actor.role);
}

export function getDelegate(config: VpsResourceConfig) {
  const delegate = (prisma as unknown as Record<string, Delegate>)[config.model];
  if (!delegate) throw new Error(`Unknown Prisma delegate: ${config.model}`);
  return delegate;
}

export function canWriteVps(actor: AdminActor) {
  return canOperateVps(actor);
}

export function canReadVpsResource(actor: AdminActor, section: string) {
  if (canManageVps(actor)) return true;
  if (section === "audit-logs") return canAuditVps(actor);
  if (adminOnlyResources.has(section) || section === "access-profiles") return false;
  return canOperateVps(actor) || canAuditVps(actor);
}

export function canExportVpsAuditLogs(actor: AdminActor) {
  return canAuditVps(actor);
}

export function getVpsSchema(section: string) {
  return vpsResourceSchemas[section as keyof typeof vpsResourceSchemas] as z.ZodTypeAny | undefined;
}

function toDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeEmpty(value: unknown) {
  return value === "" ? null : value;
}

export function normalizeVpsPayload(section: string, input: unknown) {
  const config = getVpsResourceConfig(section);
  if (!config) throw new Error("Unknown VPS resource");

  const schema = getVpsSchema(section);
  const parsed = schema ? schema.parse(input) : input;
  const payload = { ...(parsed as Record<string, unknown>) };

  for (const field of config.arrayFields || []) {
    payload[field] = stringifyArray(payload[field]);
  }

  for (const field of config.dateFields || []) {
    if (field in payload) payload[field] = toDate(payload[field]);
  }

  for (const field of config.numberFields || []) {
    if (field in payload) {
      const value = payload[field];
      payload[field] = value === "" || value === null || value === undefined ? null : Number(value);
    }
  }

  for (const field of config.booleanFields || []) {
    if (field in payload) payload[field] = Boolean(payload[field]);
  }

  for (const field of config.fields) {
    if (field.type === "url" || field.type === "text" || field.type === "textarea") {
      if (field.name in payload) payload[field.name] = normalizeEmpty(payload[field.name]);
    }
  }

  return payload;
}

export function normalizeVpsRecord<T>(record: T): T {
  if (!record || typeof record !== "object") return record;
  return JSON.parse(JSON.stringify(record));
}

export function sanitizeVpsRecord<T>(record: T): T {
  if (!record || typeof record !== "object") return record;
  const item = { ...(record as Record<string, unknown>) };
  delete item.encryptedConfig;
  delete item.encryptedPrivateKey;
  delete item.encryptedServerPrivateKey;
  delete item.tokenHash;
  return item as T;
}

export async function listVpsRecords(section: string, searchParams?: URLSearchParams) {
  const config = getVpsResourceConfig(section);
  if (!config) throw new Error("Unknown VPS resource");

  const query = searchParams?.get("q")?.trim().toLowerCase();
  const status = searchParams?.get("status")?.trim();
  const delegate = getDelegate(config);
  const records = await delegate.findMany({
    orderBy: config.key === "audit-logs" ? { createdAt: "desc" } : { updatedAt: "desc" },
    take: 300
  });

  const normalized = records.map((record) => sanitizeVpsRecord(normalizeVpsRecord(record)));
  return normalized.filter((record) => {
    const item = record as Record<string, unknown>;
    if (status && !Object.values(item).some((value) => String(value) === status)) return false;
    if (!query) return true;
    return config.searchable.some((key) => String(item[key] || "").toLowerCase().includes(query));
  });
}

export async function getVpsRecord(section: string, id: string) {
  const config = getVpsResourceConfig(section);
  if (!config) throw new Error("Unknown VPS resource");
  return sanitizeVpsRecord(normalizeVpsRecord(await getDelegate(config).findUnique({ where: { id } })));
}

export async function createVpsRecord(section: string, input: unknown) {
  const config = getVpsResourceConfig(section);
  if (!config || config.readOnly) throw new Error("READ_ONLY_RESOURCE");
  return sanitizeVpsRecord(normalizeVpsRecord(await getDelegate(config).create({ data: normalizeVpsPayload(section, input) })));
}

export async function updateVpsRecord(section: string, id: string, input: unknown) {
  const config = getVpsResourceConfig(section);
  if (!config || config.readOnly) throw new Error("READ_ONLY_RESOURCE");
  return sanitizeVpsRecord(normalizeVpsRecord(await getDelegate(config).update({ where: { id }, data: normalizeVpsPayload(section, input) })));
}

export async function archiveOrDeleteVpsRecord(section: string, id: string) {
  const config = getVpsResourceConfig(section);
  if (!config || config.readOnly) throw new Error("READ_ONLY_RESOURCE");
  const delegate = getDelegate(config);

  if (config.archive) {
    const data: Record<string, unknown> = {};
    if (config.archive.statusField) {
      data[config.archive.statusField] = config.archive.statusValue === "false" ? false : config.archive.statusValue;
    }
    if (config.archive.dateField) data[config.archive.dateField] = new Date();
    return sanitizeVpsRecord(normalizeVpsRecord(await delegate.update({ where: { id }, data })));
  }

  await delegate.delete({ where: { id } });
  return { deleted: true };
}

export async function writeVpsAuditLog({
  request,
  actor,
  action,
  targetType,
  targetId,
  before,
  after,
  result = "success",
  errorMessage
}: {
  request?: Request;
  actor?: AdminActor | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  before?: unknown;
  after?: unknown;
  result?: "success" | "failure";
  errorMessage?: string;
}) {
  const meta = request ? getRequestMeta(request) : { ipHash: undefined, userAgent: undefined, requestId: undefined };

  try {
    await prisma.vpsAuditLog.create({
      data: {
        actorId: actor?.id,
        actorEmail: actor?.email,
        action,
        targetType,
        targetId: targetId || undefined,
        beforeJson: before ? JSON.stringify(sanitizeVpsRecord(normalizeVpsRecord(before))) : undefined,
        afterJson: after ? JSON.stringify(sanitizeVpsRecord(normalizeVpsRecord(after))) : undefined,
        result,
        errorMessage,
        ipHash: meta.ipHash,
        userAgent: meta.userAgent,
        requestId: meta.requestId
      }
    });
  } catch (error) {
    console.error("VPS audit log failed", error);
  }
}

export function vpsErrorMessage(error: unknown) {
  if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
    return "唯一字段已经存在。";
  }
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message || "输入内容无效。";
  }
  if (error instanceof Error) {
    if (error.message === "READ_ONLY_RESOURCE") return "这个资源只读，不能修改。";
    if (error.message === "CSRF_CHECK_FAILED") return "请求来源无效。";
    if (error.message === "ENDPOINT_PUBLIC_HOST_REQUIRED") return "Endpoint 缺少公网域名或 IP，请先在 Secure Access 设置中补充。";
    if (error.message === "ENDPOINT_SERVER_KEY_REQUIRED") return "Endpoint 尚未生成 server keypair，请先初始化 Endpoint。";
    if (error.message === "ENDPOINT_NOT_READY_FOR_PROFILE") return "Endpoint 尚未真正可用，不能生成或重新生成访问配置。请先完成公网入口、WireGuard 服务和健康检查。";
    if (error.message === "ENDPOINT_NOT_FOUND") return "尚未找到当前服务器 Endpoint。";
    if (error.message === "ENDPOINT_SYSTEM_APPLY_DISABLED") return "系统级应用未开启或仍处于 dry-run，不能同步服务端 peer。";
    if (error.message === "ROLE_CANNOT_GENERATE_PROFILE") return "当前角色不能生成或下载配置。";
    if (error.message === "NO_AVAILABLE_PROFILE_ADDRESS") return "Endpoint 可分配地址已经用完，请调整允许地址模板。";
    if (error.message === "ACCESS_PROFILE_REVOKED") return "访问配置已吊销。";
    if (error.message === "ACCESS_PROFILE_EXPIRED") return "访问配置已过期。";
    if (error.message === "ACCESS_PROFILE_NOT_USABLE") return "访问配置当前不可用，不能下载。请确认 Endpoint active、WireGuard 服务 active，且 peer 已应用到服务端。";
    if (error.message === "CONFIG_INCOMPLETE") return "CONFIG_INCOMPLETE：WireGuard .conf 缺少必要字段，已阻止显示或下载。";
    if (error.message === "SHADOWROCKET_CONFIG_INCOMPLETE") return "当前设备配置缺少 Shadowrocket 导入所需字段。";
    if (error.message === "SHADOWROCKET_ENDPOINT_INVALID") return "当前 Endpoint 地址格式不能用于 Shadowrocket 导入。";
    return process.env.NODE_ENV === "production" ? "系统出现了一点问题。" : error.message;
  }
  return "系统出现了一点问题。";
}

export function toCsv(records: unknown[]) {
  const rows = records.map((record) => record as Record<string, unknown>);
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll("\"", "\"\"")}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}
