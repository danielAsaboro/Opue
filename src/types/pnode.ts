/**
 * Type definitions for Xandeum pNode data structures
 */

export type PNodeStatus = 'online' | 'offline' | 'delinquent';

export interface PNodeInfo {
    /** pNode public key / identifier */
    id: string;

    /** Gossip network endpoint */
    gossip: string;

    /** RPC endpoint (if available) */
    rpc?: string;

    /** Software version */
    version: string;

    /** Shred version */
    shredVersion?: number;

    /** Feature set */
    featureSet?: number;

    /** Last seen timestamp */
    lastSeen: number;
}

export interface PerformanceMetrics {
    /** Average latency in milliseconds */
    averageLatency: number;

    /** Success rate percentage (0-100) */
    successRate: number;

    /** Uptime percentage (0-100) */
    uptime: number;

    /** Raw uptime in seconds from pnRPC */
    uptimeSeconds?: number;

    /** Last updated timestamp */
    lastUpdated: number;

    /** Whether these metrics are estimated (not from real measurements) */
    isEstimated?: boolean;
}

export interface NetworkMetrics {
    /** Number of active streams/connections */
    activeStreams: number;

    /** Total packets received */
    packetsReceived: number;

    /** Total packets sent */
    packetsSent: number;

    /** CPU usage percentage */
    cpuPercent: number;

    /** RAM used in bytes */
    ramUsed: number;

    /** Total RAM in bytes */
    ramTotal: number;
}

export interface StorageMetrics {
    /** Total storage capacity in bytes */
    capacityBytes: number;

    /** Used storage in bytes */
    usedBytes: number;

    /** Storage utilization percentage (0-100) */
    utilization: number;

    /** Number of file systems hosted */
    fileSystems: number;

    /** Whether these metrics are estimated (not from real measurements) */
    isEstimated?: boolean;
}

export interface PNode {
    /** Unique identifier (pubkey) */
    id: string;

    /** Current status */
    status: PNodeStatus;

    /** Storage metrics */
    storage: StorageMetrics;

    /** Performance score (0-100) */
    performanceScore: number;

    /** Performance metrics */
    performance: PerformanceMetrics;

    /** Network metrics (CPU, RAM, packets) */
    networkMetrics?: NetworkMetrics;

    /** Software version */
    version: string;

    /** Shred version */
    shredVersion?: number;

    /** Geographic location (if available) */
    location?: string;

    /** Last seen timestamp */
    lastSeen: Date;

    /** Whether this pNode is publicly accessible */
    isPublic?: boolean;

    /** pnRPC port (usually 6000) */
    pnrpcPort?: number;

    /** RPC endpoint */
    rpcEndpoint?: string;

    /** TPU endpoint */
    tpuEndpoint?: string;

    /** Gossip endpoint */
    gossipEndpoint: string;
}

export interface PNodeDetails extends PNode {
    /** Detailed network information */
    network: {
        ip: string;
        port: number;
        tpu?: string;
        region?: string;
        asn?: string;
        datacenter?: string;
        country?: string;
        countryCode?: string;
        city?: string;
        org?: string;
        lat?: number;
        lon?: number;
    };

    /** Historical performance data */
    history: {
        performanceScores: TimeSeriesData[];
        storageUtilization: TimeSeriesData[];
        uptimeHistory: TimeSeriesData[];
    };
}

export interface TimeSeriesData {
    timestamp: number;
    value: number;
}

export interface NetworkStats {
    /** Total number of pNodes */
    totalPNodes: number;

    /** Number of online pNodes */
    onlinePNodes: number;

    /** Number of offline pNodes */
    offlinePNodes: number;

    /** Total network storage capacity in bytes */
    totalCapacity: number;

    /** Total used storage in bytes */
    totalUsed: number;

    /** Network health score (0-100) */
    healthScore: number;

    /** Average performance score */
    averagePerformance: number;

    /** Last updated timestamp */
    lastUpdated: number;

    /** Average network latency in ms */
    averageLatency?: number;

    /** Number of active peers */
    activePeers?: number;

    /** 24 hour transaction/storage volume in bytes */
    volume24h?: number;

    /** Current staking APY percentage */
    stakingAPY?: number;
}

export interface EpochInfo {
    /** Current epoch number */
    epoch: number;

    /** Slot index within epoch */
    slotIndex: number;

    /** Total slots in epoch */
    slotsInEpoch: number;

    /** Absolute slot number */
    absoluteSlot: number;

    /** Block height */
    blockHeight: number;

    /** Transaction count */
    transactionCount?: number;

    /** Time remaining in epoch (seconds) */
    timeRemaining?: number;

    /** Progress percentage (0-100) */
    progress: number;
}

export interface StakingReward {
    /** Epoch when reward was earned */
    epoch: number;

    /** Reward amount in lamports */
    amount: number;

    /** Post balance after reward */
    postBalance: number;

    /** Reward type */
    rewardType: 'staking' | 'voting' | 'rent';

    /** Timestamp */
    timestamp: number;
}

export interface StakingInfo {
    /** Total staked amount */
    totalStaked: number;

    /** Active stake */
    activeStake: number;

    /** Inactive stake */
    inactiveStake: number;

    /** Current APY */
    apy: number;

    /** Projected daily earnings */
    projectedDaily: number;

    /** Projected monthly earnings */
    projectedMonthly: number;

    /** Projected yearly earnings */
    projectedYearly: number;

    /** Recent rewards */
    recentRewards: StakingReward[];
}

export interface NetworkTopologyNode {
    /** Node ID */
    id: string;

    /** Node label */
    label: string;

    /** Node type */
    type: 'validator' | 'pnode' | 'rpc' | 'bootstrap';

    /** Status */
    status: 'online' | 'offline';

    /** Connected peer IDs */
    peers: string[];

    /** Position for visualization */
    x?: number;
    y?: number;
}

export interface PNodeFilters {
    status?: PNodeStatus[];
    minStorage?: number;
    maxStorage?: number;
    minPerformance?: number;
    maxPerformance?: number;
    version?: string[];
    location?: string[];
    search?: string;
}

export interface PNodeSortOptions {
    field: 'id' | 'storage' | 'performance' | 'uptime' | 'lastSeen';
    order: 'asc' | 'desc';
}
