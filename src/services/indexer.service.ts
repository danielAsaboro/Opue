/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Prisma client types need to be regenerated with database connection
import { prisma } from '@/lib/prisma'
import { pnodeService } from './pnode.service'
import type { VoteAccount, EpochInfo, PerformanceSample, InflationRate, SupplyInfo } from './pnode.service'
import type { PNode, NetworkStats } from '@/types/pnode'

/**
 * IndexerService - Responsible for capturing and storing historical pNode data
 *
 * Features:
 * - Periodic snapshots of pNode states
 * - Network-wide statistics tracking
 * - Event detection and logging
 * - Anomaly detection
 */
export class IndexerService {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false
  private lastPNodeStates: Map<string, { status: string; performanceScore: number }> = new Map()

  /**
   * Start the indexer with the specified interval
   */
  async start(intervalMs: number = 30000): Promise<void> {
    if (this.isRunning) {
      return
    }

    this.isRunning = true

    // Run immediately
    await this.runIndexingCycle()

    // Then run on interval
    this.intervalId = setInterval(async () => {
      await this.runIndexingCycle()
    }, intervalMs)
  }

  /**
   * Stop the indexer
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
  }

  /**
   * Run a single indexing cycle
   */
  async runIndexingCycle(): Promise<void> {
    const startTime = Date.now()
    console.log('[Indexer] Starting indexing cycle...')

    try {
      // Fetch all data in parallel for efficiency
      // Note: includeNetworkMetrics=true fetches CPU/RAM/packet data from get-stats for each pNode
      const [pnodes, networkStats, voteAccounts, epochInfo, perfSamples, inflation, supply, stakeMin] =
        await Promise.all([
          pnodeService.fetchAllPNodes({ includeNetworkMetrics: true }),
          pnodeService.fetchNetworkStats(),
          pnodeService.fetchVoteAccounts().catch((e) => {
            console.warn('[Indexer] Vote accounts fetch failed:', e.message)
            return null
          }),
          pnodeService.fetchEpochInfo().catch((e) => {
            console.warn('[Indexer] Epoch info fetch failed:', e.message)
            return null
          }),
          pnodeService.fetchPerformanceSamples(10).catch((e) => {
            console.warn('[Indexer] Perf samples fetch failed:', e.message)
            return null
          }),
          pnodeService.fetchInflationRate().catch((e) => {
            console.warn('[Indexer] Inflation fetch failed:', e.message)
            return null
          }),
          pnodeService.fetchSupply().catch((e) => {
            console.warn('[Indexer] Supply fetch failed:', e.message)
            return null
          }),
          pnodeService.fetchStakeMinimumDelegation().catch((e) => {
            console.warn('[Indexer] Stake min fetch failed:', e.message)
            return null
          }),
        ])

      // Debug logging
      console.log(
        `[Indexer] Data fetch results: pnodes=${pnodes.length}, voteAccounts=${voteAccounts ? 'yes' : 'no'}, epochInfo=${epochInfo ? 'yes' : 'no'}, perfSamples=${perfSamples?.length || 0}, inflation=${inflation ? 'yes' : 'no'}, supply=${supply ? 'yes' : 'no'}, stakeMin=${stakeMin !== null ? 'yes' : 'no'}`,
      )

      // Store pNode snapshots
      await this.storePNodeSnapshots(pnodes)

      // Store validator data (if available)
      if (voteAccounts) {
        console.log(`[Indexer] Storing ${voteAccounts.current.length + voteAccounts.delinquent.length} validators`)
        await this.storeValidatorSnapshots(voteAccounts)
      }

      // Store epoch snapshot (if available)
      if (epochInfo) {
        console.log(`[Indexer] Storing epoch ${epochInfo.epoch} snapshot`)
        await this.storeEpochSnapshot(epochInfo)
      }

      // Store performance samples (if available)
      if (perfSamples && perfSamples.length > 0) {
        console.log(`[Indexer] Storing ${perfSamples.length} performance samples`)
        await this.storePerformanceSamples(perfSamples)
      }

      // Store economics snapshot (if we have the data)
      if (inflation && supply && stakeMin !== null && voteAccounts) {
        console.log(`[Indexer] Storing economics snapshot`)
        await this.storeEconomicsSnapshot(inflation, supply, stakeMin, voteAccounts)
      } else {
        console.log(
          `[Indexer] Skipping economics: inflation=${!!inflation}, supply=${!!supply}, stakeMin=${stakeMin !== null}, voteAccounts=${!!voteAccounts}`,
        )
      }

      // Store network snapshot (now with enhanced validator/epoch data)
      await this.storeNetworkSnapshot(pnodes, networkStats, voteAccounts, epochInfo, perfSamples)

      // Detect and log events
      await this.detectEvents(pnodes)

      // Run anomaly detection
      await this.detectAnomalies(pnodes, networkStats)

      // Update last known states
      this.updateLastStates(pnodes)

      const duration = Date.now() - startTime
      const validatorCount = voteAccounts ? voteAccounts.current.length + voteAccounts.delinquent.length : 0
      console.log(
        `[Indexer] Cycle completed in ${duration}ms - ${pnodes.length} pNodes, ${validatorCount} validators indexed`,
      )
    } catch (error) {
      console.error('[Indexer] Error during indexing cycle:', error)
      await this.logEvent({
        type: 'ANOMALY_DETECTED',
        severity: 'CRITICAL',
        title: 'Indexer Error',
        description: `Failed to complete indexing cycle: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    }
  }

  /**
   * Store snapshots for all pNodes
   */
  private async storePNodeSnapshots(pnodes: PNode[]): Promise<void> {
    const now = new Date()

    for (const pnode of pnodes) {
      // Upsert the pNode record
      const dbPNode = await prisma.pNode.upsert({
        where: { pubkey: pnode.id },
        update: {
          gossipEndpoint: pnode.gossipEndpoint,
          rpcEndpoint: pnode.rpcEndpoint,
          version: pnode.version,
          location: pnode.location,
          lastSeen: now,
        },
        create: {
          pubkey: pnode.id,
          gossipEndpoint: pnode.gossipEndpoint,
          rpcEndpoint: pnode.rpcEndpoint,
          version: pnode.version,
          location: pnode.location,
          firstSeen: now,
          lastSeen: now,
        },
      })

      // Create snapshot with all pnRPC data
      await prisma.pNodeSnapshot.create({
        data: {
          pnodeId: dbPNode.id,
          status: pnode.status,
          performanceScore: pnode.performanceScore,
          uptime: pnode.performance.uptime,
          averageLatency: pnode.performance.averageLatency,
          successRate: pnode.performance.successRate,
          capacityBytes: BigInt(Math.floor(pnode.storage.capacityBytes)),
          usedBytes: BigInt(Math.floor(pnode.storage.usedBytes)),
          utilization: pnode.storage.utilization,
          fileSystems: pnode.storage.fileSystems,
          // New pnRPC fields
          uptimeSeconds: pnode.performance.uptimeSeconds ? BigInt(pnode.performance.uptimeSeconds) : null,
          cpuPercent: pnode.networkMetrics?.cpuPercent ?? null,
          ramUsed: pnode.networkMetrics?.ramUsed ? BigInt(pnode.networkMetrics.ramUsed) : null,
          ramTotal: pnode.networkMetrics?.ramTotal ? BigInt(pnode.networkMetrics.ramTotal) : null,
          activeStreams: pnode.networkMetrics?.activeStreams ?? null,
          packetsReceived: pnode.networkMetrics?.packetsReceived ? BigInt(pnode.networkMetrics.packetsReceived) : null,
          packetsSent: pnode.networkMetrics?.packetsSent ? BigInt(pnode.networkMetrics.packetsSent) : null,
          isPublic: pnode.isPublic ?? false,
          pnrpcPort: pnode.pnrpcPort ?? null,
        },
      })
    }
  }

  /**
   * Store network-wide snapshot (now with enhanced data)
   */
  private async storeNetworkSnapshot(
    pnodes: PNode[],
    stats: NetworkStats,
    voteAccounts?: { current: VoteAccount[]; delinquent: VoteAccount[] } | null,
    epochInfo?: EpochInfo | null,
    perfSamples?: PerformanceSample[] | null,
  ): Promise<void> {
    // Calculate version distribution
    const versionDistribution: Record<string, number> = {}
    pnodes.forEach((p) => {
      versionDistribution[p.version] = (versionDistribution[p.version] || 0) + 1
    })

    // Calculate geographic distribution
    const geoDistribution: Record<string, number> = {}
    pnodes.forEach((p) => {
      const location = p.location || 'Unknown'
      geoDistribution[location] = (geoDistribution[location] || 0) + 1
    })

    const delinquentCount = pnodes.filter((p) => p.status === 'delinquent').length
    const avgLatency = pnodes.reduce((sum, p) => sum + p.performance.averageLatency, 0) / pnodes.length || 0

    // Calculate validator metrics (if available)
    let totalValidators, activeValidators, delinquentValidators, totalStake, avgCommission
    if (voteAccounts) {
      const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]
      totalValidators = allValidators.length
      activeValidators = voteAccounts.current.length
      delinquentValidators = voteAccounts.delinquent.length
      totalStake = BigInt(allValidators.reduce((sum, v) => sum + v.activatedStake, 0))
      avgCommission =
        allValidators.length > 0 ? allValidators.reduce((sum, v) => sum + v.commission, 0) / allValidators.length : 0
    }

    // Calculate TPS from performance samples
    let currentTps, nonVoteTps
    if (perfSamples && perfSamples.length > 0) {
      const latest = perfSamples[0]
      currentTps = latest.numTransactions / latest.samplePeriodSecs
      nonVoteTps = latest.numNonVoteTransactions / latest.samplePeriodSecs
    }

    await prisma.networkSnapshot.create({
      data: {
        totalPNodes: stats.totalPNodes,
        onlinePNodes: stats.onlinePNodes,
        offlinePNodes: stats.offlinePNodes,
        delinquentPNodes: delinquentCount,
        totalCapacityBytes: BigInt(Math.floor(stats.totalCapacity)),
        totalUsedBytes: BigInt(Math.floor(stats.totalUsed)),
        networkUtilization: (stats.totalUsed / stats.totalCapacity) * 100 || 0,
        healthScore: stats.healthScore,
        averagePerformance: stats.averagePerformance,
        averageLatency: avgLatency,
        versionDistribution,
        geoDistribution,
        // New validator metrics
        totalValidators,
        activeValidators,
        delinquentValidators,
        totalStake,
        averageCommission: avgCommission,
        // Epoch info
        currentEpoch: epochInfo?.epoch,
        currentSlot: epochInfo ? BigInt(epochInfo.absoluteSlot) : undefined,
        blockHeight: epochInfo ? BigInt(epochInfo.blockHeight) : undefined,
        transactionCount: epochInfo ? BigInt(epochInfo.transactionCount) : undefined,
        // Performance
        currentTps,
        nonVoteTps,
      },
    })
  }

  /**
   * Store validator snapshots
   */
  private async storeValidatorSnapshots(voteAccounts: {
    current: VoteAccount[]
    delinquent: VoteAccount[]
  }): Promise<void> {
    const allValidators = [
      ...voteAccounts.current.map((v) => ({ ...v, isDelinquent: false })),
      ...voteAccounts.delinquent.map((v) => ({ ...v, isDelinquent: true })),
    ]

    for (const validator of allValidators) {
      // Get latest epoch credits
      const latestCredits = validator.epochCredits[validator.epochCredits.length - 1]
      const [, credits, priorCredits] = latestCredits || [0, 0, 0]

      // Upsert validator record
      const dbValidator = await prisma.validator.upsert({
        where: { votePubkey: validator.votePubkey },
        update: {
          nodePubkey: validator.nodePubkey,
          isActive: !validator.isDelinquent,
          isDelinquent: validator.isDelinquent,
          commission: validator.commission,
          lastSeen: new Date(),
        },
        create: {
          nodePubkey: validator.nodePubkey,
          votePubkey: validator.votePubkey,
          isActive: !validator.isDelinquent,
          isDelinquent: validator.isDelinquent,
          commission: validator.commission,
        },
      })

      // Create snapshot
      await prisma.validatorSnapshot.create({
        data: {
          validatorId: dbValidator.id,
          activatedStake: BigInt(validator.activatedStake),
          lastVote: BigInt(validator.lastVote),
          rootSlot: BigInt(validator.rootSlot),
          epochCredits: BigInt(credits),
          priorCredits: BigInt(priorCredits),
          isDelinquent: validator.isDelinquent,
          epochVoteAccount: validator.epochVoteAccount,
        },
      })
    }
  }

  /**
   * Store epoch snapshot
   */
  private async storeEpochSnapshot(epochInfo: EpochInfo): Promise<void> {
    // Check if we already have this epoch
    const existing = await prisma.epochSnapshot.findUnique({
      where: { epoch: epochInfo.epoch },
    })

    if (existing) {
      // Update existing epoch snapshot
      await prisma.epochSnapshot.update({
        where: { epoch: epochInfo.epoch },
        data: {
          absoluteSlot: BigInt(epochInfo.absoluteSlot),
          blockHeight: BigInt(epochInfo.blockHeight),
          slotIndex: BigInt(epochInfo.slotIndex),
          transactionCount: BigInt(epochInfo.transactionCount),
          epochProgress: (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100,
        },
      })
    } else {
      // Create new epoch snapshot
      await prisma.epochSnapshot.create({
        data: {
          epoch: epochInfo.epoch,
          absoluteSlot: BigInt(epochInfo.absoluteSlot),
          blockHeight: BigInt(epochInfo.blockHeight),
          slotIndex: BigInt(epochInfo.slotIndex),
          slotsInEpoch: BigInt(epochInfo.slotsInEpoch),
          transactionCount: BigInt(epochInfo.transactionCount),
          epochProgress: (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100,
        },
      })
    }
  }

  /**
   * Store performance samples
   */
  private async storePerformanceSamples(samples: PerformanceSample[]): Promise<void> {
    for (const sample of samples) {
      // Check if we already have this sample (by slot)
      const existing = await prisma.performanceSample.findFirst({
        where: { slot: BigInt(sample.slot) },
      })

      if (!existing) {
        const tps = sample.numTransactions / sample.samplePeriodSecs
        const nonVoteTps = sample.numNonVoteTransactions / sample.samplePeriodSecs
        const slotTime = (sample.samplePeriodSecs * 1000) / sample.numSlots // ms per slot

        await prisma.performanceSample.create({
          data: {
            slot: BigInt(sample.slot),
            numSlots: sample.numSlots,
            numTransactions: sample.numTransactions,
            numNonVoteTransactions: sample.numNonVoteTransactions,
            samplePeriodSecs: sample.samplePeriodSecs,
            tps,
            nonVoteTps,
            slotTime,
          },
        })
      }
    }
  }

  /**
   * Store economics snapshot
   */
  private async storeEconomicsSnapshot(
    inflation: InflationRate,
    supply: SupplyInfo,
    stakeMinDelegation: number,
    voteAccounts: { current: VoteAccount[]; delinquent: VoteAccount[] },
  ): Promise<void> {
    const totalStake = [...voteAccounts.current, ...voteAccounts.delinquent].reduce(
      (sum, v) => sum + v.activatedStake,
      0,
    )
    const stakingParticipation = supply.total > 0 ? (totalStake / supply.total) * 100 : 0

    await prisma.economicsSnapshot.create({
      data: {
        totalSupply: BigInt(supply.total),
        circulatingSupply: BigInt(supply.circulating),
        nonCirculatingSupply: BigInt(supply.nonCirculating),
        inflationEpoch: inflation.epoch,
        inflationTotal: inflation.total,
        inflationValidator: inflation.validator,
        inflationFoundation: inflation.foundation,
        totalStaked: BigInt(totalStake),
        stakingParticipation,
        stakeMinimumDelegation: BigInt(stakeMinDelegation),
      },
    })
  }

  /**
   * Detect and log network events (status changes, etc.)
   */
  private async detectEvents(pnodes: PNode[]): Promise<void> {
    for (const pnode of pnodes) {
      const lastState = this.lastPNodeStates.get(pnode.id)

      if (!lastState) {
        // New pNode detected
        await this.logEvent({
          type: 'NODE_ONLINE',
          severity: 'SUCCESS',
          title: 'New pNode Detected',
          description: `pNode ${this.truncateId(pnode.id)} has joined the network`,
          pnodePubkey: pnode.id,
          metadata: { version: pnode.version, location: pnode.location },
        })
        continue
      }

      // Status change detection
      if (lastState.status !== pnode.status) {
        const eventType = this.getStatusEventType(pnode.status)
        const severity = this.getStatusSeverity(pnode.status)

        await this.logEvent({
          type: eventType,
          severity,
          title: `pNode Status Changed to ${pnode.status.toUpperCase()}`,
          description: `pNode ${this.truncateId(pnode.id)} changed from ${lastState.status} to ${pnode.status}`,
          pnodePubkey: pnode.id,
          metadata: { previousStatus: lastState.status, newStatus: pnode.status },
        })
      }

      // Performance degradation detection (>10% drop)
      const perfDelta = lastState.performanceScore - pnode.performanceScore
      if (perfDelta > 10) {
        await this.logEvent({
          type: 'PERFORMANCE_DEGRADATION',
          severity: 'WARNING',
          title: 'Performance Degradation Detected',
          description: `pNode ${this.truncateId(pnode.id)} performance dropped by ${perfDelta} points`,
          pnodePubkey: pnode.id,
          metadata: {
            previousScore: lastState.performanceScore,
            newScore: pnode.performanceScore,
          },
        })
      } else if (perfDelta < -10) {
        await this.logEvent({
          type: 'PERFORMANCE_IMPROVEMENT',
          severity: 'SUCCESS',
          title: 'Performance Improvement',
          description: `pNode ${this.truncateId(pnode.id)} performance improved by ${Math.abs(perfDelta)} points`,
          pnodePubkey: pnode.id,
          metadata: {
            previousScore: lastState.performanceScore,
            newScore: pnode.performanceScore,
          },
        })
      }
    }

    // Check for lost pNodes
    const currentIds = new Set(pnodes.map((p) => p.id))
    for (const [id] of this.lastPNodeStates) {
      if (!currentIds.has(id)) {
        await this.logEvent({
          type: 'NODE_OFFLINE',
          severity: 'WARNING',
          title: 'pNode Left Network',
          description: `pNode ${this.truncateId(id)} is no longer visible in gossip`,
          pnodePubkey: id,
        })
      }
    }
  }

  /**
   * Detect anomalies in network metrics
   */
  private async detectAnomalies(pnodes: PNode[], stats: NetworkStats): Promise<void> {
    // Get historical averages (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const historicalSnapshots = await prisma.networkSnapshot.findMany({
      where: { timestamp: { gte: oneDayAgo } },
      orderBy: { timestamp: 'desc' },
      take: 100,
    })

    if (historicalSnapshots.length < 10) {
      // Not enough data for meaningful anomaly detection
      return
    }

    // Calculate averages and standard deviations
    const avgPNodes = historicalSnapshots.reduce((sum, s) => sum + s.totalPNodes, 0) / historicalSnapshots.length
    const stdDevPNodes = this.calculateStdDev(
      historicalSnapshots.map((s) => s.totalPNodes),
      avgPNodes,
    )

    const avgHealth = historicalSnapshots.reduce((sum, s) => sum + s.healthScore, 0) / historicalSnapshots.length
    const stdDevHealth = this.calculateStdDev(
      historicalSnapshots.map((s) => s.healthScore),
      avgHealth,
    )

    const threshold = parseFloat(process.env.ANOMALY_THRESHOLD_STDDEV || '2.5')

    // Check for pNode count anomaly
    const pnodeDeviation = Math.abs(stats.totalPNodes - avgPNodes) / (stdDevPNodes || 1)
    if (pnodeDeviation > threshold) {
      await prisma.anomaly.create({
        data: {
          metric: 'totalPNodes',
          expectedValue: avgPNodes,
          actualValue: stats.totalPNodes,
          deviation: pnodeDeviation,
          description: `Unusual pNode count: expected ~${Math.round(avgPNodes)}, got ${stats.totalPNodes}`,
        },
      })

      await this.logEvent({
        type: 'ANOMALY_DETECTED',
        severity: pnodeDeviation > threshold * 2 ? 'CRITICAL' : 'WARNING',
        title: 'Unusual pNode Count',
        description: `Network has ${stats.totalPNodes} pNodes (expected ~${Math.round(avgPNodes)})`,
        metadata: { expected: avgPNodes, actual: stats.totalPNodes, deviation: pnodeDeviation },
      })
    }

    // Check for health score anomaly
    const healthDeviation = Math.abs(stats.healthScore - avgHealth) / (stdDevHealth || 1)
    if (healthDeviation > threshold && stats.healthScore < avgHealth) {
      await prisma.anomaly.create({
        data: {
          metric: 'healthScore',
          expectedValue: avgHealth,
          actualValue: stats.healthScore,
          deviation: healthDeviation,
          description: `Network health below expected: ${stats.healthScore}% vs expected ~${Math.round(avgHealth)}%`,
        },
      })

      await this.logEvent({
        type: 'ANOMALY_DETECTED',
        severity: 'WARNING',
        title: 'Network Health Anomaly',
        description: `Health score is ${stats.healthScore}% (expected ~${Math.round(avgHealth)}%)`,
        metadata: { expected: avgHealth, actual: stats.healthScore, deviation: healthDeviation },
      })
    }
  }

  /**
   * Log a network event
   */
  private async logEvent(event: {
    type: EventType
    severity: Severity
    title: string
    description?: string
    pnodePubkey?: string
    metadata?: Record<string, unknown>
  }): Promise<void> {
    let pnodeId: string | undefined

    if (event.pnodePubkey) {
      const pnode = await prisma.pNode.findUnique({
        where: { pubkey: event.pnodePubkey },
      })
      pnodeId = pnode?.id
    }

    await prisma.networkEvent.create({
      data: {
        type: event.type,
        severity: event.severity,
        title: event.title,
        description: event.description,
        pnodeId,
        metadata: event.metadata || {},
      },
    })
  }

  /**
   * Update cached last states for comparison
   */
  private updateLastStates(pnodes: PNode[]): void {
    this.lastPNodeStates.clear()
    for (const pnode of pnodes) {
      this.lastPNodeStates.set(pnode.id, {
        status: pnode.status,
        performanceScore: pnode.performanceScore,
      })
    }
  }

  // Helper methods
  private truncateId(id: string): string {
    return id.length > 12 ? `${id.slice(0, 6)}...${id.slice(-4)}` : id
  }

  private getStatusEventType(status: string): EventType {
    switch (status) {
      case 'online':
        return 'NODE_ONLINE'
      case 'offline':
        return 'NODE_OFFLINE'
      case 'delinquent':
        return 'NODE_DELINQUENT'
      default:
        return 'NODE_OFFLINE'
    }
  }

  private getStatusSeverity(status: string): Severity {
    switch (status) {
      case 'online':
        return 'SUCCESS'
      case 'offline':
        return 'CRITICAL'
      case 'delinquent':
        return 'WARNING'
      default:
        return 'INFO'
    }
  }

  private calculateStdDev(values: number[], mean: number): number {
    if (values.length === 0) return 0
    const squareDiffs = values.map((value) => Math.pow(value - mean, 2))
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length
    return Math.sqrt(avgSquareDiff)
  }
}

// Export singleton
export const indexerService = new IndexerService()
