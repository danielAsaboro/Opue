'use client';

import * as React from 'react';
import { Database, BarChart3, Activity, TrendingUp } from 'lucide-react';
import { useNetworkStats } from '@/hooks/usePNodes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBytes, formatPercentage } from '@/lib/format';

export function StatCard({
    title,
    value,
    subValue,
    icon: Icon,
    isLoading,
}: {
    title: string;
    value: string;
    subValue?: string;
    icon: React.ElementType;
    isLoading?: boolean;
}) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                {subValue && <p className="text-xs text-muted-foreground mt-1">{subValue}</p>}
            </CardContent>
        </Card>
    );
}

export function NetworkStatsCards() {
    const { data: stats, isLoading, error } = useNetworkStats();

    if (error) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-full">
                    <CardContent className="pt-6">
                        <p className="text-sm text-destructive">Failed to load network stats</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalNodes = stats?.totalPNodes || 0;
    const onlineNodes = stats?.onlinePNodes || 0;
    const totalCapacity = stats?.totalCapacity || 0;
    const totalUsed = stats?.totalUsed || 0;
    const utilization = totalCapacity > 0 ? (totalUsed / totalCapacity) * 100 : 0;
    const healthScore = stats?.healthScore || 0;
    const avgPerformance = stats?.averagePerformance || 0;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title="Total pNodes"
                value={totalNodes.toString()}
                subValue={`${onlineNodes} online`}
                icon={Database}
                isLoading={isLoading}
            />
            <StatCard
                title="Total Storage"
                value={formatBytes(totalCapacity)}
                subValue={`${formatPercentage(utilization)} utilized`}
                icon={BarChart3}
                isLoading={isLoading}
            />
            <StatCard
                title="Network Health"
                value={`${healthScore}/100`}
                subValue={healthScore >= 80 ? 'Excellent' : healthScore >= 60 ? 'Good' : 'Poor'}
                icon={Activity}
                isLoading={isLoading}
            />
            <StatCard
                title="Avg Performance"
                value={`${avgPerformance}/100`}
                subValue="Across all pNodes"
                icon={TrendingUp}
                isLoading={isLoading}
            />
        </div>
    );
}
