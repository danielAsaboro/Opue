import { Connection } from '@solana/web3.js'
import type { PNode, PNodeDetails, NetworkStats, PNodeStatus, PerformanceMetrics, StorageMetrics } from '@/types/pnode'
import { getLocationForIP } from './geoip.service'

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
 * Service for interacting with Xandeum pRPC endpoints
 */
export class PNodeService {
  private connection: Connection
  private rpcUrl: string
  private prpcPort: number = 6000

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

    // Generate realistic metrics based on status
    const uptime =
      status === 'online'
        ? 95 + Math.random() * 5
        : status === 'delinquent'
          ? 70 + Math.random() * 15
          : Math.random() * 50

    const latency = status === 'online' ? 10 + Math.random() * 30 : 50 + Math.random() * 100

    const successRate =
      status === 'online'
        ? 95 + Math.random() * 5
        : status === 'delinquent'
          ? 80 + Math.random() * 10
          : 50 + Math.random() * 30

    // Storage metrics (estimated based on typical pNode capacity)
    const capacityTB = 1 + Math.random() * 9 // 1-10 TB typical range
    const capacityBytes = capacityTB * Math.pow(1024, 4)
    const utilization = 20 + Math.random() * 60 // 20-80% typical utilization
    const usedBytes = capacityBytes * (utilization / 100)

    const storage: StorageMetrics = {
      capacityBytes,
      usedBytes,
      utilization,
      fileSystems: Math.floor(Math.random() * 50 + 5),
    }

    const performance: PerformanceMetrics = {
      averageLatency: latency,
      successRate,
      uptime,
      lastUpdated: now,
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
   * Fetch all pNodes from the gossip network using pRPC
   * Throws PRPCError if unable to connect to any endpoint
   */
  async fetchAllPNodes(): Promise<PNode[]> {
    const response = await this.fetchPodsFromEndpoints()
    console.log(`Transforming ${response.result.pods.length} pods to PNode format`)
    // Transform pods in parallel with GeoIP lookups
    return Promise.all(response.result.pods.map((pod) => this.transformPodToPNode(pod)))
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

    // Enhance with additional details from the real data
    return {
      ...pnode,
      network: {
        ip: pnode.gossipEndpoint.split(':')[0] || '0.0.0.0',
        port: parseInt(pnode.gossipEndpoint.split(':')[1] || '9001'),
        region: pnode.location,
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
    // Score components
    const uptimeScore = metrics.uptime * 0.3 // 30%
    const storageScore = Math.min((storage.capacityBytes / 1024 ** 4) * 20, 20) // 20%, max at 1TB
    const responseScore = Math.max((100 - metrics.averageLatency) / 100, 0) * 25 // 25%
    const reliabilityScore = metrics.successRate * 0.15 // 15%
    const versionScore = 10 // 10%

    return Math.round(uptimeScore + storageScore + responseScore + reliabilityScore + versionScore)
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
