import type { PNode } from '@/types/pnode'
import { prisma } from '@/lib/prisma'

export interface AnomalyDetection {
  type: 'performance' | 'storage' | 'network' | 'uptime'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedPNodes: string[]
  timestamp: Date
  confidence: number // 0-1
}

export interface PredictiveInsight {
  type: 'trend' | 'forecast' | 'recommendation'
  title: string
  description: string
  confidence: number
  timeframe: string // e.g., "next 24h", "next week"
  impact: 'low' | 'medium' | 'high'
  data: Record<string, unknown>
}

export interface NetworkHealthScore {
  overall: number // 0-100
  components: {
    decentralization: number
    performance: number
    reliability: number
    growth: number
    stability: number
  }
  trends: {
    direction: 'improving' | 'stable' | 'declining'
    rate: number // percentage change
  }
  recommendations: string[]
}

export interface AnalyticsMetrics {
  networkGrowth: {
    pnodeCount: number[]
    storageCapacity: number[]
    performance: number[]
    timestamps: Date[]
  }
  decentralization: {
    giniCoefficient: number
    uniqueLocations: number
    topConcentration: number
    geographicSpread: number
  }
  reliability: {
    averageUptime: number
    failureRate: number
    recoveryTime: number
    stabilityScore: number
  }
  predictions: {
    nextWeekGrowth: number
    storageDemand: number
    performanceTrend: 'improving' | 'stable' | 'declining'
  }
}

export class AdvancedAnalyticsService {
  private historicalData: Map<string, unknown[]> = new Map()
  private anomalyThresholds = {
    performanceDrop: 0.2, // 20% drop
    uptimeDrop: 0.1, // 10% drop
    storageDeviation: 2.0, // 2 standard deviations
    networkInstability: 0.15, // 15% variance
  }

  /**
   * Analyze current pNode data for anomalies
   */
  detectAnomalies(pnodes: PNode[], _historicalData?: unknown): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []

    // Performance anomalies
    const performanceAnomalies = this.detectPerformanceAnomalies(pnodes)
    anomalies.push(...performanceAnomalies)

    // Network anomalies
    const networkAnomalies = this.detectNetworkAnomalies(pnodes)
    anomalies.push(...networkAnomalies)

    // Storage anomalies
    const storageAnomalies = this.detectStorageAnomalies(pnodes)
    anomalies.push(...storageAnomalies)

    // Uptime anomalies
    const uptimeAnomalies = this.detectUptimeAnomalies(pnodes)
    anomalies.push(...uptimeAnomalies)

