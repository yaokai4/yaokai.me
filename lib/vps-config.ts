export type VpsFieldType = "text" | "textarea" | "markdown" | "tags" | "checkbox" | "select" | "number" | "url" | "datetime";

export type VpsFieldConfig = {
  name: string;
  label: string;
  type: VpsFieldType;
  required?: boolean;
  options?: string[];
  full?: boolean;
};

export type VpsResourceConfig = {
  key: string;
  title: string;
  singular: string;
  description: string;
  model: string;
  auditTarget: string;
  endpoint: string;
  fields: VpsFieldConfig[];
  columns: string[];
  searchable: string[];
  dateFields?: string[];
  numberFields?: string[];
  arrayFields?: string[];
  booleanFields?: string[];
  readOnly?: boolean;
  archive?: {
    statusField?: string;
    statusValue?: string;
    dateField?: string;
  };
};

export const nodeStatuses = ["active", "warning", "offline", "maintenance", "retired"];
export const serviceTypes = ["website", "api", "database", "worker", "cron", "storage", "monitoring", "admin_panel", "internal_tool", "other"];
export const serviceStatuses = ["operational", "degraded", "partial_outage", "major_outage", "maintenance", "disabled"];
export const vpsRoles = ["owner", "admin", "operator", "viewer", "auditor"];
export const vpsUserStatuses = ["active", "disabled", "invited", "suspended"];
export const vpsPermissions = ["view", "operate", "deploy", "restart", "maintain", "admin"];
export const endpointStatuses = ["active", "needs_initialization", "degraded", "offline"];
export const accessProfilePeerStatuses = ["pending", "applied", "failed", "not_applicable"];
export const alertLevels = ["info", "warning", "critical", "emergency"];
export const alertStatuses = ["open", "acknowledged", "resolved", "ignored"];
export const backupTypes = ["database", "files", "config", "full_server", "snapshot", "manual"];
export const backupStatuses = ["success", "failed", "running", "unknown"];
export const notificationChannels = ["email", "telegram", "discord", "slack", "feishu", "webhook"];

const base = "/api/admin/vps";

