ALTER TABLE "VpsEndpoint" ADD COLUMN "operatingSystem" TEXT;
ALTER TABLE "VpsEndpoint" ADD COLUMN "architecture" TEXT;
ALTER TABLE "VpsEndpoint" ADD COLUMN "defaultProfileExpireDays" INTEGER NOT NULL DEFAULT 90;
ALTER TABLE "VpsEndpoint" ADD COLUMN "dryRun" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "VpsEndpoint" ADD COLUMN "allowSystemApply" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "serviceConfigReady" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "serviceApplied" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "serviceRunning" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "portListening" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "ipForwardingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "systemApplyError" TEXT;
ALTER TABLE "VpsEndpoint" ADD COLUMN "serviceAppliedAt" DATETIME;

ALTER TABLE "VpsAccessProfile" ADD COLUMN "peerApplied" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsAccessProfile" ADD COLUMN "serviceReloadedAfterPeer" BOOLEAN NOT NULL DEFAULT false;
