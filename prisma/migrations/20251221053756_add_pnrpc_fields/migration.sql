-- AlterTable
ALTER TABLE "PNodeSnapshot" ADD COLUMN     "activeStreams" INTEGER,
ADD COLUMN     "cpuPercent" DOUBLE PRECISION,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "packetsReceived" BIGINT,
ADD COLUMN     "packetsSent" BIGINT,
ADD COLUMN     "pnrpcPort" INTEGER,
ADD COLUMN     "ramTotal" BIGINT,
ADD COLUMN     "ramUsed" BIGINT,
ADD COLUMN     "uptimeSeconds" BIGINT;