export const vpsResourceConfigs = {
  endpoints: {
    key: "endpoints",
    title: "Secure Access Endpoints",
    singular: "Endpoint",
    description: "自动识别当前服务器环境，维护私有安全接入入口、服务状态、WireGuard 公钥和初始化状态。",
    model: "vpsEndpoint",
    auditTarget: "endpoint",
    endpoint: `${base}/endpoints`,
    fields: [
      { name: "name", label: "Endpoint 名称", type: "text", required: true },
      { name: "hostname", label: "主机名", type: "text", required: true },
      { name: "publicHost", label: "公网域名", type: "text" },
      { name: "publicIp", label: "公网 IP", type: "text" },
      { name: "region", label: "区域", type: "text" },
      { name: "status", label: "Endpoint 状态", type: "select", options: endpointStatuses },
      { name: "configType", label: "配置类型", type: "select", options: ["wireguard"] },
      { name: "serverPublicKey", label: "Server Public Key", type: "textarea", full: true },
      { name: "listenPort", label: "监听端口", type: "number" },
      { name: "dns", label: "DNS", type: "text" },
      { name: "mtu", label: "MTU", type: "number" },
      { name: "allowedIpTemplate", label: "允许地址模板", type: "text" },
      { name: "clientAllowedIps", label: "设备路由范围", type: "text" },
      { name: "operatingSystem", label: "操作系统", type: "text" },
      { name: "architecture", label: "架构", type: "text" },
      { name: "defaultProfileExpireDays", label: "默认有效期天数", type: "number" },
      { name: "dryRun", label: "Dry-run", type: "checkbox" },
      { name: "allowSystemApply", label: "允许系统应用", type: "checkbox" },
      { name: "serviceConfigReady", label: "服务配置就绪", type: "checkbox" },
      { name: "serviceApplied", label: "服务已应用", type: "checkbox" },
      { name: "serviceRunning", label: "服务运行中", type: "checkbox" },
      { name: "wireGuardQuickInstalled", label: "wg-quick 已安装", type: "checkbox" },
      { name: "wgInterfacePresent", label: "wg0 已存在", type: "checkbox" },
      { name: "portListening", label: "端口监听中", type: "checkbox" },
      { name: "ipForwardingEnabled", label: "IP Forwarding", type: "checkbox" },
      { name: "publicHostResolved", label: "公网入口已解析", type: "checkbox" },
      { name: "publicHostResolvedIp", label: "公网入口解析 IP", type: "text" },
      { name: "serviceStatus", label: "服务状态", type: "text" },
      { name: "wireGuardInstalled", label: "WireGuard 已安装", type: "checkbox" },
      { name: "serviceAppliedAt", label: "服务应用时间", type: "datetime" },
      { name: "systemApplyError", label: "系统应用错误", type: "textarea", full: true },
      { name: "availablePorts", label: "可用端口 JSON", type: "textarea", full: true },
      { name: "systemInfo", label: "系统信息 JSON", type: "textarea", full: true }
    ],
    columns: ["name", "hostname", "publicHost", "publicIp", "status", "serviceStatus", "portListening", "lastHealthCheckAt"],
    searchable: ["name", "hostname", "publicHost", "publicIp", "publicHostResolvedIp", "region", "status", "serviceStatus", "clientAllowedIps", "systemInfo", "systemApplyError"],
    dateFields: ["lastHealthCheckAt", "serviceAppliedAt"],
    numberFields: ["listenPort", "mtu", "defaultProfileExpireDays"],
    booleanFields: ["wireGuardInstalled", "wireGuardQuickInstalled", "wgInterfacePresent", "dryRun", "allowSystemApply", "serviceConfigReady", "serviceApplied", "serviceRunning", "portListening", "ipForwardingEnabled", "publicHostResolved"]
  },
  nodes: {
    key: "nodes",
    title: "节点管理",
    singular: "节点",
    description: "维护服务器资产、状态、到期时间、成本和资源指标。公开状态页不会显示 IP、端口或内部路径。",
    model: "vpsNode",
    auditTarget: "vps_node",
    endpoint: `${base}/nodes`,
    fields: [
      { name: "name", label: "节点名称", type: "text", required: true },
      { name: "provider", label: "供应商", type: "text", required: true },
      { name: "region", label: "地区", type: "text", required: true },
      { name: "hostname", label: "主机名", type: "text", required: true },
      { name: "publicIp", label: "公网 IP（仅后台）", type: "text" },
      { name: "privateIp", label: "内网 IP（仅后台）", type: "text" },
      { name: "os", label: "操作系统", type: "text", required: true },
      { name: "cpuCores", label: "CPU 核数", type: "number" },
      { name: "memoryMb", label: "内存 MB", type: "number" },
      { name: "diskGb", label: "磁盘 GB", type: "number" },
      { name: "bandwidthMb", label: "带宽 Mbps", type: "number" },
      { name: "purpose", label: "用途", type: "textarea", full: true },
      { name: "ownerName", label: "负责人", type: "text" },
      { name: "status", label: "状态", type: "select", options: nodeStatuses },
      { name: "cpuUsage", label: "CPU 使用率 %", type: "number" },
      { name: "memoryUsage", label: "内存使用率 %", type: "number" },
      { name: "diskUsage", label: "磁盘使用率 %", type: "number" },
      { name: "bandwidthUsage", label: "带宽使用率 %", type: "number" },
      { name: "tags", label: "标签", type: "tags", full: true },
      { name: "expiresAt", label: "到期时间", type: "datetime" },
      { name: "monthlyCost", label: "月成本", type: "number" },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["name", "provider", "region", "status", "ownerName", "expiresAt", "monthlyCost"],
    searchable: ["name", "provider", "region", "hostname", "ownerName", "tags", "notes"],
    dateFields: ["expiresAt", "lastCheckedAt", "archivedAt"],
    numberFields: ["cpuCores", "memoryMb", "diskGb", "bandwidthMb", "cpuUsage", "memoryUsage", "diskUsage", "bandwidthUsage", "monthlyCost"],
    arrayFields: ["tags"],
    archive: { statusField: "status", statusValue: "retired", dateField: "archivedAt" }
  },
  services: {
    key: "services",
    title: "服务管理",
    singular: "服务",
    description: "管理内部服务、健康检查 URL、部署信息和公开状态，不显示真实 secret。",
    model: "vpsService",
    auditTarget: "vps_service",
    endpoint: `${base}/services`,
    fields: [
      { name: "name", label: "服务名称", type: "text", required: true },
      { name: "nodeId", label: "所属节点 ID", type: "text" },
      { name: "type", label: "服务类型", type: "select", options: serviceTypes },
      { name: "domain", label: "域名", type: "text" },
      { name: "port", label: "端口（仅后台）", type: "number" },
      { name: "healthCheckUrl", label: "健康检查 URL", type: "url" },
      { name: "publicStatus", label: "公开状态", type: "select", options: serviceStatuses },
      { name: "internalStatus", label: "内部状态", type: "select", options: serviceStatuses },
      { name: "ownerName", label: "负责人", type: "text" },
      { name: "deployMethod", label: "部署方式", type: "text" },
      { name: "runtime", label: "运行时", type: "text" },
      { name: "version", label: "版本", type: "text" },
      { name: "repositoryUrl", label: "仓库 URL", type: "url" },
      { name: "lastDeployedAt", label: "最近部署", type: "datetime" },
      { name: "certificateExp", label: "证书到期", type: "datetime" },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["name", "type", "publicStatus", "internalStatus", "ownerName", "certificateExp", "lastCheckedAt"],
    searchable: ["name", "type", "domain", "ownerName", "runtime", "repositoryUrl", "notes"],
    dateFields: ["lastDeployedAt", "certificateExp", "lastCheckedAt", "disabledAt"],
    numberFields: ["port", "responseTimeMs", "consecutiveFailures", "consecutiveSuccesses"],
    archive: { statusField: "publicStatus", statusValue: "disabled", dateField: "disabledAt" }
  },
  users: {
    key: "users",
    title: "成员管理",
    singular: "成员",
    description: "维护团队内部服务成员、角色、状态和 MFA 预留字段。",
    model: "vpsUser",
    auditTarget: "vps_user",
    endpoint: `${base}/users`,
    fields: [
      { name: "name", label: "姓名", type: "text", required: true },
      { name: "email", label: "邮箱", type: "text", required: true },
      { name: "role", label: "角色", type: "select", options: vpsRoles },
      { name: "status", label: "状态", type: "select", options: vpsUserStatuses },
      { name: "mfaEnabled", label: "MFA 已启用", type: "checkbox" },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["name", "email", "role", "status", "mfaEnabled", "lastLoginAt"],
    searchable: ["name", "email", "role", "status", "notes"],
    dateFields: ["lastLoginAt"],
    numberFields: ["failedLoginCnt"],
    booleanFields: ["mfaEnabled"],
    archive: { statusField: "status", statusValue: "disabled" }
  },
  policies: {
    key: "policies",
    title: "访问策略",
    singular: "策略",
    description: "按需授权成员访问内部服务，支持权限过期和启用状态。",
    model: "vpsAccessPolicy",
    auditTarget: "vps_policy",
    endpoint: `${base}/policies`,
    fields: [
      { name: "name", label: "策略名称", type: "text", required: true },
      { name: "userId", label: "成员 ID", type: "text" },
      { name: "serviceId", label: "服务 ID", type: "text" },
      { name: "permission", label: "权限", type: "select", options: vpsPermissions },
      { name: "startsAt", label: "开始时间", type: "datetime" },
      { name: "expiresAt", label: "到期时间", type: "datetime" },
      { name: "enabled", label: "启用", type: "checkbox" },
      { name: "approvedBy", label: "批准人", type: "text" },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["name", "permission", "enabled", "approvedBy", "startsAt", "expiresAt"],
    searchable: ["name", "permission", "approvedBy", "notes"],
    dateFields: ["startsAt", "expiresAt"],
    booleanFields: ["enabled"],
    archive: { statusField: "enabled", statusValue: "false" }
  },
  "access-profiles": {
    key: "access-profiles",
    title: "Secure Access Profiles",
    singular: "访问配置",
    description: "私有访问配置的核心列表。每个 Access Profile 都绑定用户、设备、Endpoint 和过期时间，并支持审计、吊销和重新生成。",
    model: "vpsAccessProfile",
    auditTarget: "access_profile",
    endpoint: `${base}/access-profiles`,
    fields: [
      { name: "name", label: "配置名称", type: "text", required: true },
      { name: "userId", label: "所属用户 ID", type: "text", required: true },
      { name: "endpointId", label: "Endpoint ID", type: "text", required: true },
      { name: "deviceName", label: "绑定设备名称", type: "text", required: true },
      { name: "deviceType", label: "设备类型", type: "text" },
      { name: "configType", label: "配置类型", type: "select", options: ["wireguard"] },
      { name: "publicKey", label: "Device Public Key", type: "textarea", full: true },
      { name: "assignedAddress", label: "分配地址", type: "text" },
      { name: "serverPeerStatus", label: "服务端 Peer 状态", type: "select", options: accessProfilePeerStatuses },
      { name: "peerApplied", label: "Peer 已应用", type: "checkbox" },
      { name: "serviceReloadedAfterPeer", label: "服务已重载", type: "checkbox" },
      { name: "serverAppliedAt", label: "服务端应用时间", type: "datetime" },
      { name: "serverSyncError", label: "服务端同步错误", type: "textarea", full: true },
      { name: "expiresAt", label: "过期时间", type: "datetime", required: true },
      { name: "maxDevices", label: "最大设备数", type: "number" },
      { name: "status", label: "状态", type: "select", options: ["active", "paused", "expired", "revoked"] },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["name", "userId", "endpointId", "deviceName", "status", "serverPeerStatus", "peerApplied", "expiresAt", "lastDownloadedAt"],
    searchable: ["name", "userId", "endpointId", "deviceName", "deviceType", "publicKey", "assignedAddress", "status", "serverPeerStatus", "serverSyncError", "notes"],
    dateFields: ["expiresAt", "serverAppliedAt", "lastUsedAt", "lastViewedAt", "lastDownloadedAt", "revokedAt"],
    numberFields: ["maxDevices", "configVersion"],
    booleanFields: ["peerApplied", "serviceReloadedAfterPeer"],
    archive: { statusField: "status", statusValue: "revoked", dateField: "revokedAt" }
  },
  "audit-logs": {
    key: "audit-logs",
    title: "审计日志",
    singular: "审计日志",
    description: "记录登录、节点、服务、策略、备份、告警和设置变更。日志只读，不允许普通管理员删除。",
    model: "vpsAuditLog",
    auditTarget: "vps_audit_log",
    endpoint: `${base}/audit-logs`,
    fields: [
      { name: "action", label: "动作", type: "text", required: true },
      { name: "targetType", label: "对象类型", type: "text", required: true },
      { name: "targetId", label: "对象 ID", type: "text" },
      { name: "result", label: "结果", type: "text" },
      { name: "metadata", label: "元数据 JSON", type: "textarea", full: true }
    ],
    columns: ["createdAt", "actorEmail", "action", "targetType", "result"],
    searchable: ["actorEmail", "action", "targetType", "targetId", "result", "errorMessage"],
    readOnly: true
  },
  alerts: {
    key: "alerts",
    title: "告警中心",
    singular: "告警",
    description: "跟踪服务离线、资源过高、备份失败、证书到期和异常权限变更。",
    model: "vpsAlert",
    auditTarget: "vps_alert",
    endpoint: `${base}/alerts`,
    fields: [
      { name: "title", label: "标题", type: "text", required: true },
      { name: "level", label: "级别", type: "select", options: alertLevels },
      { name: "status", label: "状态", type: "select", options: alertStatuses },
      { name: "source", label: "来源", type: "text", required: true },
      { name: "nodeId", label: "节点 ID", type: "text" },
      { name: "serviceId", label: "服务 ID", type: "text" },
      { name: "accessProfileId", label: "访问配置 ID", type: "text" },
      { name: "condition", label: "触发条件", type: "textarea", required: true, full: true },
      { name: "triggeredAt", label: "触发时间", type: "datetime" },
      { name: "resolvedAt", label: "解决时间", type: "datetime" },
      { name: "acknowledgedBy", label: "确认人", type: "text" },
      { name: "acknowledgedAt", label: "确认时间", type: "datetime" },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["title", "level", "status", "source", "triggeredAt", "acknowledgedBy"],
    searchable: ["title", "level", "status", "source", "condition", "notes"],
    dateFields: ["triggeredAt", "resolvedAt", "acknowledgedAt"]
  },
  backups: {
    key: "backups",
    title: "备份恢复",
    singular: "备份",
    description: "记录备份状态、恢复测试、保留周期和加密情况。危险恢复操作仅留审计入口。",
    model: "vpsBackup",
    auditTarget: "vps_backup",
    endpoint: `${base}/backups`,
    fields: [
      { name: "name", label: "名称", type: "text", required: true },
      { name: "nodeId", label: "节点 ID", type: "text" },
      { name: "serviceId", label: "服务 ID", type: "text" },
      { name: "type", label: "类型", type: "select", options: backupTypes },
      { name: "location", label: "备份位置", type: "text", required: true },
      { name: "frequency", label: "频率", type: "text", required: true },
      { name: "lastBackupAt", label: "最近备份", type: "datetime" },
      { name: "lastStatus", label: "最近状态", type: "select", options: backupStatuses },
      { name: "lastRestoreTestAt", label: "最近恢复测试", type: "datetime" },
      { name: "retentionDays", label: "保留天数", type: "number" },
      { name: "encrypted", label: "已加密", type: "checkbox" },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["name", "type", "lastStatus", "lastBackupAt", "lastRestoreTestAt", "encrypted"],
    searchable: ["name", "type", "location", "frequency", "lastStatus", "notes"],
    dateFields: ["lastBackupAt", "lastRestoreTestAt"],
    numberFields: ["retentionDays"],
    booleanFields: ["encrypted"]
  },
  costs: {
    key: "costs",
    title: "成本续费",
    singular: "成本记录",
    description: "记录供应商账单、续费日期、自动续费和项目归属，支持后续导出 CSV。",
    model: "vpsCost",
    auditTarget: "vps_cost",
    endpoint: `${base}/costs`,
    fields: [
      { name: "provider", label: "供应商", type: "text", required: true },
      { name: "nodeName", label: "节点名称", type: "text", required: true },
      { name: "billingCycle", label: "计费周期", type: "text", required: true },
      { name: "amount", label: "金额", type: "number" },
      { name: "currency", label: "币种", type: "text" },
      { name: "renewAt", label: "续费时间", type: "datetime" },
      { name: "autoRenew", label: "自动续费", type: "checkbox" },
      { name: "invoiceUrl", label: "账单 URL", type: "url" },
      { name: "project", label: "项目", type: "text" },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["provider", "nodeName", "amount", "currency", "renewAt", "autoRenew"],
    searchable: ["provider", "nodeName", "billingCycle", "currency", "project", "notes"],
    dateFields: ["renewAt"],
    numberFields: ["amount"],
    booleanFields: ["autoRenew"]
  },
  settings: {
    key: "settings",
    title: "VPS 设置",
    singular: "设置",
    description: "维护运维模块配置和通知渠道标签，不存储明文 secret。",
    model: "vpsSetting",
    auditTarget: "vps_setting",
    endpoint: `${base}/settings`,
    fields: [
      { name: "key", label: "键", type: "text", required: true },
      { name: "value", label: "值", type: "textarea", required: true, full: true },
      { name: "description", label: "说明", type: "textarea", full: true }
    ],
    columns: ["key", "value", "description", "updatedAt"],
    searchable: ["key", "value", "description"]
  },
  notifications: {
    key: "notifications",
    title: "通知配置",
    singular: "通知配置",
    description: "配置 Email、Telegram、Discord、Slack、飞书或通用 Webhook 的事件标签，不在数据库中保存 secret。",
    model: "vpsNotificationSetting",
    auditTarget: "vps_notification",
    endpoint: `${base}/notifications`,
    fields: [
      { name: "channel", label: "渠道", type: "select", options: notificationChannels },
      { name: "enabled", label: "启用", type: "checkbox" },
      { name: "destinationLabel", label: "目的地标签", type: "text" },
      { name: "events", label: "事件", type: "tags", full: true },
      { name: "maintenanceWindow", label: "维护静默窗口", type: "text" },
      { name: "notes", label: "备注", type: "textarea", full: true }
    ],
    columns: ["channel", "enabled", "destinationLabel", "events", "lastTestedAt"],
    searchable: ["channel", "destinationLabel", "events", "notes"],
    dateFields: ["lastTestedAt"],
    arrayFields: ["events"],
    booleanFields: ["enabled"]
  }
} satisfies Record<string, VpsResourceConfig>;

export type VpsSection = keyof typeof vpsResourceConfigs;

export function getVpsResourceConfig(section: string) {
  return (vpsResourceConfigs as Record<string, VpsResourceConfig>)[section] || null;
}

export function isKnownVpsSection(section: string): section is VpsSection {
  return section in vpsResourceConfigs;
}

export const vpsAdminSections = [
  ["endpoints", "Endpoints"],
  ["access-profiles", "访问配置"],
  ["settings", "设置"],
  ["audit-logs", "审计"],
  ["nodes", "节点"],
  ["services", "服务"],
  ["users", "成员"],
  ["policies", "策略"],
  ["alerts", "告警"],
  ["backups", "备份"],
  ["costs", "成本"],
  ["notifications", "通知"]
] as const;