    return anomalies.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  /**
   * Generate predictive insights
   */
  generatePredictions(pnodes: PNode[], historicalData?: unknown): PredictiveInsight[] {
    const predictions: PredictiveInsight[] = []

    // Growth predictions
    const growthPredictions = this.predictNetworkGrowth(pnodes, historicalData)
    predictions.push(...growthPredictions)

    // Performance predictions
    const performancePredictions = this.predictPerformanceTrends(pnodes)
    predictions.push(...performancePredictions)

    // Storage predictions
    const storagePredictions = this.predictStorageDemand(pnodes)
    predictions.push(...storagePredictions)

    // Recommendations
    const recommendations = this.generateRecommendations(pnodes)
    predictions.push(...recommendations)

    return predictions.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Calculate comprehensive network health score
   */
  calculateNetworkHealth(pnodes: PNode[]): NetworkHealthScore {
    const decentralization = this.calculateDecentralizationScore(pnodes)
    const performance = this.calculateAveragePerformance(pnodes)
    const reliability = this.calculateReliabilityScore(pnodes)
    const growth = this.calculateGrowthScore(pnodes)
    const stability = this.calculateStabilityScore(pnodes)

    // Weighted overall score
    const overall = Math.round(
      decentralization * 0.25 + performance * 0.25 + reliability * 0.2 + growth * 0.15 + stability * 0.15,
    )

    // Determine trend (simplified - would use historical data)
    const trends = this.calculateHealthTrends(pnodes)

    // Generate recommendations
    const recommendations = this.generateHealthRecommendations({
      decentralization,
      performance,
      reliability,
      growth,
      stability,
    })

    return {
      overall,
      components: {
        decentralization,
        performance,
        reliability,
        growth,
        stability,
      },
      trends,
      recommendations,
    }
  }

  /**
   * Get comprehensive analytics metrics
   */
  getAnalyticsMetrics(pnodes: PNode[]): AnalyticsMetrics {
    return {
      networkGrowth: this.calculateNetworkGrowth(pnodes),
      decentralization: this.calculateDecentralizationMetrics(pnodes),
      reliability: this.calculateReliabilityMetrics(pnodes),
      predictions: this.generatePredictionsData(pnodes),
    }
  }

  // ===== PRIVATE METHODS =====

  private detectPerformanceAnomalies(pnodes: PNode[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    const avgPerformance = pnodes.reduce((sum, p) => sum + p.performanceScore, 0) / pnodes.length

    pnodes.forEach((pnode) => {
      const deviation = Math.abs(pnode.performanceScore - avgPerformance) / avgPerformance

      if (deviation > this.anomalyThresholds.performanceDrop) {
        const severity = deviation > 0.5 ? 'critical' : deviation > 0.3 ? 'high' : deviation > 0.2 ? 'medium' : 'low'

        anomalies.push({
          type: 'performance',
          severity: severity as AnomalyDetection['severity'],
          description: `${pnode.id.slice(0, 8)}... performance ${deviation > 0 ? 'significantly above' : 'below'} network average`,
          affectedPNodes: [pnode.id],
          timestamp: new Date(),
          confidence: Math.min(deviation * 2, 0.95),
        })
      }
    })

    return anomalies
  }

  private detectNetworkAnomalies(pnodes: PNode[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []

    // Check for concentration risk
    const locations = new Map<string, number>()
    pnodes.forEach((pnode) => {
      const location = pnode.location || 'Unknown'
      locations.set(location, (locations.get(location) || 0) + 1)
    })

    const totalPNodes = pnodes.length
    const maxConcentration = Math.max(...Array.from(locations.values())) / totalPNodes

    if (maxConcentration > 0.5) {
      // More than 50% in one location
      anomalies.push({
        type: 'network',
        severity: 'high',
        description: `High geographic concentration: ${(maxConcentration * 100).toFixed(1)}% of pNodes in single location`,
        affectedPNodes: [], // Affects entire network
        timestamp: new Date(),
        confidence: 0.85,
      })
    }

    return anomalies
  }

  private detectStorageAnomalies(pnodes: PNode[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    const storageValues = pnodes.map((p) => p.storage.capacityBytes)
    const mean = storageValues.reduce((a, b) => a + b, 0) / storageValues.length
    const variance = storageValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / storageValues.length
    const stdDev = Math.sqrt(variance)

    pnodes.forEach((pnode) => {
      const deviation = Math.abs(pnode.storage.capacityBytes - mean) / stdDev

      if (deviation > this.anomalyThresholds.storageDeviation) {
        anomalies.push({
          type: 'storage',
          severity: deviation > 3 ? 'high' : 'medium',
          description: `${pnode.id.slice(0, 8)}... storage capacity significantly ${pnode.storage.capacityBytes > mean ? 'above' : 'below'} average`,
          affectedPNodes: [pnode.id],
          timestamp: new Date(),
          confidence: Math.min(deviation / 4, 0.9),
        })
      }
    })

    return anomalies
  }

  private detectUptimeAnomalies(pnodes: PNode[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    const offlinePNodes = pnodes.filter((p) => p.status === 'offline')

    if (offlinePNodes.length > pnodes.length * 0.1) {
      // More than 10% offline
      anomalies.push({
        type: 'uptime',
        severity: offlinePNodes.length > pnodes.length * 0.2 ? 'critical' : 'high',
        description: `${offlinePNodes.length} pNodes currently offline (${((offlinePNodes.length / pnodes.length) * 100).toFixed(1)}% of network)`,
        affectedPNodes: offlinePNodes.map((p) => p.id),
        timestamp: new Date(),
        confidence: 0.95,
      })
    }

    return anomalies
  }

  private predictNetworkGrowth(pnodes: PNode[], _historicalData?: unknown): PredictiveInsight[] {
    // Simplified prediction based on current trends
    const currentCount = pnodes.length
    const growthRate = 0.05 // 5% weekly growth assumption
    const predictedGrowth = Math.round(currentCount * growthRate)

    return [
      {
        type: 'forecast',
        title: 'Network Growth Prediction',
        description: `Expected to add ${predictedGrowth} new pNodes in the next week`,
        confidence: 0.7,
        timeframe: 'next week',
        impact: 'medium',
        data: { currentCount, predictedCount: currentCount + predictedGrowth },
      },
    ]
  }

  private predictPerformanceTrends(pnodes: PNode[]): PredictiveInsight[] {
    const avgPerformance = pnodes.reduce((sum, p) => sum + p.performanceScore, 0) / pnodes.length
    const trend = avgPerformance > 75 ? 'improving' : avgPerformance > 60 ? 'stable' : 'declining'

    return [
      {
        type: 'trend',
        title: 'Performance Trend Analysis',
        description: `Network performance is ${trend} with average score of ${avgPerformance.toFixed(1)}/100`,
        confidence: 0.8,
        timeframe: 'current',
        impact: trend === 'declining' ? 'high' : 'low',
        data: { avgPerformance, trend },
      },
    ]
  }

  private predictStorageDemand(pnodes: PNode[]): PredictiveInsight[] {
    const totalCapacity = pnodes.reduce((sum, p) => sum + p.storage.capacityBytes, 0)
    const utilizationRate = 0.3 // Assume 30% utilization
    const demandGrowth = 0.15 // 15% quarterly growth

    return [
      {
        type: 'forecast',
        title: 'Storage Demand Forecast',
        description: `Storage demand expected to grow ${demandGrowth * 100}% in next quarter`,
        confidence: 0.6,
        timeframe: 'next quarter',
        impact: 'medium',
        data: { totalCapacity, utilizationRate, demandGrowth },
      },
    ]
  }

  private generateRecommendations(pnodes: PNode[]): PredictiveInsight[] {
    const recommendations: PredictiveInsight[] = []

    // Check decentralization
    const uniqueLocations = new Set(pnodes.map((p) => p.location).filter(Boolean)).size
    if (uniqueLocations < 5) {
      recommendations.push({
        type: 'recommendation',
        title: 'Improve Geographic Distribution',
        description: 'Consider adding pNodes in new geographic regions to improve network decentralization',
        confidence: 0.9,
        timeframe: 'ongoing',
        impact: 'high',
        data: { currentLocations: uniqueLocations, recommendedMinimum: 5 },
      })
    }

    // Check performance distribution
    const lowPerformers = pnodes.filter((p) => p.performanceScore < 60).length
    if (lowPerformers > pnodes.length * 0.2) {
      recommendations.push({
        type: 'recommendation',
        title: 'Address Performance Issues',
        description: `${lowPerformers} pNodes have performance scores below 60. Review and optimize.`,
        confidence: 0.85,
        timeframe: 'immediate',
        impact: 'high',
        data: { lowPerformers, totalPNodes: pnodes.length },
      })
    }

    return recommendations
  }

  private calculateDecentralizationScore(pnodes: PNode[]): number {
    const locations = new Map<string, number>()
    pnodes.forEach((pnode) => {
      const location = pnode.location || 'Unknown'
      locations.set(location, (locations.get(location) || 0) + 1)
    })

    const uniqueLocations = locations.size
    const maxConcentration = Math.max(...Array.from(locations.values())) / pnodes.length

    // Score based on location diversity and avoiding single points of failure
    const diversityScore = Math.min(uniqueLocations / 10, 1) * 100 // Max score at 10 locations
    const concentrationPenalty = maxConcentration > 0.3 ? (maxConcentration - 0.3) * 200 : 0

    return Math.max(0, Math.min(100, diversityScore - concentrationPenalty))
  }

  private calculateAveragePerformance(pnodes: PNode[]): number {
    return pnodes.reduce((sum, p) => sum + p.performanceScore, 0) / pnodes.length
  }

  private calculateReliabilityScore(pnodes: PNode[]): number {
    const onlinePNodes = pnodes.filter((p) => p.status === 'online').length
    const avgUptime = pnodes.reduce((sum, p) => sum + p.performance.uptime, 0) / pnodes.length

    return (onlinePNodes / pnodes.length) * 60 + (avgUptime / 100) * 40
  }

  private calculateGrowthScore(pnodes: PNode[]): number {
    // Simplified growth score - would use historical data
    const utilization = pnodes.reduce((sum, p) => sum + p.storage.utilization, 0) / pnodes.length
    return Math.min(utilization * 100, 100) // Higher utilization suggests growth
  }

  private calculateStabilityScore(pnodes: PNode[]): number {
    const performanceVariance = this.calculateVariance(pnodes.map((p) => p.performanceScore))
    const normalizedVariance = performanceVariance / 1000 // Normalize

    return Math.max(0, 100 - normalizedVariance * 100)
  }

  private calculateHealthTrends(pnodes: PNode[]): { direction: 'improving' | 'stable' | 'declining'; rate: number } {
    // Simplified - would use historical data
    const avgPerformance = this.calculateAveragePerformance(pnodes)

    if (avgPerformance > 80) {
      return { direction: 'improving', rate: 5 }
    } else if (avgPerformance > 60) {
      return { direction: 'stable', rate: 0 }
    } else {
      return { direction: 'declining', rate: -3 }
    }
  }

  private generateHealthRecommendations(scores: NetworkHealthScore['components']): string[] {
    const recommendations: string[] = []

    if (scores.decentralization < 60) {
      recommendations.push('Improve geographic distribution by adding pNodes in new regions')
    }

    if (scores.performance < 70) {
      recommendations.push('Address performance issues across the network')
    }

    if (scores.reliability < 80) {
      recommendations.push('Improve uptime and reliability of pNode operations')
    }

    if (scores.growth < 50) {
      recommendations.push('Increase network utilization and storage adoption')
    }

    return recommendations
  }

  private calculateNetworkGrowth(pnodes: PNode[]): AnalyticsMetrics['networkGrowth'] {
    // Generate mock historical data for demo
    const baseCount = pnodes.length * 0.8
    const pnodeCount = Array.from({ length: 30 }, (_, i) =>
      Math.round(baseCount + (pnodes.length - baseCount) * (i / 29)),
    )

    const storageCapacity = pnodeCount.map(
      (count) => count * (pnodes.reduce((sum, p) => sum + p.storage.capacityBytes, 0) / pnodes.length),
    )

    const performance = Array.from({ length: 30 }, () => 70 + Math.random() * 20)
    const timestamps = Array.from({ length: 30 }, (_, i) => new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000))

    return { pnodeCount, storageCapacity, performance, timestamps }
  }

  private calculateDecentralizationMetrics(pnodes: PNode[]): AnalyticsMetrics['decentralization'] {
    const locations = new Map<string, number>()
    pnodes.forEach((pnode) => {
      const location = pnode.location || 'Unknown'
      locations.set(location, (locations.get(location) || 0) + 1)
    })

    const storageByLocation = new Map<string, number>()
    pnodes.forEach((pnode) => {
      const location = pnode.location || 'Unknown'
      storageByLocation.set(location, (storageByLocation.get(location) || 0) + pnode.storage.capacityBytes)
    })

    const storageValues = Array.from(storageByLocation.values())
    const giniCoefficient = this.calculateGiniCoefficient(storageValues)

    return {
      giniCoefficient,
      uniqueLocations: locations.size,
      topConcentration: Math.max(...Array.from(locations.values())) / pnodes.length,
      geographicSpread: locations.size / Math.max(pnodes.length * 0.1, 3), // Normalize
    }
  }

  private calculateReliabilityMetrics(pnodes: PNode[]): AnalyticsMetrics['reliability'] {
    const onlineCount = pnodes.filter((p) => p.status === 'online').length
    const avgUptime = pnodes.reduce((sum, p) => sum + p.performance.uptime, 0) / pnodes.length

    return {
      averageUptime: avgUptime,
      failureRate: (pnodes.length - onlineCount) / pnodes.length,
      recoveryTime: 3600, // Mock - 1 hour average recovery
      stabilityScore: avgUptime * 0.7 + (onlineCount / pnodes.length) * 0.3,
    }
  }

  private generatePredictionsData(pnodes: PNode[]): AnalyticsMetrics['predictions'] {
    const currentCount = pnodes.length
    const weeklyGrowthRate = 0.02 // 2% weekly growth

    return {
      nextWeekGrowth: Math.round(currentCount * weeklyGrowthRate),
      storageDemand: 0.85, // 85% of capacity utilized
      performanceTrend: 'stable' as const,
    }
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  }

  private calculateGiniCoefficient(values: number[]): number {
    if (values.length === 0) return 0

    const sortedValues = [...values].sort((a, b) => a - b)
    const n = sortedValues.length
    let sum = 0

    sortedValues.forEach((value, i) => {
      sum += (i + 1) * value
    })

    const mean = sortedValues.reduce((a, b) => a + b, 0) / n
    return (2 * sum) / (n * n * mean) - (n + 1) / n
  }

  // ===== DATABASE QUERY METHODS =====

  /**
   * Get network history data for charts
   */
  async getNetworkHistory(startDate: Date, endDate: Date, resolution: 'hourly' | 'daily' = 'daily') {
    // Query network snapshots with aggregation
    const snapshots = await prisma.networkSnapshot.findMany({
      where: {
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    })

    // Group by time period and calculate averages
    type NetworkSnapshotType = (typeof snapshots)[number]
    const groupedData = new Map<string, NetworkSnapshotType[]>()

    snapshots.forEach((snapshot) => {
      const key =
        resolution === 'hourly'
          ? snapshot.timestamp.toISOString().slice(0, 13) // YYYY-MM-DDTHH
          : snapshot.timestamp.toISOString().slice(0, 10) // YYYY-MM-DD

      if (!groupedData.has(key)) {
        groupedData.set(key, [])
      }
      groupedData.get(key)!.push(snapshot)
    })

    // Calculate averages for each time period
    const result = Array.from(groupedData.entries()).map(([timeKey, periodSnapshots]) => {
      const avgPNodes = periodSnapshots.reduce((sum, s) => sum + s.totalPNodes, 0) / periodSnapshots.length
      const avgHealthScore = periodSnapshots.reduce((sum, s) => sum + s.healthScore, 0) / periodSnapshots.length
      const avgCapacityTB =
        periodSnapshots.reduce((sum, s) => sum + Number(s.totalCapacityBytes), 0) / periodSnapshots.length / 1024 ** 4

      return {
        timestamp: timeKey,
        date: resolution === 'daily' ? timeKey : timeKey + ':00:00.000Z',
        avgPNodes: Math.round(avgPNodes),
        avgHealthScore: Math.round(avgHealthScore),
        avgCapacityTB: Math.round(avgCapacityTB * 100) / 100,
      }
    })

    return result
  }

  /**
   * Get network growth metrics
   */
  async getNetworkGrowth(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const snapshots = await prisma.networkSnapshot.findMany({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    })

    return snapshots.map((snapshot) => ({
      date: snapshot.timestamp.toISOString().slice(0, 10),
      pnodes: snapshot.totalPNodes,
      peakPnodes: snapshot.totalPNodes, // Could be calculated differently
      capacityTB: Number(snapshot.totalCapacityBytes) / 1024 ** 4,
      healthScore: snapshot.healthScore,
    }))
  }

  /**
   * Get version distribution trends
   */
  async getVersionTrends(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    const versions = await prisma.pNode.groupBy({
      by: ['version'],
      where: {
        lastSeen: {
          gte: startDate,
        },
      },
      _count: {
        version: true,
      },
    })

    return versions.map((v) => ({
      version: v.version,
      count: v._count.version,
    }))
  }

  /**
   * Get geographic distribution analysis
   */
  async getGeographicAnalysis() {
    const regions = await prisma.pNode.groupBy({
      by: ['location'],
      where: {
        location: {
          not: null,
        },
      },
      _count: {
        location: true,
      },
    })

    const total = regions.reduce((sum, r) => sum + r._count.location, 0)

    // Get previous period for comparison (last 7 days vs previous 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

    const previousRegions = await prisma.pNode.groupBy({
      by: ['location'],
      where: {
        location: {
          not: null,
        },
        lastSeen: {
          gte: twoWeeksAgo,
          lt: oneWeekAgo,
        },
      },
      _count: {
        location: true,
      },
    })

    const regionData = regions.map((region) => {
      const previousCount = previousRegions.find((pr) => pr.location === region.location)?._count.location || 0
      const currentCount = region._count.location
      const change = currentCount - previousCount
      const percentChange = previousCount > 0 ? (change / previousCount) * 100 : 0

      return {
        region: region.location || 'Unknown',
        count: currentCount,
        previousCount,
        change,
        percentChange: Math.round(percentChange * 100) / 100,
      }
    })

    return {
      regions: regionData.sort((a, b) => b.count - a.count),
      total,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Get top performing pNodes for leaderboard
   */
  async getTopPNodes(limit: number = 10, metric: 'performance' | 'uptime' | 'capacity' = 'performance') {
    type OrderByType = { performanceScore: 'desc' } | { uptime: 'desc' } | { capacityBytes: 'desc' }
    let orderBy: OrderByType

    switch (metric) {
      case 'performance':
        orderBy = { performanceScore: 'desc' as const }
        break
      case 'uptime':
        orderBy = { uptime: 'desc' as const }
        break
      case 'capacity':
        orderBy = { capacityBytes: 'desc' as const }
        break
    }

    const snapshots = await prisma.pNodeSnapshot.findMany({
      take: limit,
      orderBy,
      include: {
        pnode: true,
      },
    })

    return snapshots.map((snapshot, index) => ({
      rank: index + 1,
      pubkey: snapshot.pnode.pubkey,
      location: snapshot.pnode.location,
      version: snapshot.pnode.version,
      firstSeen: snapshot.pnode.firstSeen.toISOString(),
      performanceScore: snapshot.performanceScore,
      uptime: snapshot.uptime,
      capacityTB: Number(snapshot.capacityBytes) / 1024 ** 4,
      utilization: snapshot.utilization,
    }))
  }

  /**
   * Get recent network events
   */
  async getNetworkEvents(limit: number = 50, severity?: string) {
    const validSeverities = ['INFO', 'WARNING', 'CRITICAL', 'SUCCESS'] as const
    type SeverityType = (typeof validSeverities)[number]
    const severityFilter = severity && validSeverities.includes(severity as SeverityType)
      ? { severity: severity as SeverityType }
      : {}

    const events = await prisma.networkEvent.findMany({
      take: limit,
      where: severityFilter,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        pnode: true,
      },
    })

    return events.map((event) => ({
      id: event.id,
      timestamp: event.timestamp.toISOString(),
      type: event.type,
      severity: event.severity,
      title: event.title,
      description: event.description,
      metadata: event.metadata as Record<string, unknown>,
      pnode: event.pnode
        ? {
            pubkey: event.pnode.pubkey,
            location: event.pnode.location,
            version: event.pnode.version,
          }
        : null,
    }))
  }

  /**
   * Get predictions based on historical data
   */
  async getPredictions(pnodePubkey?: string) {
    if (pnodePubkey) {
      // Individual pNode predictions
      const snapshots = await prisma.pNodeSnapshot.findMany({
        where: {
          pnode: {
            pubkey: pnodePubkey,
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 30, // Last 30 snapshots
      })

      if (snapshots.length === 0) {
        return { dataPoints: 0, performance: null }
      }

      // Simple linear trend analysis
      const recentScores = snapshots.slice(0, 7).map((s) => s.performanceScore)
      const olderScores = snapshots.slice(7, 14).map((s) => s.performanceScore)

      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      const olderAvg = olderScores.length > 0 ? olderScores.reduce((a, b) => a + b, 0) / olderScores.length : recentAvg

      const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable'

      return {
        dataPoints: snapshots.length,
        performance: {
          current: Math.round(recentAvg),
          trend,
          predicted7d: Math.round(recentAvg + (recentAvg - olderAvg) * 7),
          predicted30d: Math.round(recentAvg + (recentAvg - olderAvg) * 30),
        },
      }
    } else {
      // Network-wide predictions
      const recentSnapshots = await prisma.networkSnapshot.findMany({
        orderBy: {
          timestamp: 'desc',
        },
        take: 30,
      })

      if (recentSnapshots.length === 0) {
        return { dataPoints: 0 }
      }

      // Network growth prediction
      const pnodeCounts = recentSnapshots.map((s) => s.totalPNodes).reverse()
      const growthRate =
        pnodeCounts.length > 1 ? (pnodeCounts[pnodeCounts.length - 1] - pnodeCounts[0]) / pnodeCounts.length : 0

      const currentPnodes = recentSnapshots[0].totalPNodes
      const predicted7d = Math.round(currentPnodes + growthRate * 7)
      const predicted30d = Math.round(currentPnodes + growthRate * 30)

      const pnodeTrend = growthRate > 0.5 ? 'growing' : growthRate < -0.5 ? 'shrinking' : 'stable'

      // Storage capacity prediction
      const capacities = recentSnapshots.map((s) => Number(s.totalCapacityBytes)).reverse()
      const capacityGrowth =
        capacities.length > 1 ? (capacities[capacities.length - 1] - capacities[0]) / capacities.length : 0

      const currentCapacityTB = Number(recentSnapshots[0].totalCapacityBytes) / 1024 ** 4
      const capacityTrend = capacityGrowth > 0 ? 'growing' : capacityGrowth < 0 ? 'shrinking' : 'stable'

      return {
        dataPoints: recentSnapshots.length,
        pnodes: {
          current: currentPnodes,
          trend: pnodeTrend,
          predicted7d,
          predicted30d,
        },
        capacity: {
          currentTB: Math.round(currentCapacityTB * 100) / 100,
          trend: capacityTrend,
          predicted7dTB: Math.round((currentCapacityTB + (capacityGrowth * 7) / 1024 ** 4) * 100) / 100,
          predicted30dTB: Math.round((currentCapacityTB + (capacityGrowth * 30) / 1024 ** 4) * 100) / 100,
        },
      }
    }
  }

  /**
   * Get anomalies from database
   */
  async getAnomalies(limit: number = 50) {
    const anomalies = await prisma.anomaly.findMany({
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
    })

    return anomalies.map((anomaly) => ({
      id: anomaly.id,
      timestamp: anomaly.timestamp.toISOString(),
      metric: anomaly.metric,
      expected: anomaly.expectedValue,
      actual: anomaly.actualValue,
      deviation: anomaly.deviation,
      severity: this.getAnomalySeverity(anomaly.deviation),
      description: anomaly.description || `${anomaly.metric} anomaly detected`,
      confirmed: anomaly.confirmed,
    }))
  }

  private getAnomalySeverity(deviation: number): 'critical' | 'warning' | 'info' {
    if (deviation > 3) return 'critical'
    if (deviation > 2) return 'warning'
    return 'info'
  }

  /**
   * Get alerts from database
   */
  async getAlerts(limit: number = 100, resolved: boolean = false) {
    const alerts = await prisma.alert.findMany({
      take: limit,
      where: {
        resolved,
      },
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        rule: true,
        pnode: true,
      },
    })

    return alerts.map((alert) => ({
      id: alert.id,
      timestamp: alert.timestamp.toISOString(),
      severity: alert.severity,
      message: alert.message,
      value: alert.value,
      threshold: alert.threshold,
      resolved: alert.resolved,
      rule: {
        name: alert.rule.name,
        metric: alert.rule.metric,
      },
      pnode: alert.pnode
        ? {
            pubkey: alert.pnode.pubkey,
            location: alert.pnode.location,
          }
        : null,
    }))
  }
}

// Singleton instance
let analyticsService: AdvancedAnalyticsService | null = null

export function getAnalyticsService(): AdvancedAnalyticsService {
  if (!analyticsService) {
    analyticsService = new AdvancedAnalyticsService()
  }
  return analyticsService
}
