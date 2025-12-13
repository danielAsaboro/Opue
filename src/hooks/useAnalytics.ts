import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types for analytics data
export interface NetworkHistoryPoint {
    date?: string;
    timestamp?: string;
    avgPNodes: number;
    avgHealthScore: number;
    avgCapacityTB: number;
}

export interface NetworkGrowthPoint {
    date: string;
    pnodes: number;
    peakPnodes: number;
    capacityTB: number;
    healthScore: number;
}

export interface NetworkEvent {
    id: string;
    timestamp: string;
    type: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
    title: string;
    description: string | null;
    metadata: Record<string, unknown>;
    pnode: {
        pubkey: string;
        location: string;
        version: string;
    } | null;
}

export interface Prediction {
    network?: boolean;
    pnodePubkey?: string;
    dataPoints: number;
    pnodes?: {
        current: number;
        trend: 'growing' | 'shrinking' | 'stable';
        predicted7d: number;
        predicted30d: number;
    };
    capacity?: {
        currentTB: number;
        trend: 'growing' | 'shrinking' | 'stable';
        predicted7dTB: number;
        predicted30dTB: number;
    };
    performance?: {
        current: number;
        trend: 'improving' | 'declining' | 'stable';
        predicted7d: number;
        predicted30d: number;
    };
}

export interface LeaderboardEntry {
    rank: number;
    pubkey: string;
    location: string | null;
    version: string;
    firstSeen: string;
    performanceScore: number;
    uptime: number;
    capacityTB: number;
    utilization: number;
}

export interface Anomaly {
    id: string;
    timestamp: string;
    metric: string;
    expected: number;
    actual: number;
    deviation: number;
    severity: 'critical' | 'warning' | 'info';
    description: string;
    confirmed: boolean | null;
}

export interface Alert {
    id: string;
    timestamp: string;
    severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
    message: string;
    value: number;
    threshold: number;
    resolved: boolean;
    rule: { name: string; metric: string };
    pnode: { pubkey: string; location: string } | null;
}

export interface AlertRule {
    id: string;
    name: string;
    description: string | null;
    enabled: boolean;
    metric: string;
    operator: string;
    threshold: number;
    scope: 'NETWORK' | 'PNODE';
    cooldownMinutes: number;
    lastTriggered: string | null;
    alerts: Alert[];
}

// ============================================
// Analytics Hooks
// ============================================

/**
 * Fetch network history for charts
 */
