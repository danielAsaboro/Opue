import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import { getQuantAnalyticsService } from '@/services/quant-analytics.service'
import type { PNode, PNodeDetails } from '@/types/pnode'
import type {
  RiskProfile,
  BenchmarkComparison,
  CorrelationMatrixData,
  RegressionInsight,
  TrendForecast,
  NetworkQuantSummary,
  NetworkRiskDistribution,
} from '@/types/quant'

// Helper type for pNodes that may have history
type PNodeWithOptionalHistory = PNode & {
  history?: PNodeDetails['history']
}

/**
 * Hook to calculate risk profile for a single pNode
 */
export function usePNodeRiskProfile(
  pnode: PNodeWithOptionalHistory | null | undefined,
  allPNodes: PNode[] | undefined
): UseQueryResult<RiskProfile | null, Error> {
  const service = getQuantAnalyticsService()

  return useQuery({
    queryKey: ['quant', 'risk-profile', pnode?.id],
    queryFn: () => {
      if (!pnode || !allPNodes) return null
      const history = pnode.history?.performanceScores || []
      return service.calculateRiskProfile(pnode, history, allPNodes)
    },
    enabled: !!pnode && !!allPNodes && allPNodes.length > 0,
    staleTime: 60000, // 1 minute - risk profile doesn't change rapidly
  })
}

/**
 * Hook to calculate benchmark comparison for a pNode
 */
export function usePNodeBenchmark(
  pnode: PNodeWithOptionalHistory | null | undefined,
  allPNodes: PNode[] | undefined
): UseQueryResult<BenchmarkComparison | null, Error> {
  const service = getQuantAnalyticsService()

  return useQuery({
    queryKey: ['quant', 'benchmark', pnode?.id],
    queryFn: () => {
      if (!pnode || !allPNodes) return null
      return service.benchmarkPNode(pnode, allPNodes)
    },
    enabled: !!pnode && !!allPNodes && allPNodes.length > 0,
    staleTime: 60000,
  })
}

/**
 * Hook to generate correlation matrix for network metrics
 */
export function useCorrelationMatrix(
  pnodes: PNode[] | undefined
): UseQueryResult<CorrelationMatrixData | null, Error> {
  const service = getQuantAnalyticsService()

  return useQuery({
    queryKey: ['quant', 'correlations', pnodes?.length],
    queryFn: () => {
      if (!pnodes || pnodes.length < 3) return null
      return service.generateCorrelationMatrix(pnodes)
    },
    enabled: !!pnodes && pnodes.length >= 3,
    staleTime: 120000, // 2 minutes - correlations are computationally expensive
  })
}

/**
 * Hook to perform network regression analysis
 */
export function useNetworkRegression(
  pnodes: PNode[] | undefined,
  dependent: string = 'performanceScore',
  independent: string = 'storageUtilization'
): UseQueryResult<RegressionInsight | null, Error> {
  const service = getQuantAnalyticsService()

  return useQuery({
    queryKey: ['quant', 'regression', dependent, independent, pnodes?.length],
    queryFn: () => {
      if (!pnodes || pnodes.length < 5) return null
      return service.performNetworkRegression(pnodes, dependent, independent)
    },
    enabled: !!pnodes && pnodes.length >= 5,
    staleTime: 120000,
  })
}

/**
 * Hook to generate trend forecast for a pNode
 */
export function useTrendForecast(
  pnode: PNodeWithOptionalHistory | null | undefined,
  metric: string = 'performanceScore'
): UseQueryResult<TrendForecast | null, Error> {
  const service = getQuantAnalyticsService()

  return useQuery({
    queryKey: ['quant', 'forecast', pnode?.id, metric],
    queryFn: () => {
      if (!pnode) return null
      // Get history based on metric
      let history: { timestamp: number; value: number }[] = []
      if (pnode.history) {
        if (metric === 'performanceScore') {
          history = pnode.history.performanceScores || []
        } else if (metric === 'storageUtilization') {
          history = pnode.history.storageUtilization || []
        } else if (metric === 'uptime') {
          history = pnode.history.uptimeHistory || []
        }
      }
      if (history.length < 3) return null
      return service.generateTrendForecast(history, 7, metric)
    },
    enabled: !!pnode,
    staleTime: 60000,
  })
}

/**
 * Hook to calculate network-wide risk distribution
 */
export function useNetworkRiskDistribution(
  pnodes: PNodeWithOptionalHistory[] | undefined
): UseQueryResult<NetworkRiskDistribution | null, Error> {
  const service = getQuantAnalyticsService()

  return useQuery({
    queryKey: ['quant', 'network-risk', pnodes?.length],
    queryFn: () => {
      if (!pnodes || pnodes.length < 3) return null
      return service.calculateNetworkRiskDistribution(pnodes)
    },
    enabled: !!pnodes && pnodes.length >= 3,
    staleTime: 60000,
  })
}

