-- Extend content models for the long-running CMS surface.
ALTER TABLE "User" ADD COLUMN "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "failedLoginCnt" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

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
ALTER TABLE "Project" ADD COLUMN "publishedAt" TIMESTAMP(3);
ALTER TABLE "Project" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Project" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Project" ADD COLUMN "ogImage" TEXT;

ALTER TABLE "Message" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'UNREAD';
ALTER TABLE "Message" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'contact';
ALTER TABLE "Message" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "Message" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

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
    "id" TEXT NOT NULL,
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
    "cpuUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "memoryUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "diskUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bandwidthUsage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "expiresAt" TIMESTAMP(3),
    "monthlyCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "lastCheckedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsNode_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsService" (
    "id" TEXT NOT NULL,
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
    "lastDeployedAt" TIMESTAMP(3),
    "certificateExp" TIMESTAMP(3),
    "lastCheckedAt" TIMESTAMP(3),
    "responseTimeMs" INTEGER,
    "consecutiveFailures" INTEGER NOT NULL DEFAULT 0,
    "consecutiveSuccesses" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsService_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "status" TEXT NOT NULL DEFAULT 'active',
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "failedLoginCnt" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsAccessPolicy" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT,
    "serviceId" TEXT,
    "permission" TEXT NOT NULL DEFAULT 'view',
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsAccessPolicy_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsAuditLog" (
    "id" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VpsAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsAlert" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'warning',
    "status" TEXT NOT NULL DEFAULT 'open',
    "source" TEXT NOT NULL,
    "nodeId" TEXT,
    "serviceId" TEXT,
    "accessProfileId" TEXT,
    "condition" TEXT NOT NULL,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsAlert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsBackup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nodeId" TEXT,
    "serviceId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'manual',
    "location" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "lastBackupAt" TIMESTAMP(3),
    "lastStatus" TEXT NOT NULL DEFAULT 'unknown',
    "lastRestoreTestAt" TIMESTAMP(3),
    "retentionDays" INTEGER NOT NULL DEFAULT 30,
    "encrypted" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsBackup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsCost" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "nodeName" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "renewAt" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "invoiceUrl" TEXT,
    "project" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsCost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsHealthCheck" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTimeMs" INTEGER,
    "result" TEXT NOT NULL DEFAULT 'unknown',
    "errorMessage" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VpsHealthCheck_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsNotificationSetting" (
    "id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "destinationLabel" TEXT,
    "events" TEXT NOT NULL DEFAULT '[]',
    "maintenanceWindow" TEXT,
    "lastTestedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsNotificationSetting_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsSetting_pkey" PRIMARY KEY ("id")
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

ALTER TABLE "VpsService" ADD CONSTRAINT "VpsService_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "VpsNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VpsAccessPolicy" ADD CONSTRAINT "VpsAccessPolicy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "VpsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VpsAccessPolicy" ADD CONSTRAINT "VpsAccessPolicy_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "VpsService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VpsAlert" ADD CONSTRAINT "VpsAlert_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "VpsNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VpsAlert" ADD CONSTRAINT "VpsAlert_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "VpsService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VpsBackup" ADD CONSTRAINT "VpsBackup_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "VpsNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VpsBackup" ADD CONSTRAINT "VpsBackup_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "VpsService"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "VpsHealthCheck" ADD CONSTRAINT "VpsHealthCheck_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "VpsService"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "VpsAccessProfile" (
    "id" TEXT NOT NULL,
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
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "lastViewedAt" TIMESTAMP(3),
    "lastDownloadedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "revokedBy" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "VpsAccessProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VpsAccessProfileDownload" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "oneTimeTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "ipHash" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VpsAccessProfileDownload_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VpsAccessProfileDownload_oneTimeTokenHash_key" ON "VpsAccessProfileDownload"("oneTimeTokenHash");
CREATE INDEX "VpsAccessProfile_userId_status_idx" ON "VpsAccessProfile"("userId", "status");
CREATE INDEX "VpsAccessProfile_expiresAt_status_idx" ON "VpsAccessProfile"("expiresAt", "status");
CREATE INDEX "VpsAccessProfileDownload_profileId_createdAt_idx" ON "VpsAccessProfileDownload"("profileId", "createdAt");
CREATE INDEX "VpsAccessProfileDownload_expiresAt_usedAt_idx" ON "VpsAccessProfileDownload"("expiresAt", "usedAt");
ALTER TABLE "VpsAccessProfile" ADD CONSTRAINT "VpsAccessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "VpsUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VpsAccessProfileDownload" ADD CONSTRAINT "VpsAccessProfileDownload_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "VpsAccessProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "VpsAlert" ADD CONSTRAINT "VpsAlert_accessProfileId_fkey" FOREIGN KEY ("accessProfileId") REFERENCES "VpsAccessProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
