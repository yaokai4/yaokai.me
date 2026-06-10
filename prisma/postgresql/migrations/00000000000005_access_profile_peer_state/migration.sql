ALTER TABLE "VpsAccessProfile" ADD COLUMN "serverPeerStatus" TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE "VpsAccessProfile" ADD COLUMN "serverAppliedAt" TIMESTAMP(3);
ALTER TABLE "VpsAccessProfile" ADD COLUMN "serverSyncError" TEXT;

CREATE INDEX "VpsAccessProfile_serverPeerStatus_idx" ON "VpsAccessProfile"("serverPeerStatus");
