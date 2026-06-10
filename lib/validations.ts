import { z } from "zod";

export const loginSchema = z.object({
  account: z.string().trim().min(1, "请输入账号。"),
  password: z.string().min(6, "密码至少需要 6 个字符。")
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, "当前密码至少需要 6 个字符。"),
  newPassword: z.string().min(10, "新密码至少需要 10 个字符。")
});

export const articleSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "链接标识不能为空").regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, "链接标识只能包含中文、英文、数字和连字符。"),
  subtitle: z.string().optional().nullable(),
  excerpt: z.string().min(1, "摘要不能为空"),
  content: z.string().min(1, "正文不能为空"),
  coverImage: z.string().optional().nullable(),
  category: z.string().min(1, "分类不能为空"),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  readingTime: z.string().optional().default("5 min"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  relatedProjects: z.union([z.array(z.string()), z.string()]).optional(),
  relatedGuides: z.union([z.array(z.string()), z.string()]).optional(),
  publishedAt: z.string().optional().nullable()
});

export const projectSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "链接标识不能为空").regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, "链接标识只能包含中文、英文、数字和连字符。"),
  subtitle: z.string().optional().nullable(),
  excerpt: z.string().min(1, "摘要不能为空"),
  longDescription: z.string().optional().nullable(),
  content: z.string().min(1, "正文不能为空"),
  coverImage: z.string().optional().nullable(),
  gallery: z.union([z.array(z.string()), z.string()]).optional(),
  screenshots: z.union([z.array(z.string()), z.string()]).optional(),
  category: z.string().min(1, "分类不能为空"),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  status: z.string().min(1, "项目状态不能为空").default("Case Study"),
  techStack: z.union([z.array(z.string()), z.string()]).optional(),
  demoUrl: z.string().url("请输入有效演示链接。").optional().or(z.literal("")).nullable(),
  githubUrl: z.string().url("请输入有效 GitHub 链接。").optional().or(z.literal("")).nullable(),
  architectureNotes: z.string().optional().nullable(),
  role: z.string().min(1, "角色说明不能为空"),
  background: z.string().optional().nullable(),
  responsibilities: z.union([z.array(z.string()), z.string()]).optional(),
  challenge: z.string().min(1, "核心挑战不能为空"),
  keyChallenges: z.union([z.array(z.string()), z.string()]).optional(),
  solution: z.string().min(1, "解决方案不能为空"),
  solutions: z.union([z.array(z.string()), z.string()]).optional(),
  features: z.union([z.array(z.string()), z.string()]).optional(),
  architecture: z.string().optional().nullable(),
  technicalHighlights: z.union([z.array(z.string()), z.string()]).optional(),
  result: z.string().min(1, "最终结果不能为空"),
  metrics: z.union([z.array(z.string()), z.string()]).optional(),
  measurableResults: z.union([z.array(z.string()), z.string()]).optional(),
  lessons: z.union([z.array(z.string()), z.string()]).optional(),
  nextSteps: z.union([z.array(z.string()), z.string()]).optional(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0)
});

export const postSchema = z.object({
  content: z.string().min(1, "内容不能为空"),
  images: z.union([z.array(z.string()), z.string()]).optional(),
  visible: z.boolean().default(true)
});

export const messageSchema = z.object({
  name: z.string().min(2, "姓名至少需要 2 个字符。").max(80, "姓名不能超过 80 个字符。"),
  email: z.string().email("请输入有效邮箱。"),
  content: z.string().min(10, "留言至少需要 10 个字符。").max(2000, "留言不能超过 2000 个字符。"),
  source: z.string().max(200).optional().default("contact")
});

export const messageUpdateSchema = z.object({
  read: z.boolean().optional(),
  status: z.enum(["UNREAD", "READ", "REPLIED", "ARCHIVED"]).optional()
});

export const settingsSchema = z.record(z.string(), z.string());

