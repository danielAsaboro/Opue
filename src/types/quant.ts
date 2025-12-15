/**
 * Type definitions for Quantitative Analytics
 */

import type {
  CorrelationResult,
  RegressionResult,
  VolatilityMetrics,
  DrawdownAnalysis,
  SharpeRatio,
  TrendAnalysis,
} from '@/lib/statistics'

// ============================================================================
// RISK PROFILE
// ============================================================================

export interface RiskProfile {
  pnodeId: string
  volatility: {
    score: number // 0-100, lower is less volatile
    raw: number // Raw standard deviation
    percentile: number // Position in network distribution
    trend: 'increasing' | 'decreasing' | 'stable'
    rollingValues: number[] // 7-day rolling volatility
  }
  consistency: {
    score: number // 0-100, higher is more consistent
    streakDays: number // Days of consistent performance
    reliability: 'low' | 'medium' | 'high' | 'very_high'
  }
  riskAdjustedPerformance: {
    sharpeRatio: number
    interpretation: SharpeRatio['interpretation']
    networkRank: number
    percentile: number
  }
  drawdown: {
    maxDrawdown: number
    currentDrawdown: number
    recoveryFactor: number // Speed of recovery after outages
    daysInDrawdown: number
    averageDrawdown: number
  }
  overallRiskLevel: 'low' | 'medium' | 'high' | 'very_high'
  riskScore: number // 0-100, lower is less risky
  lastUpdated: Date
}

// ============================================================================
// CORRELATION INSIGHTS
// ============================================================================

export interface CorrelationInsight {
  metric1: string
  metric2: string
  correlation: number
  pValue: number
  significant: boolean
  strength: CorrelationResult['strength']
  direction: CorrelationResult['direction']
  interpretation: string
  recommendation?: string
  sampleSize: number
}

export interface CorrelationMatrixData {
  matrix: Record<string, Record<string, CorrelationResult>>
  significantPairs: CorrelationInsight[]
  topPositive: CorrelationInsight[]
  topNegative: CorrelationInsight[]
  metrics: string[]
}

// ============================================================================
// REGRESSION INSIGHTS
// ============================================================================

export interface RegressionInsight {
  dependent: string // e.g., "performanceScore"
  independent: string // e.g., "storageUtilization"
  rSquared: number
  slope: number
  intercept: number
  pValue: number
  significant: boolean
  interpretation: string
  equation: string // e.g., "y = 0.5x + 30"
  predictions: Array<{ x: number; y: number; lower: number; upper: number }>
  confidenceLevel: number
}

// ============================================================================
// BENCHMARK COMPARISON
// ============================================================================

export interface MetricBenchmark {
  value: number
  networkAvg: number
  networkMedian: number
  percentile: number
  zScore: number
  deviation: number // % above/below average
  rating: 'poor' | 'below_average' | 'average' | 'above_average' | 'excellent'
}

export interface BenchmarkComparison {
  pnodeId: string
  metrics: {
    performance: MetricBenchmark
    uptime: MetricBenchmark
    latency: MetricBenchmark
    storageUtilization: MetricBenchmark
    consistency: MetricBenchmark
  }
  overallRating: 'below_average' | 'average' | 'above_average' | 'top_performer'
  overallPercentile: number
  peerGroup: string[] // Similar pNodes by performance
  rankInNetwork: number
  totalInNetwork: number
  lastUpdated: Date
}

// ============================================================================
// TREND & PREDICTION
// ============================================================================

export interface TrendForecast {
  metric: string
  currentValue: number
  trend: TrendAnalysis
  predictions: Array<{
    date: Date
    value: number
    lower: number
    upper: number
    confidence: number
  }>
  expectedChange: number // % change expected
  confidence: number // Overall confidence in forecast
}

// ============================================================================
// NETWORK-WIDE METRICS
// ============================================================================

export interface NetworkRiskDistribution {
  distribution: Array<{
    level: RiskProfile['overallRiskLevel']
    count: number
    percentage: number
  }>
  average: number
  median: number
  standardDeviation: number
  quartiles: {
    q1: number
    q2: number
    q3: number
  }
}

export interface NetworkQuantSummary {
  correlations: {
    strongestPositive: CorrelationInsight | null
    strongestNegative: CorrelationInsight | null
    significantCount: number
  }
  risk: NetworkRiskDistribution
  topPerformers: Array<{
    pnodeId: string
    sharpeRatio: number
    consistency: number
  }>
  bottomPerformers: Array<{
    pnodeId: string
    sharpeRatio: number
    volatility: number
  }>
  lastUpdated: Date
}

// ============================================================================
// STATISTICAL BADGES
// ============================================================================

export interface StatisticalBadge {
  metric: string
  value: number
  pValue?: number
  significance: 'none' | 'weak' | 'moderate' | 'strong'
  stars: 0 | 1 | 2 | 3
  confidence: number
  tooltip: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface QuantAnalyticsResponse {
  success: boolean
  data: {
    correlations?: CorrelationMatrixData
    risk?: NetworkRiskDistribution
    regression?: RegressionInsight
    summary?: NetworkQuantSummary
  }
  timestamp: Date
}

export interface PNodeQuantResponse {
  success: boolean
  data: {
    riskProfile: RiskProfile
    benchmark: BenchmarkComparison
    correlations: CorrelationInsight[]
    forecast: TrendForecast
  }
  timestamp: Date
}

// ============================================================================
// RE-EXPORTS FROM STATISTICS
// ============================================================================

export type {
  CorrelationResult,
  RegressionResult,
  VolatilityMetrics,
  DrawdownAnalysis,
  SharpeRatio,
  TrendAnalysis,
}
