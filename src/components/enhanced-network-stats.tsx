'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Activity,
  Users,
  Percent,
  TrendingUp,
  Clock,
  Award,
  Zap,
  HardDrive,
} from 'lucide-react'
import { formatBytes, formatDuration } from '@/lib/format'
import type { PNode, NetworkStats } from '@/types/pnode'

interface EnhancedNetworkStatsProps {
  stats: NetworkStats | undefined
  pnodes: PNode[] | undefined
  isLoading: boolean
}

export function EnhancedNetworkStats({ stats, pnodes, isLoading }: EnhancedNetworkStatsProps) {
  // Calculate longest running node (prefer nodes with real uptimeSeconds data)
  const longestRunningNode = pnodes?.reduce((longest, current) => {
    if (!longest) return current
    // Use uptimeSeconds if available for more accurate comparison
    const longestUptime = longest.performance.uptimeSeconds ?? longest.performance.uptime * 25920 // fallback: 30 days in seconds * percentage
    const currentUptime = current.performance.uptimeSeconds ?? current.performance.uptime * 25920
    return currentUptime > longestUptime ? current : longest
  }, undefined as PNode | undefined)

  // Calculate average latency from pnodes
  const avgLatency = pnodes?.length
    ? pnodes.reduce((sum, p) => sum + p.performance.averageLatency, 0) / pnodes.length
    : 0

  // Calculate real active streams from network metrics (sum of all pNode active streams)
  const totalActiveStreams = pnodes?.reduce((sum, p) =>
    sum + (p.networkMetrics?.activeStreams ?? 0), 0) ?? 0

  // Real stats - use actual data or null (no fake estimates)
  const activePeers = stats?.activePeers ?? (totalActiveStreams > 0 ? totalActiveStreams : null)
  const stakingAPY = stats?.stakingAPY ?? null  // Only show if we have real data

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-[120px]" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Primary Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Latency</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgLatency.toFixed(1)} ms</div>
            <p className="text-xs text-muted-foreground">
              Network response time
            </p>
            <Badge variant={avgLatency < 100 ? 'default' : avgLatency < 200 ? 'secondary' : 'destructive'} className="mt-2">
              {avgLatency < 100 ? 'Excellent' : avgLatency < 200 ? 'Good' : 'Slow'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activePeers !== null ? activePeers.toLocaleString() : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Network connections
            </p>
            {activePeers !== null && (
              <div className="flex items-center gap-1 mt-2">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-green-500">Live connections</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staking APY</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {stakingAPY !== null ? `${stakingAPY.toFixed(2)}%` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Annual percentage yield
            </p>
            {stakingAPY !== null && (
              <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
                <TrendingUp className="h-3 w-3" />
                <span>From inflation rate</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalCapacity ? formatBytes(stats.totalCapacity) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Network capacity
            </p>
            {stats?.totalUsed !== undefined && stats.totalCapacity > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
                <Zap className="h-3 w-3" />
                <span>{formatBytes(stats.totalUsed)} used</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Longest Running Node */}
      {longestRunningNode && (
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Award className="h-5 w-5" />
              Longest Running Node
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-lg font-semibold">
                  {longestRunningNode.id.slice(0, 8)}...{longestRunningNode.id.slice(-8)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {longestRunningNode.location || 'Unknown location'}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-2xl font-bold text-amber-500">
                    {longestRunningNode.performance.uptimeSeconds
                      ? formatDuration(longestRunningNode.performance.uptimeSeconds)
                      : `${longestRunningNode.performance.uptime.toFixed(2)}%`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {longestRunningNode.performance.uptimeSeconds ? 'Running time' : 'Uptime'}
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Storage</p>
                <p className="font-medium">{formatBytes(longestRunningNode.storage.capacityBytes)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Performance</p>
                <p className="font-medium">{longestRunningNode.performanceScore}/100</p>
              </div>
              <div>
                <p className="text-muted-foreground">Version</p>
                <p className="font-medium font-mono">{longestRunningNode.version}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
