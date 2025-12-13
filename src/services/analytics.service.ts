/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Prisma client types need to be regenerated with database connection
import { prisma } from '@/lib/prisma';

/**
 * AnalyticsService - Provides historical data analysis and insights
 * 
 * Features:
 * - Time-series data retrieval
 * - Trend analysis
 * - Performance predictions
 * - Daily aggregations
 */
export class AnalyticsService {
    /**
     * Get network statistics over time
     */
    async getNetworkHistory(
        startDate: Date,
        endDate: Date = new Date(),
        resolution: 'hourly' | 'daily' = 'hourly'
    ) {
        const snapshots = await prisma.networkSnapshot.findMany({
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { timestamp: 'asc' },
        });

        if (resolution === 'daily') {
            return this.aggregateDaily(snapshots);
        }

        // For hourly, group by hour
        return this.aggregateHourly(snapshots);
    }

    /**
     * Get pNode performance history
     */
    async getPNodeHistory(
        pnodePubkey: string,
        startDate: Date,
        endDate: Date = new Date()
    ) {
        const pnode = await prisma.pNode.findUnique({
            where: { pubkey: pnodePubkey },
        });

        if (!pnode) {
            throw new Error(`pNode not found: ${pnodePubkey}`);
        }

        const snapshots = await prisma.pNodeSnapshot.findMany({
            where: {
                pnodeId: pnode.id,
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: { timestamp: 'asc' },
        });

        return {
            pnode: {
                id: pnode.id,
                pubkey: pnode.pubkey,
                firstSeen: pnode.firstSeen,
                lastSeen: pnode.lastSeen,
                location: pnode.location,
                version: pnode.version,
            },
            snapshots: snapshots.map((s) => ({
                timestamp: s.timestamp,
                status: s.status,
                performanceScore: s.performanceScore,
                uptime: s.uptime,
                latency: s.averageLatency,
                successRate: s.successRate,
                utilization: s.utilization,
                capacityTB: Number(s.capacityBytes) / Math.pow(1024, 4),
                usedTB: Number(s.usedBytes) / Math.pow(1024, 4),
            })),
        };
    }

    /**
     * Get network growth metrics
     */
    async getNetworkGrowth(days: number = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const dailyData = await prisma.$queryRaw<Array<{
            date: Date;
            avg_pnodes: number;
            max_pnodes: number;
            avg_capacity: bigint;
            avg_health: number;
        }>>`
      SELECT 
        DATE(timestamp) as date,
        AVG("totalPNodes") as avg_pnodes,
        MAX("totalPNodes") as max_pnodes,
        AVG("totalCapacityBytes") as avg_capacity,
        AVG("healthScore") as avg_health
      FROM "NetworkSnapshot"
      WHERE timestamp >= ${startDate}
      GROUP BY DATE(timestamp)
      ORDER BY date ASC
    `;

        return dailyData.map((d) => ({
            date: d.date,
            pnodes: Math.round(d.avg_pnodes),
            peakPnodes: d.max_pnodes,
            capacityTB: Number(d.avg_capacity) / Math.pow(1024, 4),
            healthScore: Math.round(d.avg_health),
        }));
    }

    /**
     * Get version distribution over time
     */
    async getVersionTrends(days: number = 7) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const snapshots = await prisma.networkSnapshot.findMany({
            where: { timestamp: { gte: startDate } },
            select: {
                timestamp: true,
                versionDistribution: true,
            },
            orderBy: { timestamp: 'asc' },
        });

        // Get unique versions
        const allVersions = new Set<string>();
        snapshots.forEach((s) => {
            const dist = s.versionDistribution as Record<string, number> | null;
            if (dist) {
                Object.keys(dist).forEach((v) => allVersions.add(v));
            }
        });

        // Build time series per version
        const versionSeries: Record<string, Array<{ timestamp: Date; count: number }>> = {};
        allVersions.forEach((v) => {
            versionSeries[v] = [];
        });

        snapshots.forEach((s) => {
            const dist = s.versionDistribution as Record<string, number> | null;
            allVersions.forEach((version) => {
                versionSeries[version].push({
                    timestamp: s.timestamp,
                    count: dist?.[version] || 0,
                });
            });
        });

        return versionSeries;
    }