export const guideSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  slug: z.string().min(1, "链接标识不能为空").regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, "链接标识只能包含中文、英文、数字和连字符。"),
  excerpt: z.string().min(1, "摘要不能为空"),
  content: z.string().min(1, "正文不能为空"),
  coverImage: z.string().optional().nullable(),
  category: z.string().min(1, "分类不能为空"),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  level: z.string().optional().default("beginner"),
  difficulty: z.string().min(1, "难度不能为空"),
  audience: z.string().min(1, "适合人群不能为空"),
  readingTime: z.string().min(1, "阅读时间不能为空"),
  steps: z.union([z.array(z.string()), z.string()]).optional(),
  checklist: z.union([z.array(z.string()), z.string()]).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  publishedAt: z.string().optional().nullable()
});

export const resourceSchema = z.object({
  title: z.string().min(1, "名称不能为空"),
  url: z.string().url("请输入有效链接。"),
  description: z.string().min(1, "描述不能为空"),
  type: z.string().optional().default("link"),
  category: z.string().min(1, "分类不能为空"),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
  reason: z.string().min(1, "推荐理由不能为空"),
  useCase: z.string().min(1, "使用场景不能为空"),
  featured: z.boolean().default(false)
});

export const nowItemSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().min(1, "描述不能为空"),
  type: z.string().min(1, "类型不能为空"),
  status: z.string().min(1, "状态不能为空"),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  sortOrder: z.coerce.number().int().default(0)
});

export const playbookSchema = z.object({
  title: z.string().min(1, "名称不能为空"),
  slug: z.string().min(1, "链接标识不能为空").regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, "链接标识只能包含中文、英文、数字和连字符。"),
  scenario: z.string().min(1, "适用场景不能为空"),
  principles: z.union([z.array(z.string()), z.string()]).optional(),
  steps: z.union([z.array(z.string()), z.string()]).optional(),
  example: z.string().min(1, "示例不能为空"),
  relatedLinks: z.union([z.array(z.string()), z.string()]).optional(),
  featured: z.boolean().default(false)
});

export const manifestoItemSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  content: z.string().min(1, "内容不能为空"),
  sortOrder: z.coerce.number().int().default(0),
  visible: z.boolean().default(true)
});

const nullableText = z.preprocess((value) => (value === "" ? null : value), z.string().optional().nullable());
const optionalDateInput = z.preprocess((value) => (value === "" ? null : value), z.string().optional().nullable());
const optionalNumber = z.preprocess((value) => (value === "" || value === null || value === undefined ? undefined : Number(value)), z.number().finite().optional());
const optionalInt = z.preprocess((value) => (value === "" || value === null || value === undefined ? undefined : Number(value)), z.number().int().optional());
const stringListInput = z.union([z.array(z.string()), z.string()]).optional();

export const vpsNodeSchema = z.object({
  name: z.string().min(1, "节点名称不能为空"),
  provider: z.string().min(1, "供应商不能为空"),
  region: z.string().min(1, "地区不能为空"),
  hostname: z.string().min(1, "主机名不能为空"),
  publicIp: nullableText,
  privateIp: nullableText,
  os: z.string().min(1, "操作系统不能为空"),
  cpuCores: optionalInt.default(1),
  memoryMb: optionalInt.default(1024),
  diskGb: optionalInt.default(20),
  bandwidthMb: optionalInt.default(100),
  purpose: nullableText,
  ownerName: nullableText,
  status: z.enum(["active", "warning", "offline", "maintenance", "retired"]).default("active"),
  cpuUsage: optionalNumber.default(0),
  memoryUsage: optionalNumber.default(0),
  diskUsage: optionalNumber.default(0),
  bandwidthUsage: optionalNumber.default(0),
  tags: stringListInput,
  expiresAt: optionalDateInput,
  monthlyCost: optionalNumber.default(0),
  notes: nullableText
});

