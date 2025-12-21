/**
 * Quantitative Analytics Service
 * Provides advanced statistical analysis for pNode data
 */

import type { PNode, PNodeDetails, TimeSeriesData } from '@/types/pnode'

// Helper type for pNodes that may or may not have history
type PNodeWithOptionalHistory = PNode & {
  history?: PNodeDetails['history']
}
import type {
  RiskProfile,
  CorrelationInsight,
  CorrelationMatrixData,
  RegressionInsight,
  BenchmarkComparison,
  MetricBenchmark,
  TrendForecast,
  NetworkRiskDistribution,
  NetworkQuantSummary,
} from '@/types/quant'
import {
  mean,
  standardDeviation,
  median,
  percentile,
  percentileRank,
  pearsonCorrelation,
  correlationMatrix,
  linearRegression,
  predictWithConfidence,
  calculateVolatility,
  calculateDrawdown,
  calculateSharpeRatio,
  consistencyScore,
  analyzeTrend,
  zScore,
  interpretCorrelation,
  significanceStars,
} from '@/lib/statistics'

// ============================================================================
// RISK PROFILE CALCULATION
// ============================================================================

export function calculateRiskProfile(
  pnode: PNodeWithOptionalHistory,
  history: TimeSeriesData[],
  allPNodes: PNodeWithOptionalHistory[]
): RiskProfile {
  const values = history.map((h) => h.value)

  // Calculate volatility metrics
  const volatilityMetrics = calculateVolatility(values, 7)
  const allVolatilities = allPNodes.map((p) => {
    const pHistory = p.history?.performanceScores || []
    return calculateVolatility(pHistory.map((h: TimeSeriesData) => h.value)).standardDeviation
  })

  // Calculate volatility trend
  const recentVol = volatilityMetrics.rollingVolatility.slice(-7)
  const olderVol = volatilityMetrics.rollingVolatility.slice(-14, -7)
  const recentAvg = recentVol.length > 0 ? mean(recentVol) : 0
  const olderAvg = olderVol.length > 0 ? mean(olderVol) : recentAvg
  const volTrend: RiskProfile['volatility']['trend'] =
    recentAvg > olderAvg * 1.1 ? 'increasing' : recentAvg < olderAvg * 0.9 ? 'decreasing' : 'stable'

  // Calculate drawdown
  const drawdownAnalysis = calculateDrawdown(values)

  // Calculate Sharpe ratio
  const sharpe = calculateSharpeRatio(values)
  const allSharpes = allPNodes
    .map((p) => {
      const pHistory = p.history?.performanceScores || []
      return calculateSharpeRatio(pHistory.map((h: TimeSeriesData) => h.value)).ratio
    })
    .filter((s) => isFinite(s))
  const sharpeRank =
    allSharpes.filter((s) => s > sharpe.ratio).length + 1

  // Calculate consistency
  const consistencyValue = consistencyScore(values)

  // Calculate consistency streak
  const streakDays = calculateConsistencyStreak(values)

  // Determine reliability level
  let reliability: RiskProfile['consistency']['reliability'] = 'low'
  if (consistencyValue >= 80) reliability = 'very_high'
  else if (consistencyValue >= 60) reliability = 'high'
  else if (consistencyValue >= 40) reliability = 'medium'

  // Calculate overall risk score (0-100, lower is better)
  const volScore = 100 - volatilityMetrics.volatilityScore
  const drawdownScore = Math.min(100, drawdownAnalysis.maxDrawdown * 2)
  const recoveryScore = drawdownAnalysis.recoveryTime
    ? Math.min(100, drawdownAnalysis.recoveryTime * 10)
    : 50

  const riskScore = (volScore * 0.4 + drawdownScore * 0.35 + recoveryScore * 0.25)

  // Determine overall risk level
  let overallRiskLevel: RiskProfile['overallRiskLevel'] = 'low'
  if (riskScore >= 75) overallRiskLevel = 'very_high'
  else if (riskScore >= 50) overallRiskLevel = 'high'
  else if (riskScore >= 25) overallRiskLevel = 'medium'

  return {
    pnodeId: pnode.id,
    volatility: {
      score: volatilityMetrics.volatilityScore,
      raw: volatilityMetrics.standardDeviation,
      percentile: percentileRank(volatilityMetrics.standardDeviation, allVolatilities),
      trend: volTrend,
      rollingValues: volatilityMetrics.rollingVolatility,
    },
    consistency: {
      score: consistencyValue,
      streakDays,
      reliability,
    },
    riskAdjustedPerformance: {
      sharpeRatio: sharpe.ratio,
      interpretation: sharpe.interpretation,
      networkRank: sharpeRank,
      percentile: sharpe.percentileRank,
    },
    drawdown: {
      maxDrawdown: drawdownAnalysis.maxDrawdown,
      currentDrawdown: drawdownAnalysis.currentDrawdown,
      recoveryFactor: drawdownAnalysis.recoveryTime ?? 0,
      daysInDrawdown: drawdownAnalysis.maxDrawdownDuration,
      averageDrawdown: drawdownAnalysis.averageDrawdown,
    },
    overallRiskLevel,
    riskScore,
    lastUpdated: new Date(),
  }
}

