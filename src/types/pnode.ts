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

    /** Last updated timestamp */
    lastUpdated: number;
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
}

export interface PNode {
    /** Unique identifier */
    id: string;

    /** Current status */
    status: PNodeStatus;

    /** Storage metrics */
    storage: StorageMetrics;

    /** Performance score (0-100) */
    performanceScore: number;

    /** Performance metrics */
    performance: PerformanceMetrics;

    /** Software version */
    version: string;

    /** Geographic location (if available) */
    location?: string;

    /** Last seen timestamp */
    lastSeen: Date;

    /** RPC endpoint */
    rpcEndpoint?: string;

    /** Gossip endpoint */
    gossipEndpoint: string;
}

export interface PNodeDetails extends PNode {
    /** Detailed network information */
    network: {
        ip: string;
        port: number;
        region?: string;
        asn?: string;
        datacenter?: string;
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