export const vpsServiceSchema = z.object({
  nodeId: nullableText,
  name: z.string().min(1, "服务名称不能为空"),
  type: z.enum(["website", "api", "database", "worker", "cron", "storage", "monitoring", "admin_panel", "internal_tool", "other"]).default("website"),
  domain: nullableText,
  port: optionalInt.nullable(),
  healthCheckUrl: z.string().url("请输入有效健康检查 URL。").optional().or(z.literal("")).nullable(),
  publicStatus: z.enum(["operational", "degraded", "partial_outage", "major_outage", "maintenance", "disabled"]).default("operational"),
  internalStatus: z.enum(["operational", "degraded", "partial_outage", "major_outage", "maintenance", "disabled"]).default("operational"),
  ownerName: nullableText,
  deployMethod: nullableText,
  runtime: nullableText,
  version: nullableText,
  repositoryUrl: z.string().url("请输入有效仓库 URL。").optional().or(z.literal("")).nullable(),
  lastDeployedAt: optionalDateInput,
  certificateExp: optionalDateInput,
  notes: nullableText
});

export const vpsUserSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  email: z.string().email("请输入有效邮箱。"),
  role: z.enum(["owner", "admin", "operator", "viewer", "auditor"]).default("viewer"),
  status: z.enum(["active", "disabled", "invited", "suspended"]).default("active"),
  mfaEnabled: z.boolean().default(false),
  notes: nullableText
});

export const vpsAccessPolicySchema = z.object({
  name: z.string().min(1, "策略名称不能为空"),
  userId: nullableText,
  serviceId: nullableText,
  permission: z.enum(["view", "operate", "deploy", "restart", "maintain", "admin"]).default("view"),
  startsAt: optionalDateInput,
  expiresAt: optionalDateInput,
  enabled: z.boolean().default(true),
  approvedBy: nullableText,
  notes: nullableText
});

export const vpsEndpointSchema = z.object({
  name: z.string().min(1, "Endpoint 名称不能为空"),
  hostname: z.string().min(1, "主机名不能为空"),
  publicHost: nullableText,
  publicIp: nullableText,
  region: nullableText,
  status: z.enum(["active", "needs_initialization", "degraded", "offline"]).default("needs_initialization"),
  configType: z.enum(["wireguard"]).default("wireguard"),
  serverPublicKey: nullableText,
  listenPort: optionalInt.default(51820),
  dns: z.string().min(1, "DNS 不能为空").default("1.1.1.1"),
  mtu: optionalInt.nullable(),
  allowedIpTemplate: z.string().min(1, "允许地址模板不能为空").default("10.66.0.0/24"),
  clientAllowedIps: z.string().min(1, "设备路由范围不能为空").default("0.0.0.0/0"),
  operatingSystem: nullableText,
  architecture: nullableText,
  defaultProfileExpireDays: optionalInt.default(180),
  dryRun: z.boolean().default(true),
  allowSystemApply: z.boolean().default(false),
  serviceConfigReady: z.boolean().default(false),
  serviceApplied: z.boolean().default(false),
  serviceRunning: z.boolean().default(false),
  wireGuardQuickInstalled: z.boolean().default(false),
  wgInterfacePresent: z.boolean().default(false),
  portListening: z.boolean().default(false),
  ipForwardingEnabled: z.boolean().default(false),
  publicHostResolved: z.boolean().default(false),
  publicHostResolvedIp: nullableText,
  systemApplyError: nullableText,
  serviceAppliedAt: optionalDateInput,
  systemInfo: z.string().optional().default("{}"),
  availablePorts: z.string().optional().default("[]"),
  serviceStatus: z.string().optional().default("unknown"),
  wireGuardInstalled: z.boolean().default(false)
});

