'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { useNetworkStats, usePNodes } from '@/hooks/usePNodes'
import { useNetworkQuantAnalytics } from '@/hooks/useQuantAnalytics'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FullPageError } from '@/components/ui/error-display'
import { NetworkHealthGauge } from '@/components/network-health-gauge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { formatBytes, formatPercentage } from '@/lib/format'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CorrelationHeatmap, TopCorrelations } from '@/components/analytics/correlation-heatmap'
import { RegressionChart } from '@/components/analytics/regression-chart'
import { Brain, Activity, TrendingUp, Shield, BarChart3, Network, Coins } from 'lucide-react'
import { RewardsTracking } from '@/components/rewards-tracking'
import { NetworkTopology } from '@/components/network-topology'
import { EnhancedNetworkStats } from '@/components/enhanced-network-stats'

// Dynamic import for Leaflet-based component to avoid SSR issues
const GeographicHeatmap = dynamic(() => import('@/components/geographic-heatmap').then(mod => mod.GeographicHeatmap), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full" />,
})

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useNetworkStats()
  const { data: pnodes, isLoading: pnodesLoading, error: pnodesError, refetch: refetchPNodes } = usePNodes()

  // Network-wide quant analytics
  const {
    correlations,
    riskDistribution,
    summary,
    regression,
    isLoading: quantLoading,
  } = useNetworkQuantAnalytics(pnodes)

  const error = statsError || pnodesError
  const isLoading = statsLoading || pnodesLoading

  const handleRetry = () => {
    refetchStats()
    refetchPNodes()
  }

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Analytics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive insights into the Xandeum storage network</p>
        </div>
        <FullPageError error={error} onRetry={handleRetry} />
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    )
  }

  // Prepare data for charts from real pNode data
  const versionData = pnodes
    ? Object.entries(
        pnodes.reduce((acc: Record<string, number>, pnode) => {
          acc[pnode.version] = (acc[pnode.version] || 0) + 1
          return acc
        }, {}),
      ).map(([version, count]) => ({ version, count }))
    : []

  const locationData = pnodes
    ? Object.entries(
        pnodes.reduce((acc: Record<string, number>, pnode) => {
          const location = pnode.location || 'Unknown'
          acc[location] = (acc[location] || 0) + 1
          return acc
        }, {}),
      ).map(([location, count]) => ({ location, count }))
    : []

  const statusData = pnodes
    ? [
        { name: 'Online', value: pnodes.filter((p) => p.status === 'online').length, color: '#10b981' },
        { name: 'Offline', value: pnodes.filter((p) => p.status === 'offline').length, color: '#ef4444' },
        { name: 'Delinquent', value: pnodes.filter((p) => p.status === 'delinquent').length, color: '#f59e0b' },
      ]
    : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Analytics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive insights into the Xandeum storage network</p>
        </div>
        {quantLoading && (
          <Badge variant="outline" className="gap-1">
            <span className="animate-pulse">●</span> Calculating quant metrics...
          </Badge>
        )}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Coins className="h-4 w-4" />
            <span className="hidden sm:inline">Rewards</span>
          </TabsTrigger>
          <TabsTrigger value="topology" className="gap-2">
            <Network className="h-4 w-4" />
            <span className="hidden sm:inline">Topology</span>
          </TabsTrigger>
          <TabsTrigger value="quant" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Quant</span>
          </TabsTrigger>
          <TabsTrigger value="geographic" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Geographic</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-8 mt-6">
          {/* Network Overview */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total pNodes</CardTitle>
                <CardDescription>Active storage providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats?.totalPNodes || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats?.onlinePNodes || 0} online • {stats?.offlinePNodes || 0} offline
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Total Capacity</CardTitle>
                <CardDescription>Network-wide storage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{formatBytes(stats?.totalCapacity || 0)}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  {formatPercentage(((stats?.totalUsed || 0) / (stats?.totalCapacity || 1)) * 100)} utilized
                </p>
              </CardContent>
            </Card>

            <NetworkHealthGauge
              healthScore={stats?.healthScore || 0}
              onlinePNodes={stats?.onlinePNodes || 0}
              totalPNodes={stats?.totalPNodes || 0}
              avgPerformance={pnodes ? pnodes.reduce((acc, p) => acc + p.performanceScore, 0) / pnodes.length : 0}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>Current pNode status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Version Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Software Versions</CardTitle>
                <CardDescription>Distribution of pNode software versions</CardDescription>
              </CardHeader>
              <CardContent>
                {versionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={versionData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="version" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" name="pNodes" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No version data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Network Stats */}
          <EnhancedNetworkStats stats={stats} pnodes={pnodes} isLoading={isLoading} />
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-8 mt-6">
          <RewardsTracking />
        </TabsContent>

        {/* Topology Tab */}
        <TabsContent value="topology" className="space-y-8 mt-6">
          <NetworkTopology />
        </TabsContent>

        {/* Quant Analysis Tab */}
        <TabsContent value="quant" className="space-y-8 mt-6">
          {/* Summary Stats */}
          {summary && (
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    Correlations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{summary.correlations.significantCount}</div>
                  <p className="text-xs text-muted-foreground">Significant relationships</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Low Risk pNodes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {riskDistribution?.distribution.find(d => d.level === 'low')?.count || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {riskDistribution?.distribution.find(d => d.level === 'low')?.percentage.toFixed(1) || 0}% of network
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Top Sharpe
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary.topPerformers[0]?.sharpeRatio.toFixed(2) || 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Best risk-adjusted return</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Avg Consistency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {summary.topPerformers.length > 0
                      ? (summary.topPerformers.reduce((a, b) => a + b.consistency, 0) / summary.topPerformers.length).toFixed(0)
                      : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">Top performer average</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Correlation Matrix */}
          {correlations && (
            <>
              <CorrelationHeatmap data={correlations} />
              <TopCorrelations
                positive={correlations.topPositive}
                negative={correlations.topNegative}
              />
            </>
          )}

          {/* Regression Analysis */}
          {regression && (
            <RegressionChart
              insight={regression}
              dataPoints={pnodes?.map(p => ({
                x: p.storage.utilization,
                y: p.performanceScore,
                label: p.id.slice(0, 8),
              }))}
            />
          )}

          {/* Risk Distribution */}
          {riskDistribution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Network Risk Distribution
                </CardTitle>
                <CardDescription>Breakdown of pNode risk levels across the network</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {riskDistribution.distribution.map((d) => (
                    <div
                      key={d.level}
                      className={`p-4 rounded-lg border ${
                        d.level === 'low'
                          ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                          : d.level === 'medium'
                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
                            : d.level === 'high'
                              ? 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
                              : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                      }`}
                    >
                      <div className="text-2xl font-bold">{d.count}</div>
                      <div className="text-sm font-medium capitalize">{d.level.replace('_', ' ')} Risk</div>
                      <div className="text-xs text-muted-foreground">{d.percentage.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Average Risk Score:</span>
                    <span className="ml-2 font-medium">{riskDistribution.average.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Median:</span>
                    <span className="ml-2 font-medium">{riskDistribution.median.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Std Dev:</span>
                    <span className="ml-2 font-medium">{riskDistribution.standardDeviation.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No data state */}
          {!correlations && !regression && !riskDistribution && !quantLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Insufficient Data</h3>
                <p className="text-sm text-muted-foreground">
                  At least 3 pNodes are required for quantitative analysis
                </p>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {quantLoading && (
            <div className="space-y-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-96" />
              <Skeleton className="h-64" />
            </div>
          )}
        </TabsContent>

        {/* Geographic Tab */}
        <TabsContent value="geographic" className="space-y-8 mt-6">
          {/* Geographic Distribution & Decentralization */}
          {pnodes && <GeographicHeatmap pnodes={pnodes} />}

          {/* Geographic Distribution Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>pNodes by region</CardDescription>
            </CardHeader>
            <CardContent>
              {locationData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="location" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="#06b6d4" name="pNodes" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No location data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
