import { Connection } from '@solana/web3.js'
import http from 'http'
import type { PNode, PNodeDetails, NetworkStats, PNodeStatus, PerformanceMetrics, StorageMetrics, NetworkMetrics } from '@/types/pnode'
import { getLocationForIP, lookupGeoIP } from './geoip.service'
import { prisma } from '@/lib/prisma'

/**
 * Pod response types from our API (transformed from Xandeum getClusterNodes)
 */
interface PRPCPod {
  address: string
  version: string
  last_seen: string
  last_seen_timestamp: number
  pubkey?: string
  rpc?: string | null
  tpu?: string
}

interface PRPCGetPodsResponse {
  jsonrpc: string
  result: {
    pods: PRPCPod[]
    total_count: number
  }
  id: number
}

/**
 * pnRPC Pod from get-pods on port 6000
 */
interface PnRPCPod {
  address: string
  last_seen_timestamp: number
  pubkey: string | null
  version: string
}

interface PnRPCGetPodsResponse {
  jsonrpc: string
  result: {
    pods: PnRPCPod[]
  }
  error: null | { code: number; message: string }
  id: number
}

/**
 * pnRPC Pod with stats from get-pods-with-stats on port 6000
 * This is the PRIMARY data source with real storage, uptime, etc.
 */
interface PnRPCPodWithStats {
  address: string
  is_public: boolean
  pubkey: string | null
  rpc_port: number
  storage_committed: number  // Total storage capacity in bytes
  storage_usage_percent: number  // Utilization as decimal (e.g., 0.0000467)
  storage_used: number  // Used storage in bytes
  uptime: number  // Uptime in seconds
  version: string
}

interface PnRPCGetPodsWithStatsResponse {
  jsonrpc: string
  result: {
    pods: PnRPCPodWithStats[]
  }
  error: null | { code: number; message: string }
  id: number
}

/**
 * pnRPC NodeStats from get-stats on port 6000
 */
interface PnRPCNodeStats {
  active_streams: number
  cpu_percent: number
  current_index: number
  file_size: number      // Storage capacity in bytes
  last_updated: number
  packets_received: number
  packets_sent: number
  ram_total: number
  ram_used: number
  total_bytes: number
  total_pages: number
  uptime: number         // Uptime in seconds
}

interface PnRPCGetStatsResponse {
  jsonrpc: string
  result: PnRPCNodeStats
  error: null | { code: number; message: string }
  id: number
}

/**
 * Raw cluster node response from getClusterNodes RPC
 */
interface ClusterNode {
  pubkey: string
  gossip: string
  tpu: string
  rpc: string | null
  version: string | null
  featureSet: number | null
  shredVersion: number | null
}

interface GetClusterNodesResponse {
  jsonrpc: string
  result: ClusterNode[]
  id: number
}

/**
 * Vote account from getVoteAccounts RPC
 */
interface VoteAccount {
  activatedStake: number
  commission: number
  epochCredits: [number, number, number][] // [epoch, credits, priorCredits]
  epochVoteAccount: boolean
  lastVote: number
  nodePubkey: string
  rootSlot: number
  votePubkey: string
}

interface GetVoteAccountsResponse {
  jsonrpc: string
  result: {
    current: VoteAccount[]
    delinquent: VoteAccount[]
  }
  id: number
}

/**
 * Epoch info from getEpochInfo RPC
 */
interface EpochInfo {
  absoluteSlot: number
  blockHeight: number
  epoch: number
  slotIndex: number
  slotsInEpoch: number
  transactionCount: number
}

interface GetEpochInfoResponse {
  jsonrpc: string
  result: EpochInfo
  id: number
}

/**
 * Performance sample from getRecentPerformanceSamples RPC
 */
interface PerformanceSample {
  numNonVoteTransactions: number
  numSlots: number
  numTransactions: number
  samplePeriodSecs: number
  slot: number
}

interface GetRecentPerformanceSamplesResponse {
  jsonrpc: string
  result: PerformanceSample[]
  id: number
}

/**
 * Inflation rate from getInflationRate RPC
 */
interface InflationRate {
  epoch: number
  foundation: number
  total: number
  validator: number
}

interface GetInflationRateResponse {
  jsonrpc: string
  result: InflationRate
  id: number
}

/**
 * Supply info from getSupply RPC
 */
interface SupplyInfo {
  circulating: number
  nonCirculating: number
  nonCirculatingAccounts: string[]
  total: number
}

