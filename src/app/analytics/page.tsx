'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, HardDrive, Users, BarChart3, RefreshCw, Download, Award, Calendar, Clock } from 'lucide-react'
import {
  useNetworkHistory,
  useNetworkGrowth,
  useGeographicAnalysis,
  usePredictions,
  useLeaderboard,
  useAnomalies,
} from '@/hooks/useAnalytics'
import { usePNodes } from '@/hooks/usePNodes'
import {
  NetworkGrowthChart,
  PerformanceTimelineChart,
  StorageCapacityChart,
  GeoDistributionChart,
  TrendCard,
  Leaderboard,
  AIInsightsCard,
  ChartCard,
} from '@/components/analytics/analytics-charts'
import { AdvancedAnalyticsDashboard } from '@/components/analytics/advanced-analytics-dashboard'
import { cn } from '@/lib/utils'

type TimeRange = '24h' | '7d' | '30d' | '90d'
type LeaderboardMetric = 'performance' | 'uptime' | 'capacity'

export default function HistoricalAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [leaderboardMetric, setLeaderboardMetric] = useState<LeaderboardMetric>('performance')

  // Calculate days from time range
  const getDays = (range: TimeRange) => {
    switch (range) {
      case '24h':
        return 1
      case '7d':
        return 7
      case '30d':
        return 30
      case '90d':
        return 90
    }
  }

  // Fetch data
  const { data: pnodes } = usePNodes()
  const {
    data: networkHistory,
    isLoading: loadingHistory,
    refetch: refetchHistory,
  } = useNetworkHistory(getDays(timeRange), timeRange === '24h' ? 'hourly' : 'daily')
  const { data: networkGrowth, isLoading: loadingGrowth } = useNetworkGrowth(getDays(timeRange))
  const { data: geoData, isLoading: loadingGeo } = useGeographicAnalysis()
  const { data: predictions, isLoading: loadingPredictions } = usePredictions()
  const { data: leaderboard, isLoading: loadingLeaderboard } = useLeaderboard(10, leaderboardMetric)
  const { data: anomalies, isLoading: loadingAnomalies } = useAnomalies(10)

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
  ]

  const leaderboardMetrics: { value: LeaderboardMetric; label: string }[] = [
    { value: 'performance', label: 'Performance' },
    { value: 'uptime', label: 'Uptime' },
    { value: 'capacity', label: 'Capacity' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Historical Analytics</h1>
              <p className="mt-1 text-gray-400">Deep insights powered by indexed historical data</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Time Range Selector */}
              <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
                {timeRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                      timeRange === range.value ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white',
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={() => refetchHistory()}
                className="rounded-lg border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <RefreshCw className="h-5 w-5" />
              </button>

              {/* Export Button */}
              <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10 hover:text-white">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* Advanced Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <AdvancedAnalyticsDashboard pnodes={pnodes || []} />
        </motion.div>

        {/* Predictions Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <TrendCard
            title="pNode Count"
            current={predictions?.pnodes?.current || 0}
            predicted={predictions?.pnodes?.predicted7d || 0}
            trend={predictions?.pnodes?.trend || 'stable'}
            icon={Users}
            color="purple"
          />
          <TrendCard
            title="Network Health"
            current={networkGrowth?.[networkGrowth.length - 1]?.healthScore || 0}
            predicted={Math.min(100, (networkGrowth?.[networkGrowth.length - 1]?.healthScore || 0) + 5)}
            trend="stable"
            unit="%"
            icon={Activity}
            color="emerald"
          />
          <TrendCard
            title="Total Capacity"
            current={predictions?.capacity?.currentTB || 0}
            predicted={predictions?.capacity?.predicted7dTB || 0}
            trend={predictions?.capacity?.trend || 'stable'}
            unit=" TB"
            icon={HardDrive}
            color="blue"
          />
          <TrendCard
            title="Data Points"
            current={predictions?.dataPoints || 0}
            predicted={(predictions?.dataPoints || 0) + getDays(timeRange) * 48}
            trend="growing"
            icon={BarChart3}
            color="amber"
          />
        </motion.div>

        {/* Main Charts Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-2">
          {/* Network Growth */}
          <ChartCard title="Network Growth" subtitle={`pNode count and health over ${timeRange}`}>
            <NetworkGrowthChart data={networkGrowth} loading={loadingGrowth} />
          </ChartCard>

          {/* Performance Timeline */}
          <ChartCard title="Performance Timeline" subtitle="Hourly snapshots of network metrics">
            <PerformanceTimelineChart data={networkHistory} loading={loadingHistory} />
          </ChartCard>

          {/* Storage Capacity */}
          <ChartCard title="Storage Capacity" subtitle="Total network storage over time">
            <StorageCapacityChart data={networkGrowth} loading={loadingGrowth} />
          </ChartCard>

          {/* Geographic Distribution */}
          <ChartCard title="Geographic Distribution" subtitle="pNode distribution by region">
            <GeoDistributionChart data={geoData?.regions} loading={loadingGeo} />
          </ChartCard>
        </div>

        {/* Bottom Section: Leaderboard + AI Insights */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <ChartCard title="" subtitle="">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-500/20 p-2 text-amber-400">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-200">pNode Leaderboard</h3>
                    <p className="text-sm text-gray-500">Top performing nodes</p>
                  </div>
                </div>

                {/* Metric Selector */}
                <div className="flex rounded-lg border border-white/10 bg-white/5 p-1">
                  {leaderboardMetrics.map((metric) => (
                    <button
                      key={metric.value}
                      onClick={() => setLeaderboardMetric(metric.value)}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-medium transition-all',
                        leaderboardMetric === metric.value
                          ? 'bg-amber-500 text-black'
                          : 'text-gray-400 hover:text-white',
                      )}
                    >
                      {metric.label}
                    </button>
                  ))}
                </div>
              </div>

              <Leaderboard data={leaderboard} loading={loadingLeaderboard} metric={leaderboardMetric} />
            </ChartCard>
          </div>

          {/* AI Insights */}
          <ChartCard title="" subtitle="">
            <AIInsightsCard
              predictions={predictions}
              anomalies={anomalies}
              loading={loadingPredictions || loadingAnomalies}
            />
          </ChartCard>
        </div>

        {/* Database Info Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/20 p-2 text-purple-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-200">Powered by PostgreSQL + Prisma</p>
                <p className="text-xs text-gray-500">Historical data indexed every 30 seconds for deep analytics</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Last indexed: Just now</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>{predictions?.dataPoints || 0} snapshots</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
