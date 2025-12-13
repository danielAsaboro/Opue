'use client';

import { useNetworkStats, usePNodes } from '@/hooks/usePNodes';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FullPageError } from '@/components/ui/error-display';
import { formatBytes, formatPercentage } from '@/lib/format';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { NetworkTopology } from '@/components/network/network-topology';

export default function NetworkPage() {
    const { data: stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useNetworkStats();
    const { data: pnodes, isLoading: pnodesLoading, error: pnodesError, refetch: refetchPNodes } = usePNodes();

    const error = statsError || pnodesError;
    const isLoading = statsLoading || pnodesLoading;

    const handleRetry = () => {
        refetchStats();
        refetchPNodes();
    };

    // Show error state
    if (error && !isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Network Analytics</h1>
                    <p className="text-muted-foreground mt-2">
                        Comprehensive insights into the Xandeum storage network
                    </p>
                </div>
                <FullPageError error={error} onRetry={handleRetry} />
            </div>
        );
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
        );
    }

    // Prepare data for charts from real pNode data
    const versionData = pnodes
        ? Object.entries(
            pnodes.reduce(
                (acc: Record<string, number>, pnode) => {
                    acc[pnode.version] = (acc[pnode.version] || 0) + 1;
                    return acc;
                },
                {}
            )
        ).map(([version, count]) => ({ version, count }))
        : [];

    const locationData = pnodes
        ? Object.entries(
            pnodes.reduce(
                (acc: Record<string, number>, pnode) => {
                    const location = pnode.location || 'Unknown';
                    acc[location] = (acc[location] || 0) + 1;
                    return acc;
                },
                {}
            )
        ).map(([location, count]) => ({ location, count }))
        : [];

    const statusData = pnodes
        ? [
            { name: 'Online', value: pnodes.filter((p) => p.status === 'online').length, color: '#10b981' },
            { name: 'Offline', value: pnodes.filter((p) => p.status === 'offline').length, color: '#ef4444' },
            { name: 'Delinquent', value: pnodes.filter((p) => p.status === 'delinquent').length, color: '#f59e0b' },
        ]
        : [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Network Analytics</h1>
                <p className="text-muted-foreground mt-2">
                    Comprehensive insights into the Xandeum storage network
                </p>
            </div>

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
                            {formatPercentage((stats?.totalUsed || 0) / (stats?.totalCapacity || 1) * 100)} utilized
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Network Health</CardTitle>
                        <CardDescription>Overall performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stats?.healthScore || 0}/100</div>
                        <p className="text-sm text-muted-foreground mt-2">
                            {stats?.healthScore && stats.healthScore >= 80 ? 'Excellent' : stats?.healthScore && stats.healthScore >= 60 ? 'Good' : 'Needs attention'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Network Topology */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">Network Topology</h2>
                        <p className="text-sm text-muted-foreground">
                            Live visualization of pNode distribution and gossip connections
                        </p>
                    </div>
                </div>
                {pnodes && <NetworkTopology pnodes={pnodes} />}
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

                {/* Geographic Distribution */}
                <Card className="md:col-span-2">
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
            </div>
        </div>
    );
}
