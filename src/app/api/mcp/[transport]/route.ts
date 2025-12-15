/**
 * MCP (Model Context Protocol) Server Route
 * Exposes pNode analytics data as MCP tools for AI assistants
 */
import { createMcpHandler } from 'mcp-handler/next'
import { z } from 'zod'
import { PNodeService } from '@/services/pnode.service'

const pnodeService = new PNodeService()

const handler = createMcpHandler(
  (server) => {
    // Tool 1: Get all pNodes
    server.tool(
      'get_pnodes',
      'Get all pNodes from the Xandeum network with their status, performance, and storage metrics',
      {},
      async () => {
        try {
          const pnodes = await pnodeService.fetchAllPNodes()
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    total: pnodes.length,
                    online: pnodes.filter((p) => p.status === 'online').length,
                    offline: pnodes.filter((p) => p.status === 'offline').length,
                    delinquent: pnodes.filter((p) => p.status === 'delinquent').length,
                    pnodes: pnodes.map((p) => ({
                      id: p.id,
                      status: p.status,
                      performanceScore: p.performanceScore,
                      version: p.version,
                      location: p.location,
                      storageCapacityTB: (p.storage.capacityBytes / Math.pow(1024, 4)).toFixed(2),
                      storageUsedTB: (p.storage.usedBytes / Math.pow(1024, 4)).toFixed(2),
                      utilization: `${p.storage.utilization.toFixed(1)}%`,
                      uptime: `${p.performance.uptime.toFixed(1)}%`,
                      latencyMs: p.performance.averageLatency.toFixed(1),
                    })),
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error fetching pNodes: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          }
        }
      },
    )

    // Tool 2: Get specific pNode details
    server.tool(
      'get_pnode_details',
      'Get detailed information for a specific pNode by its pubkey/ID',
      { pubkey: z.string().describe('The pNode pubkey or ID to look up') },
      async ({ pubkey }) => {
        try {
          const details = await pnodeService.fetchPNodeDetails(pubkey)
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    id: details.id,
                    status: details.status,
                    version: details.version,
                    location: details.location,
                    performance: {
                      score: details.performanceScore,
                      uptime: `${details.performance.uptime.toFixed(1)}%`,
                      latency: `${details.performance.averageLatency.toFixed(1)}ms`,
                      successRate: `${details.performance.successRate.toFixed(1)}%`,
                    },
                    storage: {
                      capacityTB: (details.storage.capacityBytes / Math.pow(1024, 4)).toFixed(2),
                      usedTB: (details.storage.usedBytes / Math.pow(1024, 4)).toFixed(2),
                      utilization: `${details.storage.utilization.toFixed(1)}%`,
                      fileSystems: details.storage.fileSystems,
                    },
                    network: details.network,
                    endpoints: {
                      rpc: details.rpcEndpoint,
                      gossip: details.gossipEndpoint,
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error fetching pNode details: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          }
        }
      },
    )

    // Tool 3: Get network statistics
    server.tool(
      'get_network_stats',
      'Get network-wide statistics for the Xandeum pNode network',
      {},
      async () => {
        try {
          const stats = await pnodeService.fetchNetworkStats()
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    totalPNodes: stats.totalPNodes,
                    onlinePNodes: stats.onlinePNodes,
                    offlinePNodes: stats.offlinePNodes,
                    healthScore: stats.healthScore,
                    averagePerformance: stats.averagePerformance,
                    totalCapacityTB: (stats.totalCapacity / Math.pow(1024, 4)).toFixed(2),
                    totalUsedTB: (stats.totalUsed / Math.pow(1024, 4)).toFixed(2),
                    networkUtilization: `${((stats.totalUsed / stats.totalCapacity) * 100).toFixed(1)}%`,
                    lastUpdated: new Date(stats.lastUpdated).toISOString(),
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error fetching network stats: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          }
        }
      },
    )

    // Tool 4: Search pNodes
    server.tool(
      'search_pnodes',
      'Search for pNodes by various criteria (status, location, version, performance)',
      {
        status: z.enum(['online', 'offline', 'delinquent']).optional().describe('Filter by pNode status'),
        location: z.string().optional().describe('Filter by location (partial match)'),
        version: z.string().optional().describe('Filter by software version (partial match)'),
        minPerformance: z.number().optional().describe('Minimum performance score (0-100)'),
        maxPerformance: z.number().optional().describe('Maximum performance score (0-100)'),
        limit: z.number().optional().describe('Maximum number of results to return (default 10)'),
      },
      async ({ status, location, version, minPerformance, maxPerformance, limit = 10 }) => {
        try {
          let pnodes = await pnodeService.fetchAllPNodes()

          // Apply filters
          if (status) {
            pnodes = pnodes.filter((p) => p.status === status)
          }
          if (location) {
            const loc = location.toLowerCase()
            pnodes = pnodes.filter((p) => p.location?.toLowerCase().includes(loc))
          }
          if (version) {
            pnodes = pnodes.filter((p) => p.version.includes(version))
          }
          if (minPerformance !== undefined) {
            pnodes = pnodes.filter((p) => p.performanceScore >= minPerformance)
          }
          if (maxPerformance !== undefined) {
            pnodes = pnodes.filter((p) => p.performanceScore <= maxPerformance)
          }

          // Limit results
          const results = pnodes.slice(0, limit)

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    totalMatches: pnodes.length,
                    returned: results.length,
                    filters: { status, location, version, minPerformance, maxPerformance },
                    pnodes: results.map((p) => ({
                      id: p.id,
                      status: p.status,
                      performanceScore: p.performanceScore,
                      version: p.version,
                      location: p.location,
                    })),
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error searching pNodes: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          }
        }
      },
    )

    // Tool 5: Get comprehensive network data
    server.tool(
      'get_comprehensive_data',
      'Get comprehensive network data including validators, epoch info, performance samples, and economics',
      {},
      async () => {
        try {
          const data = await pnodeService.fetchComprehensiveNetworkData()
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    pnodes: {
                      total: data.pnodes.length,
                      online: data.pnodes.filter((p) => p.status === 'online').length,
                    },
                    validators: {
                      total: data.validators.totalValidators,
                      active: data.validators.activeValidators,
                      delinquent: data.validators.delinquentValidators,
                      totalStakeLamports: data.validators.totalStake,
                      avgCommission: `${data.validators.avgCommission.toFixed(2)}%`,
                    },
                    epoch: {
                      current: data.epoch.epoch,
                      slot: data.epoch.absoluteSlot,
                      progress: `${data.epoch.progress.toFixed(1)}%`,
                      blockHeight: data.epoch.blockHeight,
                    },
                    performance: {
                      currentTps: data.performance.currentTps.toFixed(2),
                      nonVoteTps: data.performance.nonVoteTps.toFixed(2),
                    },
                    economics: {
                      inflationRate: `${(data.economics.inflation.total * 100).toFixed(2)}%`,
                      validatorInflation: `${(data.economics.inflation.validator * 100).toFixed(2)}%`,
                      totalSupplyLamports: data.economics.supply.total,
                      circulatingSupplyLamports: data.economics.supply.circulating,
                      stakingParticipation: `${data.economics.stakingParticipation.toFixed(2)}%`,
                    },
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error fetching comprehensive data: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          }
        }
      },
    )

    // Tool 6: Get epoch info
    server.tool(
      'get_epoch_info',
      'Get current epoch information including slot progress and block height',
      {},
      async () => {
        try {
          const epochInfo = await pnodeService.fetchEpochInfo()
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    epoch: epochInfo.epoch,
                    absoluteSlot: epochInfo.absoluteSlot,
                    blockHeight: epochInfo.blockHeight,
                    slotIndex: epochInfo.slotIndex,
                    slotsInEpoch: epochInfo.slotsInEpoch,
                    progress: `${((epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100).toFixed(2)}%`,
                    transactionCount: epochInfo.transactionCount,
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error fetching epoch info: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          }
        }
      },
    )

    // Tool 7: Get validator info
    server.tool(
      'get_validators',
      'Get vote account information for validators including stake and commission',
      {
        includeDelinquent: z.boolean().optional().describe('Include delinquent validators (default: true)'),
        limit: z.number().optional().describe('Maximum number of validators to return (default: 20)'),
      },
      async ({ includeDelinquent = true, limit = 20 }) => {
        try {
          const voteAccounts = await pnodeService.fetchVoteAccounts()

          const formatValidator = (v: { nodePubkey: string; votePubkey: string; activatedStake: number; commission: number }) => ({
            nodePubkey: v.nodePubkey,
            votePubkey: v.votePubkey,
            stakeSOL: (v.activatedStake / 1e9).toFixed(2),
            commission: `${v.commission}%`,
          })

          const current = voteAccounts.current.slice(0, limit).map(formatValidator)
          const delinquent = includeDelinquent ? voteAccounts.delinquent.slice(0, limit).map(formatValidator) : []

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    summary: {
                      totalCurrent: voteAccounts.current.length,
                      totalDelinquent: voteAccounts.delinquent.length,
                    },
                    current,
                    ...(includeDelinquent && { delinquent }),
                  },
                  null,
                  2,
                ),
              },
            ],
          }
        } catch (error) {
          return {
            content: [{ type: 'text', text: `Error fetching validators: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true,
          }
        }
      },
    )
  },
  {
    capabilities: {
      tools: {},
    },
  },
  {
    basePath: '/api/mcp',
  },
)

export { handler as GET, handler as POST }
