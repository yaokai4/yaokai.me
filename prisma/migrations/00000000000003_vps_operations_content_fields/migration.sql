-- Extend content models for the long-running CMS surface.
ALTER TABLE "User" ADD COLUMN "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "failedLoginCnt" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" DATETIME;

ALTER TABLE "Article" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "Article" ADD COLUMN "readingTime" TEXT NOT NULL DEFAULT '5 min';
ALTER TABLE "Article" ADD COLUMN "ogImage" TEXT;
ALTER TABLE "Article" ADD COLUMN "relatedProjects" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Article" ADD COLUMN "relatedGuides" TEXT NOT NULL DEFAULT '[]';

ALTER TABLE "Project" ADD COLUMN "subtitle" TEXT;
ALTER TABLE "Project" ADD COLUMN "gallery" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "tags" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "background" TEXT;
ALTER TABLE "Project" ADD COLUMN "features" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "architecture" TEXT;
ALTER TABLE "Project" ADD COLUMN "metrics" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "lessons" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Project" ADD COLUMN "publishedAt" DATETIME;
ALTER TABLE "Project" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Project" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Project" ADD COLUMN "ogImage" TEXT;

ALTER TABLE "Message" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'UNREAD';
ALTER TABLE "Message" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'contact';
ALTER TABLE "Message" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "Message" ADD COLUMN "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "SiteSetting" ADD COLUMN "description" TEXT;

ALTER TABLE "Skill" ADD COLUMN "relatedProjects" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Skill" ADD COLUMN "relatedArticles" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Skill" ADD COLUMN "relatedGuides" TEXT NOT NULL DEFAULT '[]';

ALTER TABLE "Guide" ADD COLUMN "level" TEXT NOT NULL DEFAULT 'beginner';
ALTER TABLE "Guide" ADD COLUMN "steps" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Guide" ADD COLUMN "checklist" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "Guide" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Guide" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Guide" ADD COLUMN "ogImage" TEXT;

ALTER TABLE "Resource" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'link';
ALTER TABLE "NowItem" ADD COLUMN "progress" INTEGER NOT NULL DEFAULT 0;

-- VPS operations module.
CREATE TABLE "VpsNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "publicIp" TEXT,
    "privateIp" TEXT,
    "os" TEXT NOT NULL,
    "cpuCores" INTEGER NOT NULL DEFAULT 1,
    "memoryMb" INTEGER NOT NULL DEFAULT 1024,
    "diskGb" INTEGER NOT NULL DEFAULT 20,
    "bandwidthMb" INTEGER NOT NULL DEFAULT 100,
    "purpose" TEXT,
    "ownerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "cpuUsage" REAL NOT NULL DEFAULT 0,
    "memoryUsage" REAL NOT NULL DEFAULT 0,
    "diskUsage" REAL NOT NULL DEFAULT 0,
    "bandwidthUsage" REAL NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "expiresAt" DATETIME,
    "monthlyCost" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "lastCheckedAt" DATETIME,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "VpsService" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nodeId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'website',
    "domain" TEXT,
    "port" INTEGER,
    "healthCheckUrl" TEXT,
    "publicStatus" TEXT NOT NULL DEFAULT 'operational',
    "internalStatus" TEXT NOT NULL DEFAULT 'operational',
    "ownerName" TEXT,
    "deployMethod" TEXT,
    "runtime" TEXT,
    "version" TEXT,
    "repositoryUrl" TEXT,
    "lastDeployedAt" DATETIME,
    "certificateExp" DATETIME,
    "lastCheckedAt" DATETIME,
    "responseTimeMs" INTEGER,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "consecutiveSuccesses" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "disabledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VpsService_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "VpsNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "VpsUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'active',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" DATETIME,
    "failedLoginCnt" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "VpsAccessPolicy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "serviceId" TEXT,
    "permission" TEXT NOT NULL DEFAULT 'view',
    "startsAt" DATETIME,
    "expiresAt" DATETIME,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VpsAccessPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "VpsUser" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VpsAccessPolicy_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "VpsService" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "VpsAuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "beforeJson" TEXT,
    "afterJson" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "ipHash" TEXT,
    "userAgent" TEXT,
    "requestId" TEXT,
    "result" TEXT NOT NULL DEFAULT 'success',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "VpsAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'warning',
    "status" TEXT NOT NULL DEFAULT 'open',
    "source" TEXT NOT NULL,
    "nodeId" TEXT,
    "serviceId" TEXT,
    "accessProfileId" TEXT,
    "condition" TEXT NOT NULL,
    "triggeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "acknowledgedBy" TEXT,
    "acknowledgedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VpsAlert_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "VpsNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VpsAlert_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "VpsService" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VpsAlert_accessProfileId_fkey" FOREIGN KEY ("accessProfileId") REFERENCES "VpsAccessProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "VpsBackup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "nodeId" TEXT,
    "serviceId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'manual',
    "location" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "lastBackupAt" DATETIME,
    "lastStatus" TEXT NOT NULL DEFAULT 'unknown',
    "lastRestoreTestAt" DATETIME,
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VpsBackup_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "VpsNode" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "VpsBackup_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "VpsService" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "VpsCost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "nodeName" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "renewAt" DATETIME,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "invoiceUrl" TEXT,
    "project" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "VpsHealthCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "serviceId" TEXT,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTimeMs" INTEGER,
    "result" TEXT NOT NULL DEFAULT 'unknown',
    "errorMessage" TEXT,
    "checkedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VpsHealthCheck_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "VpsService" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "VpsNotificationSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "destinationLabel" TEXT,
    "events" TEXT NOT NULL DEFAULT '[]',
    "maintenanceWindow" TEXT,
    "lastTestedAt" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "VpsSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "VpsUser_email_key" ON "VpsUser"("email");