/**
 * Hook to get comprehensive network quant summary
 */
export function useNetworkQuantSummary(
  pnodes: PNodeWithOptionalHistory[] | undefined
): UseQueryResult<NetworkQuantSummary | null, Error> {
  const service = getQuantAnalyticsService()

  return useQuery({
    queryKey: ['quant', 'network-summary', pnodes?.length],
    queryFn: () => {
      if (!pnodes || pnodes.length < 3) return null
      return service.generateNetworkQuantSummary(pnodes)
    },
    enabled: !!pnodes && pnodes.length >= 3,
    staleTime: 60000,
  })
}

/**
 * Combined hook for all pNode quant analytics
 */
export function usePNodeQuantAnalytics(
  pnode: PNodeWithOptionalHistory | null | undefined,
  allPNodes: PNode[] | undefined
) {
  const riskProfile = usePNodeRiskProfile(pnode, allPNodes)
  const benchmark = usePNodeBenchmark(pnode, allPNodes)
  const forecast = useTrendForecast(pnode, 'performanceScore')

  const isLoading = riskProfile.isLoading || benchmark.isLoading || forecast.isLoading
  const error = riskProfile.error || benchmark.error || forecast.error

  return {
    riskProfile: riskProfile.data,
    benchmark: benchmark.data,
    forecast: forecast.data,
    isLoading,
    error,
    refetch: () => {
      riskProfile.refetch()
      benchmark.refetch()
      forecast.refetch()
    },
  }
}

/**
 * Combined hook for network-wide quant analytics
 */
export function useNetworkQuantAnalytics(pnodes: PNodeWithOptionalHistory[] | undefined) {
  const correlations = useCorrelationMatrix(pnodes)
  const riskDistribution = useNetworkRiskDistribution(pnodes)
  const summary = useNetworkQuantSummary(pnodes)
  const regression = useNetworkRegression(pnodes)

  const isLoading =
    correlations.isLoading ||
    riskDistribution.isLoading ||
    summary.isLoading ||
    regression.isLoading

  const error =
    correlations.error ||
    riskDistribution.error ||
    summary.error ||
    regression.error

  return {
    correlations: correlations.data,
    riskDistribution: riskDistribution.data,
    summary: summary.data,
    regression: regression.data,
    isLoading,
    error,
    refetch: () => {
      correlations.refetch()
      riskDistribution.refetch()
      summary.refetch()
      regression.refetch()
    },
  }
}

/**
 * Hook for derived pNode statistics with memoization
 */
export function useDerivedPNodeStats(pnode: PNodeWithOptionalHistory | null | undefined) {
  return useMemo(() => {
    if (!pnode) {
      return {
        hasHistory: false,
        dataPointCount: 0,
        trend: 'stable' as const,
        volatilityEstimate: 0,
      }
    }

    const hasHistory = !!(pnode.history && pnode.history.performanceScores?.length > 0)
    const dataPointCount = pnode.history?.performanceScores?.length || 0

    // Quick trend calculation from last 7 data points
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let volatilityEstimate = 0

    if (hasHistory && pnode.history?.performanceScores) {
      const scores = pnode.history.performanceScores.slice(-7).map((s: { value: number }) => s.value)
      if (scores.length >= 2) {
        const first = scores[0]
        const last = scores[scores.length - 1]
        const change = ((last - first) / first) * 100
        trend = change > 5 ? 'up' : change < -5 ? 'down' : 'stable'

        // Simple volatility estimate (coefficient of variation)
        const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length
        const variance = scores.reduce((a: number, b: number) => a + Math.pow(b - avg, 2), 0) / scores.length
        volatilityEstimate = (Math.sqrt(variance) / avg) * 100
      }
    }

    return {
      hasHistory,
      dataPointCount,
      trend,
      volatilityEstimate,
    }
  }, [pnode])
}

/**
 * Hook to get top/bottom pNodes by various metrics
 */
export function usePNodeRankings(pnodes: PNode[] | undefined) {
  return useMemo(() => {
    if (!pnodes || pnodes.length === 0) {
      return {
        topPerformers: [],
        bottomPerformers: [],
        mostStable: [],
        leastStable: [],
      }
    }

    const sortedByPerformance = [...pnodes].sort(
      (a, b) => b.performanceScore - a.performanceScore
    )

    // For stability, we need to approximate from uptime
    const sortedByStability = [...pnodes].sort(
      (a, b) => b.performance.uptime - a.performance.uptime
    )

    return {
      topPerformers: sortedByPerformance.slice(0, 10),
      bottomPerformers: sortedByPerformance.slice(-10).reverse(),
      mostStable: sortedByStability.slice(0, 10),
      leastStable: sortedByStability.slice(-10).reverse(),
    }
  }, [pnodes])
}
