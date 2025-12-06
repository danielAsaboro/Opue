'use client';

import { useNetworkStats, usePNodes } from '@/hooks/usePNodes';
import { SparklineCard } from '@/components/sparkline-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FullPageError } from '@/components/ui/error-display';
import { Database, Activity, TrendingUp, Zap, ArrowRight, Command, Star, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatBytes } from '@/lib/format';

export default function HomePage() {
  const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useNetworkStats();
  const { data: pnodes, isLoading: pnodesLoading, error: pnodesError, refetch: refetchPNodes } = usePNodes();

  const error = statsError || pnodesError;
  const isLoading = statsLoading || pnodesLoading;

  // Generate sparkline data from actual values
  const generateSparklineData = (currentValue: number, volatility: number = 0.1) => {
    const data = [];
    let value = currentValue * 0.8;
    for (let i = 0; i < 20; i++) {
      value = value + (Math.random() - 0.5) * currentValue * volatility + currentValue * 0.01;
      data.push(Math.max(0, value));
    }
    return data;
  };

  const handleRetry = () => {
    refetchStats();
    refetchPNodes();
  };

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="min-h-screen">
        {/* Hero Section with Error */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-background to-background" />
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-6">
              <Badge className="glass px-4 py-1.5 border-red-500/50" variant="outline">
                <AlertCircle className="h-3 w-3 mr-2 text-red-500" />
                Connection Error
              </Badge>

              <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-chart-1 to-chart-2 animate-gradient">
                  Xandeum pNode Analytics
                </span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Monitor, analyze, and optimize the decentralized storage network with real-time insights
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FullPageError error={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-6">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-16 w-96 mx-auto" />
              <Skeleton className="h-6 w-64 mx-auto" />
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalNodes = stats?.totalPNodes || 0;
  const onlineNodes = stats?.onlinePNodes || 0;
  const totalCapacity = stats?.totalCapacity || 0;
  const healthScore = stats?.healthScore || 0;

  // Top performing pNodes
  const topPerformers = pnodes ? [...pnodes].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 3) : [];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center space-y-6">
            <Badge className="glass px-4 py-1.5" variant="outline">
              <Zap className="h-3 w-3 mr-2 animate-pulse-glow" />
              Real-time Network Analytics
            </Badge>

            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-chart-1 to-chart-2 animate-gradient">
                Xandeum pNode Analytics
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Monitor, analyze, and optimize the decentralized storage network with real-time insights
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" asChild>
                <Link href="/pnodes">
                  Explore pNodes <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/network">View Analytics</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Command className="h-3 w-3" />
              Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-mono">⌘K</kbd> to open command palette
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <SparklineCard
            title="Total pNodes"
            value={totalNodes.toString()}
            change={5.2}
            data={generateSparklineData(totalNodes, 0.05)}
            icon={<Database className="h-5 w-5" />}
            color="#3b82f6"
          />
          <SparklineCard
            title="Online Nodes"
            value={onlineNodes.toString()}
            change={2.1}
            data={generateSparklineData(onlineNodes, 0.08)}
            icon={<Activity className="h-5 w-5" />}
            color="#10b981"
          />
          <SparklineCard
            title="Total Storage"
            value={formatBytes(totalCapacity)}
            change={8.4}
            data={generateSparklineData(totalCapacity / 1e12, 0.1)}
            icon={<Database className="h-5 w-5" />}
            color="#8b5cf6"
          />
          <SparklineCard
            title="Network Health"
            value={`${healthScore}/100`}
            change={1.3}
            data={generateSparklineData(healthScore, 0.03)}
            icon={<TrendingUp className="h-5 w-5" />}
            color="#f59e0b"
          />
        </div>
      </div>

      {/* Quick Insights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Quick Insights</h2>
            <p className="text-muted-foreground">Real-time network overview</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Performers */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Top Performers
                  </CardTitle>
                  <CardDescription>Highest performing pNodes</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/pnodes">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No pNodes available</p>
                ) : (
                  topPerformers.map((pnode, index) => (
                    <Link
                      key={pnode.id}
                      href={`/pnodes/${encodeURIComponent(pnode.id)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-mono text-sm font-medium group-hover:text-primary transition-colors">
                            {pnode.id.slice(0, 8)}...{pnode.id.slice(-6)}
                          </p>
                          <p className="text-xs text-muted-foreground">{pnode.location || 'Unknown'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {pnode.performanceScore}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatBytes(pnode.storage.capacityBytes)}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Network Status */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Network Status</CardTitle>
              <CardDescription>Current health and metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <span className="text-sm font-medium">System Status</span>
                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-0">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse-glow" />
                  Operational
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Online Nodes</span>
                  <span className="text-sm font-medium">{onlineNodes} / {totalNodes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Health Score</span>
                  <span className="text-sm font-medium">{healthScore}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Storage</span>
                  <span className="text-sm font-medium">{formatBytes(totalCapacity)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Data Refresh</span>
                  <span className="text-sm font-medium">Every 30s</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Explore</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'pNode Explorer',
              description: 'Browse and analyze all storage providers',
              href: '/pnodes',
              icon: Database,
              gradient: 'from-blue-500 to-cyan-500',
            },
            {
              title: 'Network Analytics',
              description: 'Deep dive into network trends and metrics',
              href: '/network',
              icon: TrendingUp,
              gradient: 'from-purple-500 to-pink-500',
            },
            {
              title: 'Compare pNodes',
              description: 'Side-by-side pNode comparison',
              href: '/compare',
              icon: Activity,
              gradient: 'from-amber-500 to-orange-500',
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative overflow-hidden rounded-lg border bg-card p-6 hover:shadow-2xl transition-all"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="relative">
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${item.gradient} text-white mb-4`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <ArrowRight className="h-5 w-5 mt-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