export const vpsAlertSchema = z.object({
  title: z.string().min(1, "告警标题不能为空"),
  level: z.enum(["info", "warning", "critical", "emergency"]).default("warning"),
  status: z.enum(["open", "acknowledged", "resolved", "ignored"]).default("open"),
  source: z.string().min(1, "来源不能为空"),
  nodeId: nullableText,
  serviceId: nullableText,
  accessProfileId: nullableText,
  condition: z.string().min(1, "触发条件不能为空"),
  triggeredAt: optionalDateInput,
  resolvedAt: optionalDateInput,
  acknowledgedBy: nullableText,
  acknowledgedAt: optionalDateInput,
  notes: nullableText
});

export const vpsBackupSchema = z.object({
  name: z.string().min(1, "备份名称不能为空"),
  nodeId: nullableText,
  serviceId: nullableText,
  type: z.enum(["database", "files", "config", "full_server", "snapshot", "manual"]).default("manual"),
  location: z.string().min(1, "备份位置不能为空"),
  frequency: z.string().min(1, "备份频率不能为空"),
  lastBackupAt: optionalDateInput,
  lastStatus: z.enum(["success", "failed", "running", "unknown"]).default("unknown"),
  lastRestoreTestAt: optionalDateInput,
  retentionDays: optionalInt.default(30),
  encrypted: z.boolean().default(true),
  notes: nullableText
});

export const vpsCostSchema = z.object({
  provider: z.string().min(1, "供应商不能为空"),
  nodeName: z.string().min(1, "节点名称不能为空"),
  billingCycle: z.string().min(1, "计费周期不能为空"),
  amount: z.coerce.number().finite().min(0),
  currency: z.string().min(1).default("USD"),
  renewAt: optionalDateInput,
  autoRenew: z.boolean().default(false),
  invoiceUrl: z.string().url("请输入有效账单 URL。").optional().or(z.literal("")).nullable(),
  project: nullableText,
  notes: nullableText
});

export const vpsSettingSchema = z.object({
  key: z.string().min(1, "键不能为空"),
  value: z.string().min(1, "值不能为空"),
  description: nullableText
});

export const vpsNotificationSettingSchema = z.object({
  channel: z.enum(["email", "telegram", "discord", "slack", "feishu", "webhook"]).default("email"),
  enabled: z.boolean().default(false),
  destinationLabel: nullableText,
  events: stringListInput,
  maintenanceWindow: nullableText,
  notes: nullableText
});

function maxOneHundredEightyDays(value: string | null | undefined) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  return date.getTime() <= Date.now() + 180 * 86_400_000;
}

export const vpsAccessProfileSchema = z.object({
  name: z.string().min(1, "配置名称不能为空"),
  userId: z.string().min(1, "必须绑定用户"),
  endpointId: z.string().min(1, "必须绑定 Endpoint"),
  deviceName: z.string().min(1, "必须绑定设备名称"),
  deviceType: nullableText,
  configType: z.enum(["wireguard"]).default("wireguard"),
  publicKey: nullableText,
  assignedAddress: nullableText,
  serverPeerStatus: z.enum(["pending", "applied", "failed", "not_applicable"]).default("pending"),
  serverAppliedAt: optionalDateInput,
  peerApplied: z.boolean().default(false),
  serviceReloadedAfterPeer: z.boolean().default(false),
  serverSyncError: nullableText,
  allowedServices: stringListInput,
  allowedNodeIds: stringListInput,
  allowedCidrs: stringListInput,
  expiresAt: z.string().refine(maxOneHundredEightyDays, "默认过期时间不能超过 180 天"),
  maxDevices: optionalInt.default(1),
  status: z.enum(["active", "paused", "expired", "revoked"]).default("active"),
  notes: nullableText
});

export const vpsResourceSchemas = {
  nodes: vpsNodeSchema,
  services: vpsServiceSchema,
  users: vpsUserSchema,
  policies: vpsAccessPolicySchema,
  endpoints: vpsEndpointSchema,
  "access-profiles": vpsAccessProfileSchema,
  alerts: vpsAlertSchema,
  backups: vpsBackupSchema,
  costs: vpsCostSchema,
  settings: vpsSettingSchema,
  notifications: vpsNotificationSettingSchema
};
