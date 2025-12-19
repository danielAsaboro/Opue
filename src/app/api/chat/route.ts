/**
 * Chat API Route - AI SDK v5 with Groq and MCP Tools
 * Streams responses using Vercel AI SDK with tool execution
 */
import { streamText, tool, convertToModelMessages, UIMessage } from 'ai'
import { groq } from '@ai-sdk/groq'
import { z } from 'zod'
import { PNodeService } from '@/services/pnode.service'

const pnodeService = new PNodeService()

export async function POST(req: Request) {
  // Check for Groq API key
  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: 'Groq API key not configured. Please add GROQ_API_KEY to your .env.local file.' },
      { status: 503 }
    )
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    toolChoice: 'auto',
    system: `You are a helpful assistant for the Xandeum pNode Analytics platform.

Xandeum is a decentralized storage network built on Solana. pNodes are storage provider nodes that contribute capacity to the network.

You help users:
- Explore pNode data (status, performance, storage metrics)
- View network statistics and health
- Check validator information
- Get epoch and slot progress

Use the available tools to fetch real-time data from the Xandeum network.
Be concise and format responses with markdown for readability.
When showing pNode IDs, truncate them for readability (first 8 chars...last 4 chars).`,
    messages: convertToModelMessages(messages),
    tools: {
      get_pnodes: tool({
        description: 'Get all pNodes from the Xandeum network with their status, performance scores, and locations',
        inputSchema: z.object({
          limit: z.number().optional().describe('Maximum pNodes to return (default 10)'),
        }),
        execute: async ({ limit = 10 }) => {
          try {
            const pnodes = await pnodeService.fetchAllPNodes()
            return {
              total: pnodes.length,
              online: pnodes.filter((p) => p.status === 'online').length,
              offline: pnodes.filter((p) => p.status === 'offline').length,
              delinquent: pnodes.filter((p) => p.status === 'delinquent').length,
              pnodes: pnodes.slice(0, limit).map((p) => ({
                id: p.id,
                status: p.status,
                performanceScore: p.performanceScore || 0,
                location: p.location || 'Unknown',
                storageTB: ((p.storage?.capacityBytes || 0) / Math.pow(1024, 4)).toFixed(2),
                uptime: (p.performance?.uptime || 0).toFixed(1),
              })),
            }
          } catch (error) {
            console.error('[get_pnodes] Error:', error)
            return {
              error: 'Failed to fetch pNodes',
              total: 0,
              online: 0,
              offline: 0,
              delinquent: 0,
              pnodes: [],
            }
          }
        },
      }),

      get_network_stats: tool({
        description: 'Get network-wide statistics including total pNodes, health score, storage capacity, and average performance',
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const stats = await pnodeService.fetchNetworkStats()
            const totalCapacity = stats.totalCapacity || 0
            const totalUsed = stats.totalUsed || 0
            return {
              totalPNodes: stats.totalPNodes || 0,
              onlinePNodes: stats.onlinePNodes || 0,
              offlinePNodes: stats.offlinePNodes || 0,
              healthScore: stats.healthScore || 0,
              averagePerformance: stats.averagePerformance || 0,
              totalCapacityTB: (totalCapacity / Math.pow(1024, 4)).toFixed(2),
              totalUsedTB: (totalUsed / Math.pow(1024, 4)).toFixed(2),
              utilizationPercent: totalCapacity > 0 ? ((totalUsed / totalCapacity) * 100).toFixed(1) : '0.0',
            }
          } catch (error) {
            console.error('[get_network_stats] Error:', error)
            return {
              error: 'Failed to fetch network stats',
              totalPNodes: 0,
              onlinePNodes: 0,
              offlinePNodes: 0,
              healthScore: 0,
              averagePerformance: 0,
              totalCapacityTB: '0.00',
              totalUsedTB: '0.00',
              utilizationPercent: '0.0',
            }
          }
        },
      }),

      get_pnode_details: tool({
        description: 'Get detailed information for a specific pNode by its pubkey or ID',
        inputSchema: z.object({
          pubkey: z.string().describe('The pNode pubkey or ID to look up'),
        }),
        execute: async ({ pubkey }) => {
          try {
            const details = await pnodeService.fetchPNodeDetails(pubkey)
            return {
              id: details.id,
              status: details.status,
              version: details.version || 'Unknown',
              location: details.location || 'Unknown',
              performanceScore: details.performanceScore || 0,
              uptime: (details.performance?.uptime || 0).toFixed(1) + '%',
              latency: (details.performance?.averageLatency || 0).toFixed(1) + 'ms',
              successRate: (details.performance?.successRate || 0).toFixed(1) + '%',
              storageTB: ((details.storage?.capacityBytes || 0) / Math.pow(1024, 4)).toFixed(2),
              usedTB: ((details.storage?.usedBytes || 0) / Math.pow(1024, 4)).toFixed(2),
              utilization: (details.storage?.utilization || 0).toFixed(1) + '%',
              fileSystems: details.storage?.fileSystems || [],
              network: details.network || {},
            }
          } catch (error) {
            console.error('[get_pnode_details] Error:', error)
            return {
              error: `Failed to fetch details for pNode: ${pubkey}`,
              id: pubkey,
              status: 'unknown',
              version: 'Unknown',
              location: 'Unknown',
              performanceScore: 0,
              uptime: '0.0%',
              latency: '0.0ms',
              successRate: '0.0%',
              storageTB: '0.00',
              usedTB: '0.00',
              utilization: '0.0%',
              fileSystems: [],
              network: {},
            }
          }
        },
      }),

      search_pnodes: tool({
        description: 'Search for pNodes by status, location, or minimum performance score',
        inputSchema: z.object({
          status: z.enum(['online', 'offline', 'delinquent']).optional().describe('Filter by pNode status'),
          location: z.string().optional().describe('Filter by location (partial match)'),
          minPerformance: z.number().optional().describe('Minimum performance score (0-100)'),
          limit: z.number().optional().describe('Maximum results to return (default 10)'),
        }),
        execute: async ({ status, location, minPerformance, limit = 10 }) => {
          try {
            let pnodes = await pnodeService.fetchAllPNodes()

            if (status) {
              pnodes = pnodes.filter((p) => p.status === status)
            }
            if (location) {
              const loc = location.toLowerCase()
              pnodes = pnodes.filter((p) => p.location?.toLowerCase().includes(loc))
            }
            if (minPerformance !== undefined) {
              pnodes = pnodes.filter((p) => (p.performanceScore || 0) >= minPerformance)
            }

            return {
              totalMatches: pnodes.length,
              returned: Math.min(pnodes.length, limit),
              filters: { status, location, minPerformance },
              pnodes: pnodes.slice(0, limit).map((p) => ({
                id: p.id,
                status: p.status,
                performanceScore: p.performanceScore || 0,
                location: p.location || 'Unknown',
              })),
            }
          } catch (error) {
            console.error('[search_pnodes] Error:', error)
            return {
              error: 'Failed to search pNodes',
              totalMatches: 0,
              returned: 0,
              filters: { status, location, minPerformance },
              pnodes: [],
            }
          }
        },
      }),

      get_epoch_info: tool({
        description: 'Get current epoch information including slot progress and block height',
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const epoch = await pnodeService.fetchEpochInfo()
            const slotsInEpoch = epoch.slotsInEpoch || 1
            const slotIndex = epoch.slotIndex || 0
            return {
              epoch: epoch.epoch || 0,
              absoluteSlot: epoch.absoluteSlot || 0,
              blockHeight: epoch.blockHeight || 0,
              slotIndex,
              slotsInEpoch,
              progress: ((slotIndex / slotsInEpoch) * 100).toFixed(2) + '%',
              transactionCount: epoch.transactionCount || 0,
            }
          } catch (error) {
            console.error('[get_epoch_info] Error:', error)
            return {
              error: 'Failed to fetch epoch info',
              epoch: 0,
              absoluteSlot: 0,
              blockHeight: 0,
              slotIndex: 0,
              slotsInEpoch: 0,
              progress: '0.00%',
              transactionCount: 0,
            }
          }
        },
      }),

      get_validators: tool({
        description: 'Get validator (vote account) information including stake and commission',
        inputSchema: z.object({
          limit: z.number().optional().describe('Maximum validators to return (default 10)'),
        }),
        execute: async ({ limit = 10 }) => {
          try {
            const voteAccounts = await pnodeService.fetchVoteAccounts()
            const current = voteAccounts.current || []
            const delinquent = voteAccounts.delinquent || []
            return {
              totalActive: current.length,
              totalDelinquent: delinquent.length,
              topValidators: current.slice(0, limit).map((v) => ({
                nodePubkey: v.nodePubkey,
                votePubkey: v.votePubkey,
                stakeSOL: ((v.activatedStake || 0) / 1e9).toFixed(2),
                commission: (v.commission || 0) + '%',
              })),
            }
          } catch (error) {
            console.error('[get_validators] Error:', error)
            return {
              error: 'Failed to fetch validators',
              totalActive: 0,
              totalDelinquent: 0,
              topValidators: [],
            }
          }
        },
      }),

      get_geographic_stats: tool({
        description:
          'Get geographic distribution and statistics of pNodes by region/location. Use this for questions about regional distribution, which regions have the most pNodes, geographic analysis, storage per region, etc.',
        inputSchema: z.object({}),
        execute: async () => {
          try {
            const pnodes = await pnodeService.fetchAllPNodes()

            // Aggregate by location
            const locationStats: Record<
              string,
              {
                total: number
                online: number
                offline: number
                delinquent: number
                totalStorageBytes: number
                performanceSum: number
              }
            > = {}

            pnodes.forEach((p) => {
              const location = p.location || 'Unknown'
              if (!locationStats[location]) {
                locationStats[location] = {
                  total: 0,
                  online: 0,
                  offline: 0,
                  delinquent: 0,
                  totalStorageBytes: 0,
                  performanceSum: 0,
                }
              }
              locationStats[location].total++
              if (p.status === 'online') locationStats[location].online++
              else if (p.status === 'offline') locationStats[location].offline++
              else if (p.status === 'delinquent') locationStats[location].delinquent++
              locationStats[location].totalStorageBytes += p.storage?.capacityBytes || 0
              locationStats[location].performanceSum += p.performanceScore || 0
            })

            // Calculate averages and format output
            const regions = Object.entries(locationStats)
              .map(([region, stats]) => ({
                region,
                totalPNodes: stats.total,
                online: stats.online,
                offline: stats.offline,
                delinquent: stats.delinquent,
                totalStorageTB: (stats.totalStorageBytes / Math.pow(1024, 4)).toFixed(2),
                avgPerformance: stats.total > 0 ? (stats.performanceSum / stats.total).toFixed(1) : '0.0',
              }))
              .sort((a, b) => b.totalPNodes - a.totalPNodes)

            return {
              totalPNodes: pnodes.length,
              totalRegions: regions.length,
              regions,
            }
          } catch (error) {
            console.error('[get_geographic_stats] Error:', error)
            return {
              error: 'Failed to fetch geographic stats',
              totalPNodes: 0,
              totalRegions: 0,
              regions: [],
            }
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}

// Health check endpoint
export async function GET() {
  const hasApiKey = !!process.env.GROQ_API_KEY
  return Response.json({
    status: hasApiKey ? 'ok' : 'unconfigured',
    model: 'llama-3.3-70b-versatile',
    provider: 'groq',
    apiKeyConfigured: hasApiKey,
    tools: ['get_pnodes', 'get_network_stats', 'get_pnode_details', 'search_pnodes', 'get_epoch_info', 'get_validators', 'get_geographic_stats'],
  })
}
