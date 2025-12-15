'use client';

import { use } from 'react';
import { usePNodeDetails, usePNodes } from '@/hooks/usePNodes';
import { usePNodeQuantAnalytics } from '@/hooks/useQuantAnalytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { formatBytes, formatPercentage, formatRelativeTime, copyToClipboard, truncatePublicKey } from '@/lib/format';
import { Copy, ExternalLink, Database, Activity, Clock, MapPin, BarChart3, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import Link from 'next/link';
import { PNodeTimeline } from '@/components/pnodes/pnode-timeline';
import { RiskProfileCard, RiskProfileCompact } from '@/components/analytics/risk-profile-card';
import { ForecastChart } from '@/components/analytics/regression-chart';
import { StatBadge } from '@/components/ui/stat-badge';

function formatChartData(data: { timestamp: number; value: number }[]) {
    return data.map((d) => ({
        time: new Date(d.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: d.value,
    }));
}

function getStatusBadgeVariant(status: string): 'success' | 'danger' | 'warning' {
    switch (status) {
        case 'online':
            return 'success';
        case 'offline':
            return 'danger';
        case 'delinquent':
            return 'warning';
        default:
            return 'warning';
    }
}

export default function PNodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { data: pnode, isLoading, error } = usePNodeDetails(resolvedParams.id);
    const { data: allPNodes } = usePNodes();

    // Get pnode with history for quant analytics
    const pnodeWithHistory = pnode ? { ...pnode, history: pnode.history } : null;
    const { riskProfile, benchmark, forecast, isLoading: quantLoading } = usePNodeQuantAnalytics(
        pnodeWithHistory,
        allPNodes
    );

    const handleCopy = async (text: string) => {
        const success = await copyToClipboard(text);
        if (success) {
            toast.success('Copied to clipboard');
        } else {
            toast.error('Failed to copy');
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <Skeleton className="h-10 w-96" />
                <div className="grid gap-6 md:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    if (error || !pnode) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card>
                    <CardContent className="pt-6">
                        <p className="text-destructive">Failed to load pNode details</p>
                        <Button asChild className="mt-4">
                            <Link href="/pnodes">Back to pNodes</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-3">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Link href="/" className="hover:underline">
                        Home
                    </Link>
                    <span>/</span>
                    <Link href="/pnodes" className="hover:underline">
                        pNodes
                    </Link>
                    <span>/</span>
                    <span>{truncatePublicKey(pnode.id, 6, 6)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <h1 className="text-3xl font-bold tracking-tight font-mono">{truncatePublicKey(pnode.id, 8, 8)}</h1>
                        <Badge variant={getStatusBadgeVariant(pnode.status)}>{pnode.status}</Badge>
                        {/* Compact Risk Indicator */}
                        {riskProfile && <RiskProfileCompact profile={riskProfile} />}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(pnode.id)}
                    >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy ID
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pnode.performanceScore}/100</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {pnode.performanceScore >= 80 ? 'Excellent' : pnode.performanceScore >= 60 ? 'Good' : 'Needs improvement'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Storage Capacity</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatBytes(pnode.storage.capacityBytes)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatBytes(pnode.storage.usedBytes)} used ({formatPercentage(pnode.storage.utilization)})
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{formatPercentage(pnode.performance.uptime)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Last seen {formatRelativeTime(pnode.lastSeen)}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Health Timeline */}
            <PNodeTimeline
                pnodeId={pnode.id}
                performanceHistory={pnode.history.performanceScores}
            />

            {/* Historical Charts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Score History</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={formatChartData(pnode.history.performanceScores)}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="time" className="text-xs" />
                                <YAxis domain={[0, 100]} className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Score"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Storage Utilization</CardTitle>
                        <CardDescription>Last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={formatChartData(pnode.history.storageUtilization)}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                <XAxis dataKey="time" className="text-xs" />
                                <YAxis domain={[0, 100]} className="text-xs" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Utilization %"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Quantitative Analytics Section */}
            {(riskProfile || benchmark || forecast) && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <BarChart3 className="h-6 w-6" />
                                Quantitative Analytics
                            </h2>
                            <p className="text-muted-foreground">Advanced statistical insights and risk metrics</p>
                        </div>
                        {quantLoading && (
                            <Badge variant="outline" className="gap-1">
                                <span className="animate-pulse">●</span> Calculating...
                            </Badge>
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Risk Profile Card */}
                        {riskProfile && <RiskProfileCard profile={riskProfile} />}

                        {/* Benchmark Comparison */}
                        {benchmark && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5" />
                                        Network Benchmark
                                    </CardTitle>
                                    <CardDescription>
                                        Rank #{benchmark.rankInNetwork} of {benchmark.totalInNetwork} pNodes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Overall Rating */}
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                        <span className="font-medium">Overall Rating</span>
                                        <Badge
                                            variant={
                                                benchmark.overallRating === 'top_performer'
                                                    ? 'success'
                                                    : benchmark.overallRating === 'above_average'
                                                      ? 'default'
                                                      : benchmark.overallRating === 'average'
                                                        ? 'outline'
                                                        : 'destructive'
                                            }
                                            className="capitalize"
                                        >
                                            {benchmark.overallRating.replace('_', ' ')}
                                        </Badge>
                                    </div>

                                    {/* Metrics Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-2 rounded-lg bg-muted/30">
                                            <div className="text-xs text-muted-foreground">Performance</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <StatBadge
                                                    metric=""
                                                    value={benchmark.metrics.performance.percentile}
                                                    formatter={(v) => `${v.toFixed(0)}%ile`}
                                                    significance={
                                                        benchmark.metrics.performance.percentile >= 75
                                                            ? 'strong'
                                                            : benchmark.metrics.performance.percentile >= 50
                                                              ? 'moderate'
                                                              : 'weak'
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/30">
                                            <div className="text-xs text-muted-foreground">Uptime</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <StatBadge
                                                    metric=""
                                                    value={benchmark.metrics.uptime.percentile}
                                                    formatter={(v) => `${v.toFixed(0)}%ile`}
                                                    significance={
                                                        benchmark.metrics.uptime.percentile >= 75
                                                            ? 'strong'
                                                            : benchmark.metrics.uptime.percentile >= 50
                                                              ? 'moderate'
                                                              : 'weak'
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/30">
                                            <div className="text-xs text-muted-foreground">Latency</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <StatBadge
                                                    metric=""
                                                    value={benchmark.metrics.latency.percentile}
                                                    formatter={(v) => `${v.toFixed(0)}%ile`}
                                                    significance={
                                                        benchmark.metrics.latency.percentile >= 75
                                                            ? 'strong'
                                                            : benchmark.metrics.latency.percentile >= 50
                                                              ? 'moderate'
                                                              : 'weak'
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted/30">
                                            <div className="text-xs text-muted-foreground">Consistency</div>
                                            <div className="flex items-center justify-between mt-1">
                                                <StatBadge
                                                    metric=""
                                                    value={benchmark.metrics.consistency.percentile}
                                                    formatter={(v) => `${v.toFixed(0)}%ile`}
                                                    significance={
                                                        benchmark.metrics.consistency.percentile >= 75
                                                            ? 'strong'
                                                            : benchmark.metrics.consistency.percentile >= 50
                                                              ? 'moderate'
                                                              : 'weak'
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Peer Group */}
                                    {benchmark.peerGroup.length > 0 && (
                                        <div>
                                            <div className="text-xs text-muted-foreground mb-2">Similar pNodes</div>
                                            <div className="flex flex-wrap gap-1">
                                                {benchmark.peerGroup.slice(0, 5).map((peerId) => (
                                                    <Link
                                                        key={peerId}
                                                        href={`/pnodes/${peerId}`}
                                                        className="text-xs font-mono px-2 py-1 rounded bg-muted hover:bg-accent transition-colors"
                                                    >
                                                        {truncatePublicKey(peerId, 4, 4)}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-xs text-muted-foreground text-right">
                                        Updated {new Date(benchmark.lastUpdated).toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Trend Forecast */}
                    {forecast && (
                        <ForecastChart
                            forecast={forecast}
                            historicalData={pnode.history.performanceScores.slice(-14).map((s) => s.value)}
                        />
                    )}
                </div>
            )}

            {/* Technical Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Technical Information</CardTitle>
                    <CardDescription>Network and configuration details</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">pNode ID</p>
                                <div className="flex items-center space-x-2">
                                    <code className="text-sm font-mono">{pnode.id}</code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => handleCopy(pnode.id)}
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Gossip Endpoint</p>
                                <p className="text-sm font-mono">{pnode.gossipEndpoint}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">RPC Endpoint</p>
                                {pnode.rpcEndpoint ? (
                                    <div className="flex items-center space-x-2">
                                        <a
                                            href={pnode.rpcEndpoint}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline font-mono"
                                        >
                                            {pnode.rpcEndpoint}
                                        </a>
                                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">Not available</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Software Version</p>
                                <p className="text-sm">{pnode.version}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <div className="flex items-center space-x-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <p className="text-sm">{pnode.location || 'Unknown'}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">File Systems</p>
                                <p className="text-sm">{pnode.storage.fileSystems} hosted</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Network Info</p>
                                <p className="text-sm">
                                    {pnode.network.ip}:{pnode.network.port} • {pnode.network.region || 'Unknown region'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
