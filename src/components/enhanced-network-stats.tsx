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
import { formatBytes } from '@/lib/format'
import type { PNode, NetworkStats } from '@/types/pnode'

interface EnhancedNetworkStatsProps {
  stats: NetworkStats | undefined
  pnodes: PNode[] | undefined
  isLoading: boolean
}

export function EnhancedNetworkStats({ stats, pnodes, isLoading }: EnhancedNetworkStatsProps) {
  // Calculate longest running node
  const longestRunningNode = pnodes?.reduce((longest, current) => {
    if (!longest) return current
    return current.performance.uptime > longest.performance.uptime ? current : longest
  }, undefined as PNode | undefined)

  // Calculate average latency from pnodes
  const avgLatency = pnodes?.length
    ? pnodes.reduce((sum, p) => sum + p.performance.averageLatency, 0) / pnodes.length
    : 0

  // Mock additional stats (in production these would come from the API)
  const activePeers = stats?.activePeers ?? Math.floor((stats?.onlinePNodes || 0) * 2.5)
  const volume24h = stats?.volume24h ?? (stats?.totalUsed || 0) * 0.12
  const stakingAPY = stats?.stakingAPY ?? 7.2

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
            <CardTitle className="text-sm font-medium">Active Peers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePeers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Connected network peers
            </p>
            <div className="flex items-center gap-1 mt-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-500">Live connections</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staking APY</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stakingAPY}%</div>
            <p className="text-xs text-muted-foreground">
              Annual percentage yield
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-green-500">
              <TrendingUp className="h-3 w-3" />
              <span>+0.2% from last epoch</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Volume</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(volume24h)}</div>
            <p className="text-xs text-muted-foreground">
              Storage transactions
            </p>
            <div className="flex items-center gap-1 mt-2 text-xs text-blue-500">
              <Zap className="h-3 w-3" />
              <span>High activity</span>
            </div>
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
                    {longestRunningNode.performance.uptime.toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">Uptime</p>
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
