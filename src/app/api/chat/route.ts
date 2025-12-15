/**
 * Chat API Route - AI SDK v5 with OpenAI and MCP Tools
 * Streams responses using Vercel AI SDK with tool execution
 */
import { streamText, tool, convertToModelMessages, UIMessage } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import { PNodeService } from '@/services/pnode.service'

const pnodeService = new PNodeService()

export async function POST(req: Request) {
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    return Response.json(
      { error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your .env.local file.' },
      { status: 503 }
    )
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai('gpt-4o'),
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
        inputSchema: z.object({}),
        execute: async () => {
          const pnodes = await pnodeService.fetchAllPNodes()
          return {
            total: pnodes.length,
            online: pnodes.filter((p) => p.status === 'online').length,
            offline: pnodes.filter((p) => p.status === 'offline').length,
            delinquent: pnodes.filter((p) => p.status === 'delinquent').length,
            pnodes: pnodes.slice(0, 10).map((p) => ({
              id: p.id,
              status: p.status,
              performanceScore: p.performanceScore,
              location: p.location || 'Unknown',
              storageTB: (p.storage.capacityBytes / Math.pow(1024, 4)).toFixed(2),
              uptime: p.performance.uptime.toFixed(1),
            })),
          }
        },
      }),

      get_network_stats: tool({
        description: 'Get network-wide statistics including total pNodes, health score, storage capacity, and average performance',
        inputSchema: z.object({}),
        execute: async () => {
          const stats = await pnodeService.fetchNetworkStats()
          return {
            totalPNodes: stats.totalPNodes,
            onlinePNodes: stats.onlinePNodes,
            offlinePNodes: stats.offlinePNodes,
            healthScore: stats.healthScore,
            averagePerformance: stats.averagePerformance,
            totalCapacityTB: (stats.totalCapacity / Math.pow(1024, 4)).toFixed(2),
            totalUsedTB: (stats.totalUsed / Math.pow(1024, 4)).toFixed(2),
            utilizationPercent: ((stats.totalUsed / stats.totalCapacity) * 100).toFixed(1),
          }
        },
      }),

      get_pnode_details: tool({
        description: 'Get detailed information for a specific pNode by its pubkey or ID',
        inputSchema: z.object({
          pubkey: z.string().describe('The pNode pubkey or ID to look up'),
        }),
        execute: async ({ pubkey }) => {
          const details = await pnodeService.fetchPNodeDetails(pubkey)
          return {
            id: details.id,
            status: details.status,
            version: details.version,
            location: details.location || 'Unknown',
            performanceScore: details.performanceScore,
            uptime: details.performance.uptime.toFixed(1) + '%',
            latency: details.performance.averageLatency.toFixed(1) + 'ms',
            successRate: details.performance.successRate.toFixed(1) + '%',
            storageTB: (details.storage.capacityBytes / Math.pow(1024, 4)).toFixed(2),
            usedTB: (details.storage.usedBytes / Math.pow(1024, 4)).toFixed(2),
            utilization: details.storage.utilization.toFixed(1) + '%',
            fileSystems: details.storage.fileSystems,
            network: details.network,
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
          let pnodes = await pnodeService.fetchAllPNodes()

          if (status) {
            pnodes = pnodes.filter((p) => p.status === status)
          }
          if (location) {
            const loc = location.toLowerCase()
            pnodes = pnodes.filter((p) => p.location?.toLowerCase().includes(loc))
          }
          if (minPerformance !== undefined) {
            pnodes = pnodes.filter((p) => p.performanceScore >= minPerformance)
          }

          return {
            totalMatches: pnodes.length,
            returned: Math.min(pnodes.length, limit),
            filters: { status, location, minPerformance },
            pnodes: pnodes.slice(0, limit).map((p) => ({
              id: p.id,
              status: p.status,
              performanceScore: p.performanceScore,
              location: p.location || 'Unknown',
            })),
          }
        },
      }),

      get_epoch_info: tool({
        description: 'Get current epoch information including slot progress and block height',
        inputSchema: z.object({}),
        execute: async () => {
          const epoch = await pnodeService.fetchEpochInfo()
          return {
            epoch: epoch.epoch,
            absoluteSlot: epoch.absoluteSlot,
            blockHeight: epoch.blockHeight,
            slotIndex: epoch.slotIndex,
            slotsInEpoch: epoch.slotsInEpoch,
            progress: ((epoch.slotIndex / epoch.slotsInEpoch) * 100).toFixed(2) + '%',
            transactionCount: epoch.transactionCount,
          }
        },
      }),

      get_validators: tool({
        description: 'Get validator (vote account) information including stake and commission',
        inputSchema: z.object({
          limit: z.number().optional().describe('Maximum validators to return (default 10)'),
        }),
        execute: async ({ limit = 10 }) => {
          const voteAccounts = await pnodeService.fetchVoteAccounts()
          return {
            totalActive: voteAccounts.current.length,
            totalDelinquent: voteAccounts.delinquent.length,
            topValidators: voteAccounts.current.slice(0, limit).map((v) => ({
              nodePubkey: v.nodePubkey,
              votePubkey: v.votePubkey,
              stakeSOL: (v.activatedStake / 1e9).toFixed(2),
              commission: v.commission + '%',
            })),
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}

// Health check endpoint
export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY
  return Response.json({
    status: hasApiKey ? 'ok' : 'unconfigured',
    model: 'gpt-4o',
    apiKeyConfigured: hasApiKey,
    tools: ['get_pnodes', 'get_network_stats', 'get_pnode_details', 'search_pnodes', 'get_epoch_info', 'get_validators'],
  })
}
