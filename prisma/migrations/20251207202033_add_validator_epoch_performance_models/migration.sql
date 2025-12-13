-- AlterTable
ALTER TABLE "NetworkSnapshot" ADD COLUMN     "activeValidators" INTEGER,
ADD COLUMN     "averageCommission" DOUBLE PRECISION,
ADD COLUMN     "blockHeight" BIGINT,
ADD COLUMN     "currentEpoch" INTEGER,
ADD COLUMN     "currentSlot" BIGINT,
ADD COLUMN     "currentTps" DOUBLE PRECISION,
ADD COLUMN     "delinquentValidators" INTEGER,
ADD COLUMN     "nonVoteTps" DOUBLE PRECISION,
ADD COLUMN     "totalStake" BIGINT,
ADD COLUMN     "totalValidators" INTEGER,
ADD COLUMN     "transactionCount" BIGINT;

-- AlterTable
ALTER TABLE "PNode" ADD COLUMN     "featureSet" BIGINT,
ADD COLUMN     "shredVersion" INTEGER,
ADD COLUMN     "tpuEndpoint" TEXT;

-- CreateTable
CREATE TABLE "Validator" (
    "id" TEXT NOT NULL,
    "nodePubkey" TEXT NOT NULL,
    "votePubkey" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDelinquent" BOOLEAN NOT NULL DEFAULT false,
    "commission" INTEGER NOT NULL,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Validator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValidatorSnapshot" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedStake" BIGINT NOT NULL,
    "lastVote" BIGINT NOT NULL,
    "rootSlot" BIGINT NOT NULL,
    "epochCredits" BIGINT NOT NULL,
    "priorCredits" BIGINT NOT NULL,
    "isDelinquent" BOOLEAN NOT NULL,
    "epochVoteAccount" BOOLEAN NOT NULL,
    "validatorId" TEXT NOT NULL,

    CONSTRAINT "ValidatorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EpochSnapshot" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "epoch" INTEGER NOT NULL,
    "absoluteSlot" BIGINT NOT NULL,
    "blockHeight" BIGINT NOT NULL,
    "slotIndex" BIGINT NOT NULL,
    "slotsInEpoch" BIGINT NOT NULL,
    "transactionCount" BIGINT NOT NULL,
    "epochProgress" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "EpochSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceSample" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "slot" BIGINT NOT NULL,
    "numSlots" INTEGER NOT NULL,
    "numTransactions" INTEGER NOT NULL,
    "numNonVoteTransactions" INTEGER NOT NULL,
    "samplePeriodSecs" INTEGER NOT NULL,
    "tps" DOUBLE PRECISION NOT NULL,
    "nonVoteTps" DOUBLE PRECISION NOT NULL,
    "slotTime" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PerformanceSample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EconomicsSnapshot" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalSupply" BIGINT NOT NULL,
    "circulatingSupply" BIGINT NOT NULL,
    "nonCirculatingSupply" BIGINT NOT NULL,
    "inflationEpoch" INTEGER NOT NULL,
    "inflationTotal" DOUBLE PRECISION NOT NULL,
    "inflationValidator" DOUBLE PRECISION NOT NULL,
    "inflationFoundation" DOUBLE PRECISION NOT NULL,
    "totalStaked" BIGINT NOT NULL,
    "stakingParticipation" DOUBLE PRECISION NOT NULL,
    "stakeMinimumDelegation" BIGINT NOT NULL,

    CONSTRAINT "EconomicsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Validator_nodePubkey_key" ON "Validator"("nodePubkey");

-- CreateIndex
CREATE UNIQUE INDEX "Validator_votePubkey_key" ON "Validator"("votePubkey");

-- CreateIndex
CREATE INDEX "Validator_nodePubkey_idx" ON "Validator"("nodePubkey");

-- CreateIndex
CREATE INDEX "Validator_votePubkey_idx" ON "Validator"("votePubkey");

-- CreateIndex
CREATE INDEX "Validator_isActive_idx" ON "Validator"("isActive");

-- CreateIndex
CREATE INDEX "ValidatorSnapshot_validatorId_timestamp_idx" ON "ValidatorSnapshot"("validatorId", "timestamp");

-- CreateIndex
CREATE INDEX "ValidatorSnapshot_timestamp_idx" ON "ValidatorSnapshot"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "EpochSnapshot_epoch_key" ON "EpochSnapshot"("epoch");

-- CreateIndex
CREATE INDEX "EpochSnapshot_epoch_idx" ON "EpochSnapshot"("epoch");

-- CreateIndex
CREATE INDEX "EpochSnapshot_timestamp_idx" ON "EpochSnapshot"("timestamp");

-- CreateIndex
CREATE INDEX "PerformanceSample_timestamp_idx" ON "PerformanceSample"("timestamp");

-- CreateIndex
CREATE INDEX "PerformanceSample_slot_idx" ON "PerformanceSample"("slot");

-- CreateIndex
CREATE INDEX "EconomicsSnapshot_timestamp_idx" ON "EconomicsSnapshot"("timestamp");

-- AddForeignKey
ALTER TABLE "Validator" ADD CONSTRAINT "Validator_nodePubkey_fkey" FOREIGN KEY ("nodePubkey") REFERENCES "PNode"("pubkey") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValidatorSnapshot" ADD CONSTRAINT "ValidatorSnapshot_validatorId_fkey" FOREIGN KEY ("validatorId") REFERENCES "Validator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