    /**
     * Get geographic distribution analysis
     */
    async getGeographicAnalysis() {
        // Get latest snapshot with geo data - we filter for NOT undefined since geoDistribution is Json?
        const latestSnapshot = await prisma.networkSnapshot.findFirst({
            where: {
                NOT: {
                    geoDistribution: { equals: undefined },
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        if (!latestSnapshot?.geoDistribution) {
            return { regions: [], trends: [] };
        }

        const geoData = latestSnapshot.geoDistribution as Record<string, number>;

        // Get historical comparison (7 days ago)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const historicalSnapshot = await prisma.networkSnapshot.findFirst({
            where: {
                timestamp: { lte: weekAgo },
                NOT: {
                    geoDistribution: { equals: undefined },
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        const historicalGeo = (historicalSnapshot?.geoDistribution as Record<string, number>) || {};

        const regions = Object.entries(geoData).map(([region, count]) => ({
            region,
            count,
            previousCount: historicalGeo[region] || 0,
            change: count - (historicalGeo[region] || 0),
            percentChange:
                historicalGeo[region] > 0
                    ? ((count - historicalGeo[region]) / historicalGeo[region]) * 100
                    : 100,
        }));

        return {
            regions: regions.sort((a, b) => b.count - a.count),
            total: Object.values(geoData).reduce((sum, c) => sum + c, 0),
            timestamp: latestSnapshot.timestamp,
        };
    }

    /**
     * Get recent network events
     */
    async getRecentEvents(limit: number = 50, severity?: string) {
        const events = await prisma.networkEvent.findMany({
            where: severity ? { severity: severity as 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS' } : {},
            include: {
                pnode: {
                    select: {
                        pubkey: true,
                        location: true,
                        version: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });

        return events.map((e) => ({
            id: e.id,
            timestamp: e.timestamp,
            type: e.type,
            severity: e.severity,
            title: e.title,
            description: e.description,
            metadata: e.metadata,
            pnode: e.pnode
                ? {
                    pubkey: e.pnode.pubkey,
                    location: e.pnode.location,
                    version: e.pnode.version,
                }
                : null,
        }));
    }

    /**
     * Get detected anomalies
     */
    async getAnomalies(limit: number = 20, includeUnconfirmed: boolean = true) {
        const anomalies = await prisma.anomaly.findMany({
            where: includeUnconfirmed ? {} : { confirmed: true },
            orderBy: { timestamp: 'desc' },
            take: limit,
        });

        return anomalies.map((a) => ({
            id: a.id,
            timestamp: a.timestamp,
            metric: a.metric,
            expected: a.expectedValue,
            actual: a.actualValue,
            deviation: a.deviation,
            severity: a.deviation > 3 ? 'critical' : a.deviation > 2 ? 'warning' : 'info',
            description: a.description,
            confirmed: a.confirmed,
        }));
    }

    /**
     * Calculate performance predictions based on trends
     */
    async getPredictions(pnodePubkey?: string) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        if (pnodePubkey) {
            // Individual pNode prediction
            const pnode = await prisma.pNode.findUnique({
                where: { pubkey: pnodePubkey },
            });

            if (!pnode) return null;

            const snapshots = await prisma.pNodeSnapshot.findMany({
                where: {
                    pnodeId: pnode.id,
                    timestamp: { gte: thirtyDaysAgo },
                },
                orderBy: { timestamp: 'asc' },
            });

            if (snapshots.length < 10) {
                return { error: 'Insufficient data for prediction' };
            }

            // Simple linear regression for performance trend
            const performanceTrend = this.calculateLinearTrend(
                snapshots.map((s, i) => ({ x: i, y: s.performanceScore }))
            );

            const utilizationTrend = this.calculateLinearTrend(
                snapshots.map((s, i) => ({ x: i, y: s.utilization }))
            );

            return {
                pnodePubkey,
                dataPoints: snapshots.length,
                performance: {
                    current: snapshots[snapshots.length - 1]?.performanceScore || 0,
                    trend: performanceTrend.slope > 0 ? 'improving' : performanceTrend.slope < 0 ? 'declining' : 'stable',
                    predicted7d: Math.max(0, Math.min(100, performanceTrend.predict(snapshots.length + 7))),
                    predicted30d: Math.max(0, Math.min(100, performanceTrend.predict(snapshots.length + 30))),
                },
                storage: {
                    currentUtilization: snapshots[snapshots.length - 1]?.utilization || 0,
                    trend: utilizationTrend.slope > 0 ? 'increasing' : utilizationTrend.slope < 0 ? 'decreasing' : 'stable',
                    predictedFull: utilizationTrend.slope > 0
                        ? Math.round((100 - (snapshots[snapshots.length - 1]?.utilization || 0)) / utilizationTrend.slope)
                        : null,
                },
            };
        }

        // Network-wide predictions
        const snapshots = await prisma.networkSnapshot.findMany({
            where: { timestamp: { gte: thirtyDaysAgo } },
            orderBy: { timestamp: 'asc' },
        });

        const latestSnapshot = snapshots[snapshots.length - 1];
        const currentPNodes = latestSnapshot?.totalPNodes || 0;
        const currentCapacityTB = Number(latestSnapshot?.totalCapacityBytes || 0) / Math.pow(1024, 4);

        // Return current data even with insufficient history for predictions
        if (snapshots.length < 3) {
            return {
                network: true,
                dataPoints: snapshots.length,
                pnodes: {
                    current: currentPNodes,
                    trend: 'stable' as const,
                    predicted7d: currentPNodes,
                    predicted30d: currentPNodes,
                },
                capacity: {
                    currentTB: currentCapacityTB,
                    trend: 'stable' as const,
                    predicted7dTB: currentCapacityTB,
                    predicted30dTB: currentCapacityTB,
                },
            };
        }

        const pnodeTrend = this.calculateLinearTrend(
            snapshots.map((s, i) => ({ x: i, y: s.totalPNodes }))
        );

        const capacityTrend = this.calculateLinearTrend(
            snapshots.map((s, i) => ({ x: i, y: Number(s.totalCapacityBytes) / Math.pow(1024, 4) }))
        );

        return {
            network: true,
            dataPoints: snapshots.length,
            pnodes: {
                current: currentPNodes,
                trend: pnodeTrend.slope > 0 ? 'growing' : pnodeTrend.slope < 0 ? 'shrinking' : 'stable',
                predicted7d: Math.round(pnodeTrend.predict(snapshots.length + 7)),
                predicted30d: Math.round(pnodeTrend.predict(snapshots.length + 30)),
            },
            capacity: {
                currentTB: currentCapacityTB,
                trend: capacityTrend.slope > 0 ? 'growing' : capacityTrend.slope < 0 ? 'shrinking' : 'stable',
                predicted7dTB: capacityTrend.predict(snapshots.length + 7),
                predicted30dTB: capacityTrend.predict(snapshots.length + 30),
            },
        };
    }

    /**
     * Get top performing pNodes
     */
    async getTopPNodes(limit: number = 10, metric: 'performance' | 'uptime' | 'capacity' = 'performance') {
        // Get latest snapshot for each pNode
        const pnodes = await prisma.pNode.findMany({
            include: {
                snapshots: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
            },
        });

        const pnodesWithMetrics = pnodes
            .filter((p) => p.snapshots.length > 0)
            .map((p) => ({
                pubkey: p.pubkey,
                location: p.location,
                version: p.version,
                firstSeen: p.firstSeen,
                snapshot: p.snapshots[0],
            }));

        // Sort based on metric
        switch (metric) {
            case 'performance':
                pnodesWithMetrics.sort((a, b) => (b.snapshot?.performanceScore || 0) - (a.snapshot?.performanceScore || 0));
                break;
            case 'uptime':
                pnodesWithMetrics.sort((a, b) => (b.snapshot?.uptime || 0) - (a.snapshot?.uptime || 0));
                break;
            case 'capacity':
                pnodesWithMetrics.sort((a, b) => Number(b.snapshot?.capacityBytes || 0) - Number(a.snapshot?.capacityBytes || 0));
                break;
        }

        return pnodesWithMetrics.slice(0, limit).map((p, i) => ({
            rank: i + 1,
            pubkey: p.pubkey,
            location: p.location,
            version: p.version,
            firstSeen: p.firstSeen,
            performanceScore: p.snapshot?.performanceScore,
            uptime: p.snapshot?.uptime,
            capacityTB: Number(p.snapshot?.capacityBytes || 0) / Math.pow(1024, 4),
            utilization: p.snapshot?.utilization,
        }));
    }

    // Private helper methods
    private aggregateDaily(snapshots: Array<{ timestamp: Date; totalPNodes: number; healthScore: number; totalCapacityBytes: bigint }>) {
        const daily: Map<string, { count: number; pnodes: number; health: number; capacity: number }> = new Map();

        snapshots.forEach((s) => {
            const dateKey = s.timestamp.toISOString().split('T')[0];
            const existing = daily.get(dateKey) || { count: 0, pnodes: 0, health: 0, capacity: 0 };
            daily.set(dateKey, {
                count: existing.count + 1,
                pnodes: existing.pnodes + s.totalPNodes,
                health: existing.health + s.healthScore,
                capacity: existing.capacity + Number(s.totalCapacityBytes),
            });
        });

        return Array.from(daily.entries()).map(([date, data]) => ({
            date,
            avgPNodes: Math.round(data.pnodes / data.count),
            avgHealthScore: Math.round(data.health / data.count),
            avgCapacityTB: (data.capacity / data.count) / Math.pow(1024, 4),
        }));
    }

    private aggregateHourly(snapshots: Array<{ timestamp: Date; totalPNodes: number; healthScore: number; totalCapacityBytes: bigint }>) {
        const hourly: Map<string, { count: number; pnodes: number; health: number; capacity: number }> = new Map();

        snapshots.forEach((s) => {
            const hourKey = s.timestamp.toISOString().slice(0, 13);
            const existing = hourly.get(hourKey) || { count: 0, pnodes: 0, health: 0, capacity: 0 };
            hourly.set(hourKey, {
                count: existing.count + 1,
                pnodes: existing.pnodes + s.totalPNodes,
                health: existing.health + s.healthScore,
                capacity: existing.capacity + Number(s.totalCapacityBytes),
            });
        });

        return Array.from(hourly.entries()).map(([hour, data]) => ({
            timestamp: new Date(hour + ':00:00Z'),
            avgPNodes: Math.round(data.pnodes / data.count),
            avgHealthScore: Math.round(data.health / data.count),
            avgCapacityTB: (data.capacity / data.count) / Math.pow(1024, 4),
        }));
    }

    private calculateLinearTrend(points: Array<{ x: number; y: number }>) {
        const n = points.length;
        if (n === 0) return { slope: 0, intercept: 0, predict: () => 0 };

        const sumX = points.reduce((sum, p) => sum + p.x, 0);
        const sumY = points.reduce((sum, p) => sum + p.y, 0);
        const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
        const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) || 0;
        const intercept = (sumY - slope * sumX) / n;

        return {
            slope,
            intercept,
            predict: (x: number) => slope * x + intercept,
        };
    }
}

// Export singleton
export const analyticsService = new AnalyticsService();