function calculateConsistencyStreak(values: number[]): number {
  if (values.length < 2) return 0

  const threshold = 10 // Performance within 10 points is "consistent"
  let streak = 0
  const recent = values.slice(-30) // Look at last 30 days

  for (let i = recent.length - 1; i > 0; i--) {
    if (Math.abs(recent[i] - recent[i - 1]) <= threshold) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// ============================================================================
// CORRELATION ANALYSIS
// ============================================================================

export function generateCorrelationMatrix(pnodes: PNodeWithOptionalHistory[]): CorrelationMatrixData {
  // Extract metric arrays from all pNodes
  const data: Record<string, number[]> = {
    performance: pnodes.map((p) => p.performanceScore),
    uptime: pnodes.map((p) => p.performance.uptime),
    latency: pnodes.map((p) => p.performance.averageLatency),
    storageUtilization: pnodes.map((p) => p.storage.utilization),
    capacity: pnodes.map((p) => p.storage.capacityBytes / 1e12), // TB
  }

  const matrix = correlationMatrix(data)
  const metrics = Object.keys(data)

  // Find significant pairs
  const significantPairs: CorrelationInsight[] = []
  const allPairs: CorrelationInsight[] = []

  for (let i = 0; i < metrics.length; i++) {
    for (let j = i + 1; j < metrics.length; j++) {
      const m1 = metrics[i]
      const m2 = metrics[j]
      const result = matrix[m1][m2]

      const insight: CorrelationInsight = {
        metric1: m1,
        metric2: m2,
        correlation: result.coefficient,
        pValue: result.pValue,
        significant: result.significant,
        strength: result.strength,
        direction: result.direction,
        interpretation: interpretCorrelation(result.coefficient),
        recommendation: generateCorrelationRecommendation(m1, m2, result),
        sampleSize: result.sampleSize,
      }

      allPairs.push(insight)
      if (result.significant) {
        significantPairs.push(insight)
      }
    }
  }

  // Sort by absolute correlation
  const sortedByCorrelation = [...allPairs].sort(
    (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)
  )

  const topPositive = sortedByCorrelation
    .filter((p) => p.correlation > 0)
    .slice(0, 3)

  const topNegative = sortedByCorrelation
    .filter((p) => p.correlation < 0)
    .slice(0, 3)

  return {
    matrix,
    significantPairs,
    topPositive,
    topNegative,
    metrics,
  }
}

function generateCorrelationRecommendation(
  metric1: string,
  metric2: string,
  result: { coefficient: number; significant: boolean }
): string | undefined {
  if (!result.significant) return undefined

  const absCoef = Math.abs(result.coefficient)
  if (absCoef < 0.4) return undefined

  // Generate contextual recommendations
  if (metric1 === 'performance' && metric2 === 'storageUtilization') {
    return result.coefficient > 0
      ? 'Higher storage utilization correlates with better performance. Consider load balancing.'
      : 'Storage utilization negatively impacts performance. Monitor capacity closely.'
  }

  if (metric1 === 'uptime' && metric2 === 'latency') {
    return result.coefficient < 0
      ? 'Lower latency nodes tend to have better uptime. Network proximity matters.'
      : undefined
  }

  if (metric1 === 'performance' && metric2 === 'capacity') {
    return result.coefficient > 0
      ? 'Larger capacity nodes show better performance. Scale may provide advantages.'
      : undefined
  }

  return undefined
}

export function calculatePNodeCorrelations(
  pnode: PNode,
  history: {
    performance: { timestamp: number; value: number }[]
    storage: { timestamp: number; value: number }[]
  }
): CorrelationInsight[] {
  const insights: CorrelationInsight[] = []

  // Correlate performance with storage utilization over time
  if (history.performance.length > 10 && history.storage.length > 10) {
    const perfValues = history.performance.map((h) => h.value)
    const storageValues = history.storage.map((h) => h.value)

    const result = pearsonCorrelation(perfValues, storageValues)

    insights.push({
      metric1: 'Performance',
      metric2: 'Storage Utilization',
      correlation: result.coefficient,
      pValue: result.pValue,
      significant: result.significant,
      strength: result.strength,
      direction: result.direction,
      interpretation: interpretCorrelation(result.coefficient),
      sampleSize: result.sampleSize,
    })
  }

  return insights
}

// ============================================================================
// REGRESSION ANALYSIS
// ============================================================================

export function performNetworkRegression(
  pnodes: PNodeWithOptionalHistory[],
  dependent: string,
  independent: string
): RegressionInsight {
  // Extract metric values
  const getMetricValue = (p: PNodeWithOptionalHistory, metric: string): number => {
    switch (metric) {
      case 'performance':
        return p.performanceScore
      case 'uptime':
        return p.performance.uptime
      case 'latency':
        return p.performance.averageLatency
      case 'storageUtilization':
        return p.storage.utilization
      case 'capacity':
        return p.storage.capacityBytes / 1e12
      default:
        return 0
    }
  }

  const x = pnodes.map((p) => getMetricValue(p, independent))
  const y = pnodes.map((p) => getMetricValue(p, dependent))

  const regression = linearRegression(x, y, 0.95)

  // Generate predictions with confidence intervals
  const xSorted = [...x].sort((a, b) => a - b)
  const predictions = xSorted.map((xi) => {
    const pred = predictWithConfidence(regression, xi, x, 0.95)
    return {
      x: xi,
      y: pred.predicted,
      lower: pred.lower,
      upper: pred.upper,
    }
  })

  // Generate equation string
  const equation = `${dependent} = ${regression.slope.toFixed(3)}×${independent} + ${regression.intercept.toFixed(2)}`

  // Generate interpretation
  let interpretation = ''
  if (regression.pValue < 0.05) {
    if (regression.rSquared > 0.5) {
      interpretation = `Strong predictive relationship (R²=${(regression.rSquared * 100).toFixed(1)}%). `
    } else if (regression.rSquared > 0.25) {
      interpretation = `Moderate predictive relationship (R²=${(regression.rSquared * 100).toFixed(1)}%). `
    } else {
      interpretation = `Weak but significant relationship (R²=${(regression.rSquared * 100).toFixed(1)}%). `
    }
    interpretation += regression.slope > 0
      ? `For each unit increase in ${independent}, ${dependent} increases by ${Math.abs(regression.slope).toFixed(3)}.`
      : `For each unit increase in ${independent}, ${dependent} decreases by ${Math.abs(regression.slope).toFixed(3)}.`
  } else {
    interpretation = `No significant relationship found between ${dependent} and ${independent} (p=${regression.pValue.toFixed(3)}).`
  }

  return {
    dependent,
    independent,
    rSquared: regression.rSquared,
    slope: regression.slope,
    intercept: regression.intercept,
    pValue: regression.pValue,
    significant: regression.pValue < 0.05,
    interpretation,
    equation,
    predictions,
    confidenceLevel: 0.95,
  }
}

// ============================================================================
// BENCHMARK COMPARISON
// ============================================================================

export function benchmarkPNode(pnode: PNodeWithOptionalHistory, allPNodes: PNodeWithOptionalHistory[]): BenchmarkComparison {
  const calculateMetricBenchmark = (
    value: number,
    allValues: number[],
    higherIsBetter = true
  ): MetricBenchmark => {
    const avg = mean(allValues)
    const med = median(allValues)
    const stdDev = standardDeviation(allValues)
    const pctile = percentileRank(value, allValues)
    const z = zScore(value, avg, stdDev)
    const deviation = avg === 0 ? 0 : ((value - avg) / avg) * 100

    // Determine rating
    let rating: MetricBenchmark['rating'] = 'average'
    const effectivePctile = higherIsBetter ? pctile : 100 - pctile
    if (effectivePctile >= 90) rating = 'excellent'
    else if (effectivePctile >= 70) rating = 'above_average'
    else if (effectivePctile >= 30) rating = 'average'
    else if (effectivePctile >= 10) rating = 'below_average'
    else rating = 'poor'

    return {
      value,
      networkAvg: avg,
      networkMedian: med,
      percentile: pctile,
      zScore: z,
      deviation,
      rating,
    }
  }

  const metrics = {
    performance: calculateMetricBenchmark(
      pnode.performanceScore,
      allPNodes.map((p) => p.performanceScore),
      true
    ),
    uptime: calculateMetricBenchmark(
      pnode.performance.uptime,
      allPNodes.map((p) => p.performance.uptime),
      true
    ),
    latency: calculateMetricBenchmark(
      pnode.performance.averageLatency,
      allPNodes.map((p) => p.performance.averageLatency),
      false // Lower is better
    ),
    storageUtilization: calculateMetricBenchmark(
      pnode.storage.utilization,
      allPNodes.map((p) => p.storage.utilization),
      true
    ),
    consistency: calculateMetricBenchmark(
      consistencyScore(pnode.history?.performanceScores?.map((h: TimeSeriesData) => h.value) || []),
      allPNodes.map((p) =>
        consistencyScore(p.history?.performanceScores?.map((h: TimeSeriesData) => h.value) || [])
      ),
      true
    ),
  }

  // Calculate overall percentile (average of key metrics)
  const overallPercentile =
    (metrics.performance.percentile +
      metrics.uptime.percentile +
      (100 - metrics.latency.percentile) +
      metrics.consistency.percentile) /
    4

  // Determine overall rating
  let overallRating: BenchmarkComparison['overallRating'] = 'average'
  if (overallPercentile >= 90) overallRating = 'top_performer'
  else if (overallPercentile >= 60) overallRating = 'above_average'
  else if (overallPercentile >= 40) overallRating = 'average'
  else overallRating = 'below_average'

  // Find peer group (similar performance ±10%)
  const peerGroup = allPNodes
    .filter(
      (p) =>
        p.id !== pnode.id &&
        Math.abs(p.performanceScore - pnode.performanceScore) <= 10
    )
    .slice(0, 5)
    .map((p) => p.id)

  // Calculate rank
  const sortedByPerformance = [...allPNodes].sort(
    (a, b) => b.performanceScore - a.performanceScore
  )
  const rankInNetwork = sortedByPerformance.findIndex((p) => p.id === pnode.id) + 1

  return {
    pnodeId: pnode.id,
    metrics,
    overallRating,
    overallPercentile,
    peerGroup,
    rankInNetwork,
    totalInNetwork: allPNodes.length,
    lastUpdated: new Date(),
  }
}

// ============================================================================
// TREND FORECASTING
// ============================================================================

export function generateTrendForecast(
  history: { timestamp: number; value: number }[],
  daysAhead: number,
  metricName = 'performance'
): TrendForecast {
  const values = history.map((h) => h.value)
  const timestamps = history.map((h) => h.timestamp)

  // Analyze current trend
  const trend = analyzeTrend(values)

  // Create time index for regression
  const x = values.map((_, i) => i)
  const regression = linearRegression(x, values, 0.95)

  // Generate predictions
  const predictions: TrendForecast['predictions'] = []
  const lastTimestamp = timestamps[timestamps.length - 1] || Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  for (let i = 1; i <= daysAhead; i++) {
    const xValue = values.length - 1 + i
    const pred = predictWithConfidence(regression, xValue, x, 0.95)

    predictions.push({
      date: new Date(lastTimestamp + i * dayMs),
      value: Math.max(0, Math.min(100, pred.predicted)), // Clamp to 0-100
      lower: Math.max(0, pred.lower),
      upper: Math.min(100, pred.upper),
      confidence: 0.95,
    })
  }

  // Calculate expected change
  const currentValue = values[values.length - 1] || 0
  const finalPrediction = predictions[predictions.length - 1]?.value || currentValue
  const expectedChange =
    currentValue === 0 ? 0 : ((finalPrediction - currentValue) / currentValue) * 100

  // Overall confidence based on R² and trend significance
  const confidence = trend.significance
    ? Math.min(0.95, 0.5 + regression.rSquared * 0.45)
    : Math.min(0.7, 0.3 + regression.rSquared * 0.4)

  return {
    metric: metricName,
    currentValue,
    trend,
    predictions,
    expectedChange,
    confidence,
  }
}

// ============================================================================
// NETWORK-WIDE ANALYTICS
// ============================================================================

export function calculateNetworkRiskDistribution(
  pnodes: PNodeWithOptionalHistory[]
): NetworkRiskDistribution {
  const riskScores = pnodes.map((p) => {
    const history = p.history?.performanceScores || []
    const profile = calculateRiskProfile(p, history as TimeSeriesData[], pnodes)
    return profile.riskScore
  })

  // Calculate distribution by level
  const distribution: NetworkRiskDistribution['distribution'] = [
    {
      level: 'low',
      count: riskScores.filter((s) => s < 25).length,
      percentage: 0,
    },
    {
      level: 'medium',
      count: riskScores.filter((s) => s >= 25 && s < 50).length,
      percentage: 0,
    },
    {
      level: 'high',
      count: riskScores.filter((s) => s >= 50 && s < 75).length,
      percentage: 0,
    },
    {
      level: 'very_high',
      count: riskScores.filter((s) => s >= 75).length,
      percentage: 0,
    },
  ]

  // Calculate percentages
  const total = pnodes.length
  distribution.forEach((d) => {
    d.percentage = total === 0 ? 0 : (d.count / total) * 100
  })

  return {
    distribution,
    average: mean(riskScores),
    median: median(riskScores),
    standardDeviation: standardDeviation(riskScores),
    quartiles: {
      q1: percentile(riskScores, 25),
      q2: percentile(riskScores, 50),
      q3: percentile(riskScores, 75),
    },
  }
}

export function generateNetworkQuantSummary(pnodes: PNodeWithOptionalHistory[]): NetworkQuantSummary {
  const correlationData = generateCorrelationMatrix(pnodes)
  const riskDistribution = calculateNetworkRiskDistribution(pnodes)

  // Calculate Sharpe ratios for all pNodes
  const pnodeMetrics = pnodes.map((p) => {
    const history = p.history?.performanceScores || []
    const values = history.map((h: TimeSeriesData) => h.value)
    return {
      pnodeId: p.id,
      sharpeRatio: calculateSharpeRatio(values).ratio,
      consistency: consistencyScore(values),
      volatility: calculateVolatility(values).standardDeviation,
    }
  })

  // Sort for top/bottom performers
  const sortedBySharp = [...pnodeMetrics]
    .filter((p) => isFinite(p.sharpeRatio))
    .sort((a, b) => b.sharpeRatio - a.sharpeRatio)

  const topPerformers = sortedBySharp.slice(0, 5).map((p) => ({
    pnodeId: p.pnodeId,
    sharpeRatio: p.sharpeRatio,
    consistency: p.consistency,
  }))

  const bottomPerformers = sortedBySharp.slice(-5).reverse().map((p) => ({
    pnodeId: p.pnodeId,
    sharpeRatio: p.sharpeRatio,
    volatility: p.volatility,
  }))

  return {
    correlations: {
      strongestPositive: correlationData.topPositive[0] || null,
      strongestNegative: correlationData.topNegative[0] || null,
      significantCount: correlationData.significantPairs.length,
    },
    risk: riskDistribution,
    topPerformers,
    bottomPerformers,
    lastUpdated: new Date(),
  }
}

// ============================================================================
// SERVICE SINGLETON
// ============================================================================

class QuantAnalyticsService {
  calculateRiskProfile = calculateRiskProfile
  generateCorrelationMatrix = generateCorrelationMatrix
  calculatePNodeCorrelations = calculatePNodeCorrelations
  performNetworkRegression = performNetworkRegression
  benchmarkPNode = benchmarkPNode
  generateTrendForecast = generateTrendForecast
  calculateNetworkRiskDistribution = calculateNetworkRiskDistribution
  generateNetworkQuantSummary = generateNetworkQuantSummary
}

let quantService: QuantAnalyticsService | null = null

export function getQuantAnalyticsService(): QuantAnalyticsService {
  if (!quantService) {
    quantService = new QuantAnalyticsService()
  }
  return quantService
}

export default QuantAnalyticsService
