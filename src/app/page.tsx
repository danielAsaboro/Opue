'use client'

import { useNetworkStats, usePNodes } from '@/hooks/usePNodes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FullPageError } from '@/components/ui/error-display'
import {
  Database,
  Globe,
  HardDrive,
  Clock,
  CheckCircle2,
  XCircle,
  Command,
  MessageSquare,
  Search,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Bell,
  Map,
} from 'lucide-react'
import Link from 'next/link'
import { formatBytes } from '@/lib/format'

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useNetworkStats()
  const { data: pnodes, isLoading: pnodesLoading, error: pnodesError, refetch: refetchPNodes } = usePNodes()

  const error = statsError || pnodesError
  const isLoading = statsLoading || pnodesLoading

  const handleRetry = () => {
    refetchStats()
    refetchPNodes()
  }

  if (error && !isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            pNode <span className="text-primary">Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time analytics for Xandeum pNodes. Data fetched directly from the network using the official pRPC API.
          </p>
        </div>
        <FullPageError error={error} onRetry={handleRetry} />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="flex gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-24" />
          ))}
        </div>
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    )
  }

  const totalNodes = stats?.totalPNodes || 0
  const onlineNodes = stats?.onlinePNodes || 0
  const offlineNodes = totalNodes - onlineNodes
  const totalCapacity = stats?.totalCapacity || 0
  const totalUsed = stats?.totalUsed || 0
  const utilization = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0

  const versions = pnodes ? [...new Set(pnodes.map(p => p.version).filter(Boolean))] : []

  const topByUptime = pnodes
    ? [...pnodes].sort((a, b) => (b.performance?.uptime || 0) - (a.performance?.uptime || 0)).slice(0, 3)
    : []
  const topByStorage = pnodes
    ? [...pnodes].sort((a, b) => b.storage.capacityBytes - a.storage.capacityBytes).slice(0, 3)
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            pNode <span className="text-primary">Analytics</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time analytics for Xandeum pNodes. Data fetched directly from the network using the official pRPC API.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <Command className="h-3 w-3" />
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘K</kbd>
            <span className="hidden sm:inline">Commands</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">⌘/</kbd>
            <span className="hidden sm:inline">AI Chat</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <Search className="h-3 w-3" />
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">/</kbd>
            <span className="hidden sm:inline">Search</span>
          </Button>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="outline" className="gap-2 px-3 py-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          Active: <span className="font-semibold">{onlineNodes}</span>
        </Badge>
        <Badge variant="outline" className="gap-2 px-3 py-1.5">
          <XCircle className="h-3.5 w-3.5 text-red-500" />
          Inactive: <span className="font-semibold">{offlineNodes}</span>
        </Badge>
        <Badge variant="outline" className="gap-2 px-3 py-1.5">
          <Globe className="h-3.5 w-3.5 text-blue-500" />
          Versions: <span className="font-semibold">{versions.length}</span>
        </Badge>
      </div>

      {/* Stats Summary Row */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <div className="text-xs text-muted-foreground">Total pNodes</div>
              <div className="text-2xl font-bold">{totalNodes}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active Now</div>
              <div className="text-2xl font-bold text-green-500">{onlineNodes} nodes</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Health Score</div>
              <div className="text-2xl font-bold">{stats?.healthScore || 0}%</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Versions</div>
              <div className="text-2xl font-bold">{versions.length} active</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Storage Utilization</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-primary">{utilization.toFixed(4)}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 w-fit mb-4">
              <Database className="h-5 w-5" />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total pNodes</div>
            <div className="text-3xl font-bold mt-1">{totalNodes}</div>
            <div className="text-sm text-muted-foreground mt-1">{onlineNodes} active</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 w-fit mb-4">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Performance</div>
            <div className="text-3xl font-bold mt-1">{stats?.averagePerformance || 0}%</div>
            <div className="text-sm text-muted-foreground mt-1">{versions.length} versions</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 w-fit mb-4">
              <HardDrive className="h-5 w-5" />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Storage</div>
            <div className="text-3xl font-bold mt-1">{formatBytes(totalCapacity)}</div>
            <div className="text-sm text-muted-foreground mt-1">{formatBytes(totalUsed)} used</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 w-fit mb-4">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Uptime</div>
            <div className="text-3xl font-bold mt-1">
              {pnodes && pnodes.length > 0
                ? `${(pnodes.reduce((acc, p) => acc + (p.performance?.uptime || 0), 0) / pnodes.length).toFixed(1)}%`
                : '0%'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Network reliability</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Top by Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topByUptime.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data available</p>
              ) : (
                topByUptime.map((pnode, index) => (
                  <Link
                    key={pnode.id}
                    href={`/pnodes/${encodeURIComponent(pnode.id)}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-mono text-sm">
                          {pnode.id.slice(0, 6)}...{pnode.id.slice(-6)}
                        </p>
                        <p className="text-xs text-muted-foreground">{pnode.gossipEndpoint || 'Unknown'}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      {(pnode.performance?.uptime || 0).toFixed(1)}% uptime
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardDrive className="h-5 w-5 text-muted-foreground" />
              Top by Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topByStorage.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data available</p>
              ) : (
                topByStorage.map((pnode, index) => (
                  <Link
                    key={pnode.id}
                    href={`/pnodes/${encodeURIComponent(pnode.id)}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-mono text-sm">
                          {pnode.id.slice(0, 6)}...{pnode.id.slice(-6)}
                        </p>
                        <p className="text-xs text-muted-foreground">{pnode.gossipEndpoint || 'Unknown'}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">
                      {formatBytes(pnode.storage.capacityBytes)}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Explore Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Explore</h2>
        <div className="grid gap-4 md:grid-cols-4">
          <Link href="/pnodes" className="group">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Database className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">pNode Explorer</p>
                  <p className="text-xs text-muted-foreground">Browse all nodes</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/network" className="group">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                  <Map className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Network Map</p>
                  <p className="text-xs text-muted-foreground">Geographic view</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/analytics" className="group">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Analytics</p>
                  <p className="text-xs text-muted-foreground">Historical data</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/alerts" className="group">
            <Card className="h-full hover:border-primary/50 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                  <Bell className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm group-hover:text-primary transition-colors">Alerts</p>
                  <p className="text-xs text-muted-foreground">Monitor status</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* AI Assistant Hint */}
      <Card className="bg-gradient-to-r from-primary/5 to-chart-1/5 border-primary/20">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">AI Assistant Available</p>
            <p className="text-sm text-muted-foreground">
              Press <kbd className="px-1.5 py-0.5 bg-background rounded text-xs font-mono">⌘/</kbd> to ask questions about the network in natural language
            </p>
          </div>
          <Link href="/help">
            <Button variant="outline" size="sm">Learn More</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
