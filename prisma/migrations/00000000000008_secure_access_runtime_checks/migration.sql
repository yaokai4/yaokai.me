ALTER TABLE "VpsEndpoint" ADD COLUMN "wireGuardQuickInstalled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "wgInterfacePresent" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "publicHostResolved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "VpsEndpoint" ADD COLUMN "publicHostResolvedIp" TEXT;
