-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('NODE_ONLINE', 'NODE_OFFLINE', 'NODE_DELINQUENT', 'PERFORMANCE_DEGRADATION', 'PERFORMANCE_IMPROVEMENT', 'STORAGE_THRESHOLD', 'VERSION_UPDATE', 'NETWORK_MILESTONE', 'ANOMALY_DETECTED');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'WARNING', 'CRITICAL', 'SUCCESS');

-- CreateEnum
CREATE TYPE "AlertScope" AS ENUM ('NETWORK', 'PNODE');

-- CreateTable
CREATE TABLE "PNode" (
    "id" TEXT NOT NULL,
    "pubkey" TEXT NOT NULL,
    "gossipEndpoint" TEXT NOT NULL,
    "rpcEndpoint" TEXT,
    "version" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "city" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "datacenter" TEXT,
    "asn" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PNodeSnapshot" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,
    "performanceScore" INTEGER NOT NULL,
    "uptime" DOUBLE PRECISION NOT NULL,
    "averageLatency" DOUBLE PRECISION NOT NULL,
    "successRate" DOUBLE PRECISION NOT NULL,
    "capacityBytes" BIGINT NOT NULL,
    "usedBytes" BIGINT NOT NULL,
    "utilization" DOUBLE PRECISION NOT NULL,
    "fileSystems" INTEGER NOT NULL,
    "pnodeId" TEXT NOT NULL,

    CONSTRAINT "PNodeSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkSnapshot" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalPNodes" INTEGER NOT NULL,
    "onlinePNodes" INTEGER NOT NULL,
    "offlinePNodes" INTEGER NOT NULL,
    "delinquentPNodes" INTEGER NOT NULL,
    "totalCapacityBytes" BIGINT NOT NULL,
    "totalUsedBytes" BIGINT NOT NULL,
    "networkUtilization" DOUBLE PRECISION NOT NULL,
    "healthScore" INTEGER NOT NULL,
    "averagePerformance" INTEGER NOT NULL,
    "averageLatency" DOUBLE PRECISION NOT NULL,
    "versionDistribution" JSONB,
    "geoDistribution" JSONB,

    CONSTRAINT "NetworkSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NetworkEvent" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "EventType" NOT NULL,
    "severity" "Severity" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "pnodeId" TEXT,

    CONSTRAINT "NetworkEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlertRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "metric" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "scope" "AlertScope" NOT NULL DEFAULT 'NETWORK',
    "pnodeFilter" TEXT,
    "notifyEmail" TEXT,
    "notifyWebhook" TEXT,
    "cooldownMinutes" INTEGER NOT NULL DEFAULT 15,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastTriggered" TIMESTAMP(3),

    CONSTRAINT "AlertRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "severity" "Severity" NOT NULL,
    "message" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "ruleId" TEXT NOT NULL,
    "pnodeId" TEXT,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyAnalytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "avgPNodes" INTEGER NOT NULL,
    "peakPNodes" INTEGER NOT NULL,
    "minPNodes" INTEGER NOT NULL,
    "avgHealthScore" DOUBLE PRECISION NOT NULL,
    "avgPerformance" DOUBLE PRECISION NOT NULL,
    "avgUptime" DOUBLE PRECISION NOT NULL,
    "avgCapacity" BIGINT NOT NULL,
    "avgUsed" BIGINT NOT NULL,
    "avgUtilization" DOUBLE PRECISION NOT NULL,
    "totalEvents" INTEGER NOT NULL,
    "criticalEvents" INTEGER NOT NULL,
    "warningEvents" INTEGER NOT NULL,
    "newPNodes" INTEGER NOT NULL,
    "lostPNodes" INTEGER NOT NULL,

    CONSTRAINT "DailyAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anomaly" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metric" TEXT NOT NULL,
    "expectedValue" DOUBLE PRECISION NOT NULL,
    "actualValue" DOUBLE PRECISION NOT NULL,
    "deviation" DOUBLE PRECISION NOT NULL,
    "pnodeId" TEXT,
    "description" TEXT,
    "confirmed" BOOLEAN,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Anomaly_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL DEFAULT '[]',
    "rateLimit" INTEGER NOT NULL DEFAULT 1000,
    "lastUsed" TIMESTAMP(3),
    "totalRequests" BIGINT NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PNode_pubkey_key" ON "PNode"("pubkey");

-- CreateIndex
CREATE INDEX "PNode_pubkey_idx" ON "PNode"("pubkey");

-- CreateIndex
CREATE INDEX "PNode_lastSeen_idx" ON "PNode"("lastSeen");

-- CreateIndex
CREATE INDEX "PNode_location_idx" ON "PNode"("location");

-- CreateIndex
CREATE INDEX "PNodeSnapshot_pnodeId_timestamp_idx" ON "PNodeSnapshot"("pnodeId", "timestamp");

-- CreateIndex
CREATE INDEX "PNodeSnapshot_timestamp_idx" ON "PNodeSnapshot"("timestamp");

-- CreateIndex
CREATE INDEX "NetworkSnapshot_timestamp_idx" ON "NetworkSnapshot"("timestamp");

-- CreateIndex
CREATE INDEX "NetworkEvent_timestamp_idx" ON "NetworkEvent"("timestamp");

-- CreateIndex
CREATE INDEX "NetworkEvent_type_idx" ON "NetworkEvent"("type");

-- CreateIndex
CREATE INDEX "NetworkEvent_severity_idx" ON "NetworkEvent"("severity");

-- CreateIndex
CREATE INDEX "Alert_timestamp_idx" ON "Alert"("timestamp");

-- CreateIndex
CREATE INDEX "Alert_resolved_idx" ON "Alert"("resolved");

-- CreateIndex
CREATE UNIQUE INDEX "DailyAnalytics_date_key" ON "DailyAnalytics"("date");

-- CreateIndex
CREATE INDEX "DailyAnalytics_date_idx" ON "DailyAnalytics"("date");

-- CreateIndex
CREATE INDEX "Anomaly_timestamp_idx" ON "Anomaly"("timestamp");

-- CreateIndex
CREATE INDEX "Anomaly_metric_idx" ON "Anomaly"("metric");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_key" ON "ApiKey"("key");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "ApiKey"("key");

-- AddForeignKey
ALTER TABLE "PNodeSnapshot" ADD CONSTRAINT "PNodeSnapshot_pnodeId_fkey" FOREIGN KEY ("pnodeId") REFERENCES "PNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NetworkEvent" ADD CONSTRAINT "NetworkEvent_pnodeId_fkey" FOREIGN KEY ("pnodeId") REFERENCES "PNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AlertRule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_pnodeId_fkey" FOREIGN KEY ("pnodeId") REFERENCES "PNode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
