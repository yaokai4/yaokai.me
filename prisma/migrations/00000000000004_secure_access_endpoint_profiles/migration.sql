-- Secure Access endpoint-centered model.
CREATE TABLE "VpsEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "hostname" TEXT NOT NULL,
    "publicHost" TEXT,
    "publicIp" TEXT,
    "region" TEXT,
    "status" TEXT NOT NULL DEFAULT 'needs_initialization',
    "configType" TEXT NOT NULL DEFAULT 'wireguard',
    "serverPublicKey" TEXT,
    "encryptedServerPrivateKey" TEXT,
    "listenPort" INTEGER NOT NULL DEFAULT 51820,
    "dns" TEXT NOT NULL DEFAULT '1.1.1.1',
    "mtu" INTEGER,
    "allowedIpTemplate" TEXT NOT NULL DEFAULT '10.66.0.0/24',
    "systemInfo" TEXT NOT NULL DEFAULT '{}',
    "availablePorts" TEXT NOT NULL DEFAULT '[]',
    "serviceStatus" TEXT NOT NULL DEFAULT 'unknown',
    "wireGuardInstalled" BOOLEAN NOT NULL DEFAULT false,
    "lastHealthCheckAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "VpsEndpoint" (
    "id",
    "name",
    "hostname",
    "status",
    "configType",
    "listenPort",
    "dns",
    "allowedIpTemplate",
    "systemInfo",
    "availablePorts",
    "serviceStatus",
    "wireGuardInstalled",
    "createdAt",
    "updatedAt"
) VALUES (
    'default-endpoint',
    'Default Secure Access Endpoint',
    'localhost',
    'needs_initialization',
    'wireguard',
    51820,
    '1.1.1.1',
    '10.66.0.0/24',
    '{}',
    '[51820]',
    'unknown',
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

ALTER TABLE "VpsAccessProfile" ADD COLUMN "endpointId" TEXT NOT NULL DEFAULT 'default-endpoint';
ALTER TABLE "VpsAccessProfile" ADD COLUMN "encryptedPrivateKey" TEXT;
ALTER TABLE "VpsAccessProfile" ADD COLUMN "assignedAddress" TEXT;
ALTER TABLE "VpsAccessProfileDownload" RENAME COLUMN "oneTimeTokenHash" TO "tokenHash";

CREATE INDEX "VpsEndpoint_status_configType_idx" ON "VpsEndpoint"("status", "configType");
CREATE INDEX "VpsEndpoint_lastHealthCheckAt_idx" ON "VpsEndpoint"("lastHealthCheckAt");
CREATE INDEX "VpsAccessProfile_endpointId_status_idx" ON "VpsAccessProfile"("endpointId", "status");
CREATE UNIQUE INDEX IF NOT EXISTS "VpsAccessProfileDownload_tokenHash_key" ON "VpsAccessProfileDownload"("tokenHash");