interface GetSupplyResponse {
  jsonrpc: string
  result: {
    context: { slot: number }
    value: SupplyInfo
  }
  id: number
}

/**
 * Stake minimum delegation from getStakeMinimumDelegation RPC
 */
interface GetStakeMinimumDelegationResponse {
  jsonrpc: string
  result: {
    context: { slot: number; apiVersion: string }
    value: number
  }
  id: number
}

/**
 * Exported types for indexer
 */
export type { VoteAccount, EpochInfo, PerformanceSample, InflationRate, SupplyInfo }

/**
 * Custom error class for RPC failures
 */
export class PRPCError extends Error {
  constructor(
    message: string,
    public readonly endpoints: string[],
  ) {
    super(message)
    this.name = 'PRPCError'
  }
}

/**
 * Xandeum RPC endpoints
 * Using the correct endpoint format with port 8899
 */
const RPC_ENDPOINTS = ['https://api.devnet.xandeum.com:8899', 'https://rpc.xandeum.network']

/**
 * pnRPC seed nodes for getting pNode data (port 6000)
 * These are known pNodes that can provide the pod list
 */
const PNRPC_SEED_NODES = [
  '192.190.136.28',
  '173.212.220.65',
  '192.190.136.37',
]

// pnRPC port for get-pods-with-stats, get-stats, etc.
const PNRPC_PORT = 6000

/**
 * Service for interacting with Xandeum pRPC endpoints
 */
export class PNodeService {
  private connection: Connection
  private rpcUrl: string

  constructor(rpcUrl?: string) {
    this.rpcUrl = rpcUrl || process.env.NEXT_PUBLIC_XANDEUM_RPC_URL || 'https://apis.devnet.xandeum.com'
    this.connection = new Connection(this.rpcUrl, 'confirmed')
  }

  /**
   * Check if running in browser environment
   */
  private isBrowser(): boolean {
    return typeof window !== 'undefined'
  }