CREATE UNIQUE INDEX "VpsSetting_key_key" ON "VpsSetting"("key");
CREATE INDEX "VpsNode_status_provider_idx" ON "VpsNode"("status", "provider");
CREATE INDEX "VpsNode_expiresAt_idx" ON "VpsNode"("expiresAt");
CREATE INDEX "VpsService_publicStatus_internalStatus_idx" ON "VpsService"("publicStatus", "internalStatus");
CREATE INDEX "VpsService_nodeId_idx" ON "VpsService"("nodeId");
CREATE INDEX "VpsService_certificateExp_idx" ON "VpsService"("certificateExp");
CREATE INDEX "VpsUser_role_status_idx" ON "VpsUser"("role", "status");
CREATE INDEX "VpsAccessPolicy_enabled_expiresAt_idx" ON "VpsAccessPolicy"("enabled", "expiresAt");
CREATE INDEX "VpsAccessPolicy_userId_serviceId_idx" ON "VpsAccessPolicy"("userId", "serviceId");
CREATE INDEX "VpsAuditLog_action_createdAt_idx" ON "VpsAuditLog"("action", "createdAt");
CREATE INDEX "VpsAuditLog_targetType_targetId_idx" ON "VpsAuditLog"("targetType", "targetId");
CREATE INDEX "VpsAlert_status_level_idx" ON "VpsAlert"("status", "level");
CREATE INDEX "VpsAlert_nodeId_serviceId_idx" ON "VpsAlert"("nodeId", "serviceId");
CREATE INDEX "VpsAlert_accessProfileId_idx" ON "VpsAlert"("accessProfileId");
CREATE INDEX "VpsBackup_lastStatus_lastBackupAt_idx" ON "VpsBackup"("lastStatus", "lastBackupAt");
CREATE INDEX "VpsCost_provider_renewAt_idx" ON "VpsCost"("provider", "renewAt");
CREATE INDEX "VpsHealthCheck_serviceId_checkedAt_idx" ON "VpsHealthCheck"("serviceId", "checkedAt");
CREATE INDEX "VpsHealthCheck_result_checkedAt_idx" ON "VpsHealthCheck"("result", "checkedAt");
CREATE INDEX "VpsNotificationSetting_channel_enabled_idx" ON "VpsNotificationSetting"("channel", "enabled");

CREATE TABLE "VpsAccessProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "allowedServices" TEXT NOT NULL DEFAULT '[]',
    "allowedNodeIds" TEXT NOT NULL DEFAULT '[]',
    "allowedCidrs" TEXT NOT NULL DEFAULT '[]',
    "configType" TEXT NOT NULL DEFAULT 'Secure Access Config',
    "publicKey" TEXT,
    "encryptedConfig" TEXT,
    "configVersion" INTEGER NOT NULL DEFAULT 1,
    "maxDevices" INTEGER NOT NULL DEFAULT 1,
    "expiresAt" DATETIME NOT NULL,
    "lastUsedAt" DATETIME,
    "lastViewedAt" DATETIME,
    "lastDownloadedAt" DATETIME,
    "revokedAt" DATETIME,
    "revokedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VpsAccessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "VpsUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "VpsAccessProfileDownload" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "oneTimeTokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VpsAccessProfileDownload_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "VpsAccessProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "VpsAccessProfileDownload_oneTimeTokenHash_key" ON "VpsAccessProfileDownload"("oneTimeTokenHash");
CREATE INDEX "VpsAccessProfile_userId_status_idx" ON "VpsAccessProfile"("userId", "status");
CREATE INDEX "VpsAccessProfile_expiresAt_status_idx" ON "VpsAccessProfile"("expiresAt", "status");
CREATE INDEX "VpsAccessProfileDownload_profileId_createdAt_idx" ON "VpsAccessProfileDownload"("profileId", "createdAt");
CREATE INDEX "VpsAccessProfileDownload_expiresAt_usedAt_idx" ON "VpsAccessProfileDownload"("expiresAt", "usedAt");