export function useNetworkHistory(days: number = 7, resolution: 'hourly' | 'daily' = 'hourly') {
    return useQuery({
        queryKey: ['analytics', 'history', 'network', days, resolution],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/history?type=network&days=${days}&resolution=${resolution}`);
            if (!res.ok) throw new Error('Failed to fetch network history');
            const json = await res.json();
            return json.data as NetworkHistoryPoint[];
        },
        staleTime: 60 * 1000, // 1 minute
        refetchInterval: 60 * 1000,
    });
}

/**
 * Fetch network growth metrics
 */
export function useNetworkGrowth(days: number = 30) {
    return useQuery({
        queryKey: ['analytics', 'growth', days],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/history?type=growth&days=${days}`);
            if (!res.ok) throw new Error('Failed to fetch growth data');
            const json = await res.json();
            return json.data as NetworkGrowthPoint[];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch geographic distribution
 */
export function useGeographicAnalysis() {
    return useQuery({
        queryKey: ['analytics', 'geo'],
        queryFn: async () => {
            const res = await fetch('/api/analytics/history?type=geo');
            if (!res.ok) throw new Error('Failed to fetch geo data');
            const json = await res.json();
            return json.data as {
                regions: Array<{
                    region: string;
                    count: number;
                    previousCount: number;
                    change: number;
                    percentChange: number;
                }>;
                total: number;
                timestamp: string;
            };
        },
        staleTime: 60 * 1000,
    });
}

/**
 * Fetch recent network events
 */
export function useNetworkEvents(limit: number = 50, severity?: string) {
    return useQuery({
        queryKey: ['analytics', 'events', limit, severity],
        queryFn: async () => {
            const url = `/api/analytics/events?limit=${limit}${severity ? `&severity=${severity}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch events');
            const json = await res.json();
            return json.data as NetworkEvent[];
        },
        staleTime: 30 * 1000, // 30 seconds
        refetchInterval: 30 * 1000,
    });
}

/**
 * Fetch predictions
 */
export function usePredictions(pnodePubkey?: string) {
    return useQuery({
        queryKey: ['analytics', 'predictions', pnodePubkey || 'network'],
        queryFn: async () => {
            const url = `/api/analytics/predictions${pnodePubkey ? `?pnode=${pnodePubkey}` : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch predictions');
            const json = await res.json();
            return json.data as Prediction;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Fetch leaderboard
 */
export function useLeaderboard(limit: number = 10, metric: 'performance' | 'uptime' | 'capacity' = 'performance') {
    return useQuery({
        queryKey: ['analytics', 'leaderboard', limit, metric],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/leaderboard?limit=${limit}&metric=${metric}`);
            if (!res.ok) throw new Error('Failed to fetch leaderboard');
            const json = await res.json();
            return json.data as LeaderboardEntry[];
        },
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
    });
}

/**
 * Fetch anomalies
 */
export function useAnomalies(limit: number = 20) {
    return useQuery({
        queryKey: ['analytics', 'anomalies', limit],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/anomalies?limit=${limit}`);
            if (!res.ok) throw new Error('Failed to fetch anomalies');
            const json = await res.json();
            return json.data as Anomaly[];
        },
        staleTime: 60 * 1000,
        refetchInterval: 60 * 1000,
    });
}

/**
 * Fetch pNode history
 */
export function usePNodeHistory(pubkey: string, days: number = 7) {
    return useQuery({
        queryKey: ['analytics', 'pnode', pubkey, days],
        queryFn: async () => {
            const res = await fetch(`/api/analytics/pnode/${pubkey}?days=${days}`);
            if (!res.ok) throw new Error('Failed to fetch pNode history');
            const json = await res.json();
            return json.data as {
                pnode: {
                    id: string;
                    pubkey: string;
                    firstSeen: string;
                    lastSeen: string;
                    location: string;
                    version: string;
                };
                snapshots: Array<{
                    timestamp: string;
                    status: string;
                    performanceScore: number;
                    uptime: number;
                    latency: number;
                    successRate: number;
                    utilization: number;
                    capacityTB: number;
                    usedTB: number;
                }>;
            };
        },
        staleTime: 60 * 1000,
        enabled: !!pubkey,
    });
}

// ============================================
// Alert Hooks
// ============================================

/**
 * Fetch alerts
 */
export function useAlerts(options: { limit?: number; unresolved?: boolean } = {}) {
    const { limit = 50, unresolved = false } = options;
    return useQuery({
        queryKey: ['alerts', limit, unresolved],
        queryFn: async () => {
            const res = await fetch(`/api/alerts?limit=${limit}&unresolved=${unresolved}`);
            if (!res.ok) throw new Error('Failed to fetch alerts');
            const json = await res.json();
            return json.data as Alert[];
        },
        staleTime: 30 * 1000,
        refetchInterval: 30 * 1000,
    });
}

/**
 * Fetch alert rules
 */
export function useAlertRules() {
    return useQuery({
        queryKey: ['alertRules'],
        queryFn: async () => {
            const res = await fetch('/api/alerts/rules');
            if (!res.ok) throw new Error('Failed to fetch alert rules');
            const json = await res.json();
            return json.data as AlertRule[];
        },
        staleTime: 60 * 1000,
    });
}

/**
 * Create alert rule mutation
 */
export function useCreateAlertRule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (rule: {
            name: string;
            description?: string;
            metric: string;
            operator: '<' | '>' | '==' | '<=' | '>=';
            threshold: number;
            scope?: 'NETWORK' | 'PNODE';
            pnodeFilter?: string;
            cooldownMinutes?: number;
        }) => {
            const res = await fetch('/api/alerts/rules', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(rule),
            });
            if (!res.ok) throw new Error('Failed to create alert rule');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alertRules'] });
        },
    });
}

/**
 * Resolve alert mutation
 */
export function useResolveAlert() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (alertId: string) => {
            const res = await fetch('/api/alerts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alertId }),
            });
            if (!res.ok) throw new Error('Failed to resolve alert');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['alerts'] });
        },
    });
}