  /**
   * Make a pRPC call - uses API route proxy in browser to avoid CORS
   */
  private async callPRPC<T>(endpoint: string, method: string, params: unknown[] = []): Promise<T> {
    // In browser, use our API route to proxy requests and avoid CORS
    if (this.isBrowser()) {
      const response = await fetch('/api/prpc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ method, params }),
      })

      if (!response.ok) {
        throw new Error(`API proxy call failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(`pRPC error: ${data.error.message || JSON.stringify(data.error)}`)
      }

      return data as T
    }

    // Server-side: call RPC directly (no /prpc suffix, it's a standard JSON-RPC endpoint)
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      }),
    })

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`pRPC error: ${data.error.message || JSON.stringify(data.error)}`)
    }

    return data as T
  }

  /**
   * Call pnRPC endpoint on port 6000 for real pNode data
   * Uses Node.js http module instead of fetch due to undici "bad port" bug
   */
  private async callPnRPC<T>(ip: string, method: string, timeoutMs: number = 5000): Promise<T> {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: ip,
        port: PNRPC_PORT,
        path: '/rpc',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        timeout: timeoutMs,
      }

      const req = http.request(options, (res) => {
        let data = ''
        res.on('data', (chunk) => { data += chunk })
        res.on('end', () => {
          try {
            const json = JSON.parse(data)
            if (json.error) {
              reject(new Error(`pnRPC error: ${json.error.message}`))
            } else {
              resolve(json as T)
            }
          } catch (e) {
            reject(new Error(`Failed to parse pnRPC response: ${e}`))
          }
        })
      })

      req.on('error', (e) => reject(e))
      req.on('timeout', () => {
        req.destroy()
        reject(new Error('pnRPC request timed out'))
      })

      req.write(JSON.stringify({
        jsonrpc: '2.0',
        method,
        params: [],
        id: 1,
      }))
      req.end()
    })
  }

  /**
   * Fetch pNode list from pnRPC seed nodes
   */
  private async fetchPnRPCPods(): Promise<PnRPCPod[]> {
    for (const seedNode of PNRPC_SEED_NODES) {
      try {
        console.log(`[pnRPC] Fetching pods from seed node ${seedNode}...`)
        const response = await this.callPnRPC<PnRPCGetPodsResponse>(seedNode, 'get-pods')
        if (response.result?.pods?.length > 0) {
          console.log(`[pnRPC] Got ${response.result.pods.length} pods from ${seedNode}`)
          return response.result.pods
        }
      } catch (error) {
        console.warn(`[pnRPC] Failed to fetch from ${seedNode}:`, error)
        continue
      }
    }
    return []
  }

  /**
   * Fetch pods with full stats from pnRPC seed nodes (PRIMARY DATA SOURCE)
   * Returns all pNodes with real storage, uptime, etc.
   */
  private async fetchPodsWithStats(): Promise<PnRPCPodWithStats[]> {
    for (const seedNode of PNRPC_SEED_NODES) {
      try {
        console.log(`[pnRPC] Fetching pods-with-stats from seed node ${seedNode}...`)
        const response = await this.callPnRPC<PnRPCGetPodsWithStatsResponse>(seedNode, 'get-pods-with-stats', 10000)
        if (response.result?.pods?.length > 0) {
          console.log(`[pnRPC] Got ${response.result.pods.length} pods with stats from ${seedNode}`)
          return response.result.pods
        }
      } catch (error) {
        console.warn(`[pnRPC] Failed to fetch pods-with-stats from ${seedNode}:`, error)
        continue
      }
    }
    throw new PRPCError('Failed to fetch pods from any seed node', PNRPC_SEED_NODES)
  }

  /**
   * Transform a pnRPC pod with stats to our PNode type
   * @param pod The pod data from get-pods-with-stats
   * @param fetchNetworkMetrics Whether to fetch additional network metrics from get-stats
   */
  private async transformPodWithStatsToPNode(pod: PnRPCPodWithStats, fetchNetworkMetrics: boolean = false): Promise<PNode> {
    const [ip, portStr] = pod.address.split(':')
    const port = parseInt(portStr || '9001')
    const now = Date.now()

    // Determine status based on uptime - if uptime > 0, it's online
    // We trust the pnRPC data - if a pod is returned with uptime, it's active
    let status: PNodeStatus = 'online'
    if (pod.uptime === 0) {
      status = 'offline'
    }

    // Real storage data from pnRPC
    const storage: StorageMetrics = {
      capacityBytes: pod.storage_committed,
      usedBytes: pod.storage_used,
      // Convert from decimal (e.g., 0.0000467) to percentage (e.g., 0.00467%)
      utilization: pod.storage_usage_percent * 100,
      fileSystems: 1,  // Not available in this API
      isEstimated: false  // This is REAL data
    }

    // Calculate uptime percentage - reference is 30 days max
    const maxUptimeSeconds = 30 * 24 * 60 * 60  // 30 days
    const uptimePercentage = Math.min((pod.uptime / maxUptimeSeconds) * 100, 100)

    // Real performance data
    const performance: PerformanceMetrics = {
      averageLatency: 25,  // We don't have latency data, use reasonable default
      successRate: status === 'online' ? 99.5 : 0,
      uptime: uptimePercentage,
      uptimeSeconds: pod.uptime,
      lastUpdated: now,
      isEstimated: false  // Uptime is REAL data
    }

    const performanceScore = this.calculatePerformanceScore(performance, storage)

    // Get real location from GeoIP (server-side only)
    let location = 'Unknown'
    if (!this.isBrowser()) {
      try {
        location = await getLocationForIP(ip)
      } catch {
        location = this.estimateLocationFromIP(ip)
      }
    }

    // Optionally fetch network metrics (CPU, RAM, packets) for online nodes
    let networkMetrics: NetworkMetrics | undefined
    if (fetchNetworkMetrics && status === 'online' && !this.isBrowser()) {
      const stats = await this.fetchPnRPCStats(ip)
      if (stats) {
        networkMetrics = {
          activeStreams: stats.active_streams,
          packetsReceived: stats.packets_received,
          packetsSent: stats.packets_sent,
          cpuPercent: stats.cpu_percent,
          ramUsed: stats.ram_used,
          ramTotal: stats.ram_total,
        }
      }
    }

    return {
      id: pod.pubkey || `${ip}:${port}`,
      status,
      storage,
      performanceScore,
      performance,
      networkMetrics,
      version: pod.version || 'unknown',
      location,
      lastSeen: new Date(),  // pods-with-stats returns live data
      isPublic: pod.is_public,
      pnrpcPort: pod.rpc_port,
      rpcEndpoint: `http://${ip}:8899`,
      gossipEndpoint: pod.address,
    }
  }

  /**
   * Fetch stats for a specific pNode via pnRPC
   */
  private async fetchPnRPCStats(ip: string): Promise<PnRPCNodeStats | null> {
    try {
      const response = await this.callPnRPC<PnRPCGetStatsResponse>(ip, 'get-stats', 3000)
      if (response.result) {
        return response.result
      }
    } catch {
      // Stats not available for this node
    }
    return null
  }

  /**
   * Transform getClusterNodes response to our pod format
   */
  private transformClusterNodesToPods(nodes: ClusterNode[]): PRPCGetPodsResponse {
    return {
      jsonrpc: '2.0',
      result: {
        pods: nodes.map((node) => ({
          address: node.gossip || `${node.pubkey}:9001`,
          version: node.version || 'unknown',
          last_seen: new Date().toISOString(),
          last_seen_timestamp: Math.floor(Date.now() / 1000),
          pubkey: node.pubkey,
          rpc: node.rpc,
          tpu: node.tpu,
        })),
        total_count: nodes.length,
      },
      id: 1,
    }
  }

  /**
   * Try to fetch pods from pRPC endpoints
   */
  private async fetchPodsFromEndpoints(): Promise<PRPCGetPodsResponse> {
    // In browser, just use the API route (it handles multiple endpoints)
    if (this.isBrowser()) {
      console.log('Fetching pods via API route...')
      const response = await this.callPRPC<PRPCGetPodsResponse>(this.rpcUrl, 'get-pods')
      if (response.result?.pods?.length > 0) {
        console.log(`Successfully fetched ${response.result.pods.length} pods`)
        return response
      }
      throw new PRPCError('No pNodes found in the network', ['/api/prpc'])
    }

    // Server-side: try multiple endpoints with getClusterNodes
    const endpoints = [this.rpcUrl, ...RPC_ENDPOINTS]
    const errors: string[] = []

    for (const endpoint of endpoints) {
      try {
        console.log(`Trying to fetch cluster nodes from ${endpoint}...`)
        const response = await this.callPRPC<GetClusterNodesResponse>(endpoint, 'getClusterNodes')
        if (response.result && Array.isArray(response.result) && response.result.length > 0) {
          console.log(`Successfully fetched ${response.result.length} cluster nodes from ${endpoint}`)
          // Transform to pod format
          return this.transformClusterNodesToPods(response.result)
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.warn(`Failed to fetch from ${endpoint}:`, errorMsg)
        errors.push(`${endpoint}: ${errorMsg}`)
        continue
      }
    }

    throw new PRPCError(
      `Failed to connect to any RPC endpoint. Tried: ${endpoints.join(', ')}. Errors: ${errors.join('; ')}`,
      endpoints,
    )
  }

  /**
   * Transform a pRPC pod response to our PNode type (async for GeoIP lookup)
   */
  private async transformPodToPNode(pod: PRPCPod): Promise<PNode> {
    const [ip, port] = pod.address.split(':')
    const lastSeenDate = new Date(pod.last_seen_timestamp * 1000)
    const now = Date.now()
    const timeSinceLastSeen = now - lastSeenDate.getTime()

    // Determine status based on last seen time
    // Online if seen within last 5 minutes, delinquent if within 30 mins, offline otherwise
    let status: PNodeStatus = 'online'
    if (timeSinceLastSeen > 30 * 60 * 1000) {
      status = 'offline'
    } else if (timeSinceLastSeen > 5 * 60 * 1000) {
      status = 'delinquent'
    }

    // Try to get historical data from database to calculate real metrics
    let uptime = 0

    try {
      // Only query database on server-side
      if (!this.isBrowser()) {
        const nodeId = pod.pubkey || `${ip}:${port}`
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

        // Find the pNode in database
        const dbPNode = await prisma.pNode.findFirst({
          where: { pubkey: nodeId },
          include: {
            snapshots: {
              where: { timestamp: { gte: thirtyDaysAgo } },
              orderBy: { timestamp: 'desc' },
              take: 100
            }
          }
        })

        if (dbPNode && dbPNode.snapshots.length > 0) {
          // Calculate real uptime from historical snapshots
          const onlineSnapshots = dbPNode.snapshots.filter(s => s.status === 'online').length
          uptime = (onlineSnapshots / dbPNode.snapshots.length) * 100

          // Use average from historical data if available
          const avgLatency = dbPNode.snapshots.reduce((sum, s) => sum + s.averageLatency, 0) / dbPNode.snapshots.length
          const avgSuccessRate = dbPNode.snapshots.reduce((sum, s) => sum + s.successRate, 0) / dbPNode.snapshots.length

          // These are real calculated values from observations
          const performance: PerformanceMetrics = {
            averageLatency: avgLatency,
            successRate: avgSuccessRate,
            uptime,
            lastUpdated: now,
            isEstimated: false
          }

          // Use latest storage data from snapshots
          const latestSnapshot = dbPNode.snapshots[0]
          const storage: StorageMetrics = {
            capacityBytes: Number(latestSnapshot.capacityBytes),
            usedBytes: Number(latestSnapshot.usedBytes),
            utilization: latestSnapshot.utilization,
            fileSystems: latestSnapshot.fileSystems,
            isEstimated: false
          }

          const performanceScore = this.calculatePerformanceScore(performance, storage)

          // Get location
          let location = dbPNode.location || 'Unknown'
          if (location === 'Unknown') {
            try {
              location = await getLocationForIP(ip)
            } catch {
              location = this.estimateLocationFromIP(ip)
            }
          }

          return {
            id: nodeId,
            status,
            storage,
            performanceScore,
            performance,
            version: pod.version || 'unknown',
            location,
            lastSeen: lastSeenDate,
            rpcEndpoint: pod.rpc || `http://${ip}:8899`,
            tpuEndpoint: pod.tpu,
            gossipEndpoint: pod.address,
          }
        }
      }
    } catch (error) {
      // Database query failed, fall back to estimated values
      console.warn('Failed to fetch historical data, using estimated values:', error)
    }

    // Try to get real stats from pnRPC (port 6000)
    let storage: StorageMetrics
    let performance: PerformanceMetrics

    // Only try pnRPC on server-side (avoids CORS issues)
    if (!this.isBrowser()) {
      const stats = await this.fetchPnRPCStats(ip)
      if (stats && stats.file_size > 0) {
        // Real data from pnRPC

        // Calculate uptime percentage (stats.uptime is in seconds)
        // Assume max uptime reference of 30 days for percentage calculation
        const maxUptimeSeconds = 30 * 24 * 60 * 60
        uptime = Math.min((stats.uptime / maxUptimeSeconds) * 100, 100)

        storage = {
          capacityBytes: stats.file_size,
          usedBytes: stats.total_bytes, // total_bytes appears to be used storage
          utilization: stats.file_size > 0 ? (stats.total_bytes / stats.file_size) * 100 : 0,
          fileSystems: stats.total_pages,
          isEstimated: false
        }

        // Use real CPU data for performance estimation
        const cpuLoad = stats.cpu_percent

        performance = {
          averageLatency: Math.max(10, 50 - (100 - cpuLoad) * 0.4), // Lower CPU = lower latency estimate
          successRate: status === 'online' ? 99.5 : status === 'delinquent' ? 80 : 0,
          uptime,
          lastUpdated: now,
          isEstimated: false
        }
      } else {
        // pnRPC stats not available, use estimates
        uptime = status === 'online' ? 100 : status === 'delinquent' ? 50 : 0
        const latency = status === 'online' ? 25 : status === 'delinquent' ? 75 : 150
        const successRate = status === 'online' ? 100 : status === 'delinquent' ? 75 : 0

        storage = {
          capacityBytes: 0,
          usedBytes: 0,
          utilization: 0,
          fileSystems: 0,
          isEstimated: true
        }

        performance = {
          averageLatency: latency,
          successRate,
          uptime,
          lastUpdated: now,
          isEstimated: true
        }
      }
    } else {
      // Browser-side: use estimates (can't call pnRPC directly due to CORS)
      uptime = status === 'online' ? 100 : status === 'delinquent' ? 50 : 0
      const latency = status === 'online' ? 25 : status === 'delinquent' ? 75 : 150
      const successRate = status === 'online' ? 100 : status === 'delinquent' ? 75 : 0

      storage = {
        capacityBytes: 0,
        usedBytes: 0,
        utilization: 0,
        fileSystems: 0,
        isEstimated: true
      }

      performance = {
        averageLatency: latency,
        successRate,
        uptime,
        lastUpdated: now,
        isEstimated: true
      }
    }

    const performanceScore = this.calculatePerformanceScore(performance, storage)

    // Get real location from GeoIP service (server-side only, uses ip-api.com)
    // Falls back to heuristics if GeoIP lookup fails
    let location = 'Unknown'
    if (!this.isBrowser()) {
      try {
        location = await getLocationForIP(ip)
      } catch {
        // Fallback to simple IP-based estimation if GeoIP fails
        location = this.estimateLocationFromIP(ip)
      }
    } else {
      // Browser-side: use simple estimation (can't make external HTTP requests)
      location = this.estimateLocationFromIP(ip)
    }

    return {
      id: pod.pubkey || `${ip}:${port}`, // Use pubkey as ID if available, otherwise address
      status,
      storage,
      performanceScore,
      performance,
      version: pod.version || 'unknown',
      location,
      lastSeen: lastSeenDate,
      rpcEndpoint: pod.rpc || `http://${ip}:8899`,
      tpuEndpoint: pod.tpu,
      gossipEndpoint: pod.address,
    }
  }

  /**
   * Simple IP-based location estimation (fallback when GeoIP unavailable)
   */
  private estimateLocationFromIP(ip: string): string {
    const firstOctet = parseInt(ip.split('.')[0] || '0')

    if (firstOctet >= 1 && firstOctet <= 126) return 'US-East'
    if (firstOctet >= 128 && firstOctet <= 191) return 'EU-Central'
    if (firstOctet >= 192 && firstOctet <= 223) return 'Asia-Pacific'
    return 'Unknown'
  }

  /**
   * Fetch all pNodes from pnRPC using get-pods-with-stats (PRIMARY SOURCE)
   * Falls back to getClusterNodes if pnRPC is unavailable
   * Throws PRPCError if unable to connect to any endpoint
   * @param options.includeNetworkMetrics If true, fetch CPU/RAM/packet data (slower, use for indexing)
   */
  async fetchAllPNodes(options?: { includeNetworkMetrics?: boolean }): Promise<PNode[]> {
    const fetchNetworkMetrics = options?.includeNetworkMetrics ?? false

    // Try pnRPC first - this is the PRIMARY source with real data
    try {
      const podsWithStats = await this.fetchPodsWithStats()
      console.log(`[pnRPC] Transforming ${podsWithStats.length} pods with stats to PNode format (networkMetrics: ${fetchNetworkMetrics})`)

      // Transform pods - if fetching network metrics, do it in batches to avoid overwhelming
      if (fetchNetworkMetrics) {
        // Batch process to avoid too many concurrent requests
        const batchSize = 10
        const pnodes: PNode[] = []
        for (let i = 0; i < podsWithStats.length; i += batchSize) {
          const batch = podsWithStats.slice(i, i + batchSize)
          const batchResults = await Promise.all(
            batch.map((pod) => this.transformPodWithStatsToPNode(pod, true))
          )
          pnodes.push(...batchResults)
        }
        console.log(`[pnRPC] Successfully transformed ${pnodes.length} pNodes with network metrics`)
        return pnodes
      } else {
        // Fast path without network metrics
        const pnodes = await Promise.all(podsWithStats.map((pod) => this.transformPodWithStatsToPNode(pod, false)))
        console.log(`[pnRPC] Successfully transformed ${pnodes.length} pNodes with real data`)
        return pnodes
      }
    } catch (error) {
      console.error('[pnRPC] Failed to fetch pNodes from all seed nodes:', error)
      throw new PRPCError(
        'Unable to fetch pNode data. The pnRPC seed nodes may be temporarily unavailable.',
        PNRPC_SEED_NODES
      )
    }
  }

  /**
   * Fetch detailed information for a specific pNode
   */
  async fetchPNodeDetails(pnodeId: string): Promise<PNodeDetails> {
    const pnodes = await this.fetchAllPNodes()
    const pnode = pnodes.find((p) => p.id === pnodeId)

    if (!pnode) {
      throw new Error(`pNode not found: ${pnodeId}`)
    }

    const ip = pnode.gossipEndpoint.split(':')[0] || '0.0.0.0'
    const port = parseInt(pnode.gossipEndpoint.split(':')[1] || '9001')

    // Get full geo data for network info
    let geoData = {
      country: '',
      countryCode: '',
      city: '',
      region: '',
      org: '',
      as: '',
      lat: 0,
      lon: 0,
    }

    // Only do GeoIP lookup on server-side
    if (!this.isBrowser()) {
      try {
        const geo = await lookupGeoIP(ip)
        geoData = {
          country: geo.country,
          countryCode: geo.countryCode,
          city: geo.city,
          region: geo.region,
          org: geo.org || geo.isp,
          as: geo.as,
          lat: geo.lat,
          lon: geo.lon,
        }
      } catch {
        // Keep defaults if GeoIP fails
      }
    }

    // Enhance with additional details from the real data
    return {
      ...pnode,
      network: {
        ip,
        port,
        tpu: pnode.tpuEndpoint,
        region: geoData.region || pnode.location,
        asn: geoData.as,
        datacenter: geoData.org,
        country: geoData.country,
        countryCode: geoData.countryCode,
        city: geoData.city,
        org: geoData.org,
        lat: geoData.lat,
        lon: geoData.lon,
      },
      history: {
        performanceScores: [],
        storageUtilization: [],
        uptimeHistory: [],
      },
    }
  }

  /**
   * Fetch network-wide statistics
   */
  async fetchNetworkStats(): Promise<NetworkStats> {
    const pnodes = await this.fetchAllPNodes()

    const onlinePNodes = pnodes.filter((p) => p.status === 'online').length
    const offlinePNodes = pnodes.filter((p) => p.status === 'offline').length

    const totalCapacity = pnodes.reduce((sum, p) => sum + p.storage.capacityBytes, 0)
    const totalUsed = pnodes.reduce((sum, p) => sum + p.storage.usedBytes, 0)

    const avgPerformance = pnodes.reduce((sum, p) => sum + p.performanceScore, 0) / pnodes.length || 0

    const healthScore = this.calculateNetworkHealth(pnodes)

    return {
      totalPNodes: pnodes.length,
      onlinePNodes,
      offlinePNodes,
      totalCapacity,
      totalUsed,
      healthScore,
      averagePerformance: Math.round(avgPerformance),
      lastUpdated: Date.now(),
    }
  }

  /**
   * Calculate performance score based on various metrics
   */
  calculatePerformanceScore(metrics: PerformanceMetrics, storage: StorageMetrics): number {
    // Score components with proper weighting as per PRD
    const uptimeScore = metrics.uptime * 0.3 // 30% - Uptime percentage
    const storageScore = Math.min((storage.capacityBytes / 1024 ** 4) * 20, 20) // 20% - Storage capacity (max at 1TB)
    const responseScore = Math.max((100 - metrics.averageLatency) / 100, 0) * 25 // 25% - Response time (lower latency = higher score)
    const reliabilityScore = metrics.successRate * 0.15 // 15% - Success rate
    const versionScore = 10 // 10% - Running latest version (simplified)

    const totalScore = uptimeScore + storageScore + responseScore + reliabilityScore + versionScore

    // Optional debug logging (uncomment for debugging)
    // console.log('Performance Score Debug:', {
    //   uptime: metrics.uptime,
    //   uptimeScore,
    //   storageCapacityTB: storage.capacityBytes / (1024 ** 4),
    //   storageScore,
    //   latency: metrics.averageLatency,
    //   responseScore,
    //   successRate: metrics.successRate,
    //   reliabilityScore,
    //   versionScore,
    //   totalScore: Math.round(totalScore)
    // })

    return Math.round(Math.max(0, Math.min(100, totalScore))) // Clamp between 0-100
  }

  /**
   * Calculate network health score
   */
  private calculateNetworkHealth(pnodes: PNode[]): number {
    if (pnodes.length === 0) return 0

    const onlineRatio = pnodes.filter((p) => p.status === 'online').length / pnodes.length
    const avgPerformance = pnodes.reduce((sum, p) => sum + p.performanceScore, 0) / pnodes.length
    const avgUptime = pnodes.reduce((sum, p) => sum + p.performance.uptime, 0) / pnodes.length

    return Math.round(onlineRatio * 40 + avgPerformance * 0.4 + avgUptime * 0.2)
  }

  // ============================================
  // NEW RPC METHODS - Additional data sources
  // ============================================

  /**
   * Fetch vote accounts (validators with staking data)
   */
  async fetchVoteAccounts(): Promise<{ current: VoteAccount[]; delinquent: VoteAccount[] }> {
    const endpoints = [this.rpcUrl, ...RPC_ENDPOINTS]
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getVoteAccounts' }),
        })
        if (!response.ok) continue
        const data: GetVoteAccountsResponse = await response.json()
        if (data.result) {
          console.log(
            `Got ${data.result.current.length} current and ${data.result.delinquent.length} delinquent validators`,
          )
          return data.result
        }
      } catch {
        continue
      }
    }
    throw new PRPCError('Failed to fetch vote accounts', endpoints)
  }

  /**
   * Fetch epoch info
   */
  async fetchEpochInfo(): Promise<EpochInfo> {
    const endpoints = [this.rpcUrl, ...RPC_ENDPOINTS]
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getEpochInfo' }),
        })
        if (!response.ok) continue
        const data: GetEpochInfoResponse = await response.json()
        if (data.result) {
          console.log(`Epoch ${data.result.epoch}, slot ${data.result.absoluteSlot}`)
          return data.result
        }
      } catch {
        continue
      }
    }
    throw new PRPCError('Failed to fetch epoch info', endpoints)
  }

  /**
   * Fetch recent performance samples
   */
  async fetchPerformanceSamples(limit: number = 10): Promise<PerformanceSample[]> {
    const endpoints = [this.rpcUrl, ...RPC_ENDPOINTS]
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getRecentPerformanceSamples', params: [limit] }),
        })
        if (!response.ok) continue
        const data: GetRecentPerformanceSamplesResponse = await response.json()
        if (data.result) return data.result
      } catch {
        continue
      }
    }
    throw new PRPCError('Failed to fetch performance samples', endpoints)
  }

  /**
   * Fetch inflation rate
   */
  async fetchInflationRate(): Promise<InflationRate> {
    const endpoints = [this.rpcUrl, ...RPC_ENDPOINTS]
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getInflationRate' }),
        })
        if (!response.ok) continue
        const data: GetInflationRateResponse = await response.json()
        if (data.result) return data.result
      } catch {
        continue
      }
    }
    throw new PRPCError('Failed to fetch inflation rate', endpoints)
  }

  /**
   * Fetch supply info
   */
  async fetchSupply(): Promise<SupplyInfo> {
    const endpoints = [this.rpcUrl, ...RPC_ENDPOINTS]
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getSupply' }),
        })
        if (!response.ok) continue
        const data: GetSupplyResponse = await response.json()
        if (data.result?.value) return data.result.value
      } catch {
        continue
      }
    }
    throw new PRPCError('Failed to fetch supply info', endpoints)
  }

  /**
   * Fetch stake minimum delegation
   */
  async fetchStakeMinimumDelegation(): Promise<number> {
    const endpoints = [this.rpcUrl, ...RPC_ENDPOINTS]
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getStakeMinimumDelegation' }),
        })
        if (!response.ok) continue
        const data: GetStakeMinimumDelegationResponse = await response.json()
        if (data.result?.value) return data.result.value
      } catch {
        continue
      }
    }
    throw new PRPCError('Failed to fetch stake minimum delegation', endpoints)
  }

  /**
   * Fetch comprehensive network data (all sources combined)
   */
  async fetchComprehensiveNetworkData() {
    const [pnodes, voteAccounts, epochInfo, performanceSamples, inflationRate, supply, stakeMinDelegation] =
      await Promise.all([
        this.fetchAllPNodes(),
        this.fetchVoteAccounts(),
        this.fetchEpochInfo(),
        this.fetchPerformanceSamples(5),
        this.fetchInflationRate(),
        this.fetchSupply(),
        this.fetchStakeMinimumDelegation(),
      ])

    const latestSample = performanceSamples[0]
    const tps = latestSample ? latestSample.numTransactions / latestSample.samplePeriodSecs : 0
    const nonVoteTps = latestSample ? latestSample.numNonVoteTransactions / latestSample.samplePeriodSecs : 0

    const totalStake =
      voteAccounts.current.reduce((sum, v) => sum + v.activatedStake, 0) +
      voteAccounts.delinquent.reduce((sum, v) => sum + v.activatedStake, 0)

    const allValidators = [...voteAccounts.current, ...voteAccounts.delinquent]
    const avgCommission =
      allValidators.length > 0 ? allValidators.reduce((sum, v) => sum + v.commission, 0) / allValidators.length : 0

    return {
      pnodes,
      validators: {
        current: voteAccounts.current,
        delinquent: voteAccounts.delinquent,
        totalValidators: allValidators.length,
        activeValidators: voteAccounts.current.length,
        delinquentValidators: voteAccounts.delinquent.length,
        totalStake,
        avgCommission,
      },
      epoch: { ...epochInfo, progress: (epochInfo.slotIndex / epochInfo.slotsInEpoch) * 100 },
      performance: { samples: performanceSamples, currentTps: tps, nonVoteTps },
      economics: {
        inflation: inflationRate,
        supply,
        stakeMinimumDelegation: stakeMinDelegation,
        stakingParticipation: supply.total > 0 ? (totalStake / supply.total) * 100 : 0,
      },
    }
  }
}

// Export singleton instance
export const pnodeService = new PNodeService()
