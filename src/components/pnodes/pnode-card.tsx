'use client';

import { useEffect, useState, useMemo } from 'react';
import type { PNode } from '@/types/pnode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatBytes, formatPercentage, truncatePublicKey } from '@/lib/format';
import { Star, Database, Activity, Bell, BellOff, Award, TrendingUp, TrendingDown, Minus, Shield } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist';
import { percentileRank, mean, standardDeviation } from '@/lib/statistics';

// Compact quant indicator for cards
function QuickStats({ pnode, allPNodes }: { pnode: PNode; allPNodes: PNode[] }) {
    // Calculate quick stats relative to network
    const stats = useMemo(() => {
        if (allPNodes.length < 3) return null;

        const performances = allPNodes.map(p => p.performanceScore);
        const uptimes = allPNodes.map(p => p.performance.uptime);
        const pnodeUptime = pnode.performance.uptime;

        const perfPercentile = percentileRank(pnode.performanceScore, performances);
        const perfMean = mean(performances);
        const perfStdDev = standardDeviation(performances);
        const perfZScore = perfStdDev > 0 ? (pnode.performanceScore - perfMean) / perfStdDev : 0;

        const uptimePercentile = percentileRank(pnodeUptime, uptimes);

        // Determine trend based on z-score
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (perfZScore > 1) trend = 'up';
        else if (perfZScore < -1) trend = 'down';

        // Determine risk level based on combined metrics
        let riskLevel: 'low' | 'medium' | 'high' = 'medium';
        if (pnodeUptime >= 98 && perfPercentile >= 70) riskLevel = 'low';
        else if (pnodeUptime < 90 || perfPercentile < 30) riskLevel = 'high';

        return {
            perfPercentile,
            perfZScore,
            uptimePercentile,
            trend,
            riskLevel,
        };
    }, [pnode, allPNodes]);

    if (!stats) return null;

    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'low': return 'text-green-500';
            case 'high': return 'text-red-500';
            default: return 'text-yellow-500';
        }
    };

    const TrendIcon = stats.trend === 'up' ? TrendingUp : stats.trend === 'down' ? TrendingDown : Minus;

    return (
        <div className="flex items-center gap-3 text-xs">
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                        <Shield className={`h-3.5 w-3.5 ${getRiskColor(stats.riskLevel)}`} />
                        <span className={`font-medium capitalize ${getRiskColor(stats.riskLevel)}`}>
                            {stats.riskLevel}
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">Risk Assessment</p>
                    <p className="text-muted-foreground">Based on uptime & performance stability</p>
                </TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                        <TrendIcon className={`h-3.5 w-3.5 ${
                            stats.trend === 'up' ? 'text-green-500' :
                            stats.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                        }`} />
                        <span className="text-muted-foreground">
                            Top {Math.round(100 - stats.perfPercentile)}%
                        </span>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                    <p className="font-medium">Network Ranking</p>
                    <p>Performance: {stats.perfPercentile.toFixed(0)}th percentile</p>
                    <p>Z-Score: {stats.perfZScore.toFixed(2)}σ</p>
                </TooltipContent>
            </Tooltip>
        </div>
    );
}

// Circular progress component for score display
function ScoreCircle({ score, size = 48 }: { score: number; size?: number }) {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e'; // green-500
        if (score >= 60) return '#f59e0b'; // amber-500
        return '#ef4444'; // red-500
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/20"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getScoreColor(score)}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{score}</span>
            </div>
        </div>
    );
}

interface PNodeCardProps {
    pnode: PNode;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
    allPNodes?: PNode[];
    onSelectPNode?: (id: string) => void;
}

export function PNodeCard({ pnode, isFavorite, onToggleFavorite, allPNodes = [], onSelectPNode }: PNodeCardProps) {
    const [isWatched, setIsWatched] = useState(false);

    useEffect(() => {
        setIsWatched(isInWatchlist(pnode.id));
    }, [pnode.id]);

    const handleToggleWatchlist = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isWatched) {
            removeFromWatchlist(pnode.id);
        } else {
            addToWatchlist(pnode.id);
        }
        setIsWatched(!isWatched);
    };

    const getStatusVariant = (status: string): 'success' | 'danger' | 'warning' => {
        switch (status) {
            case 'online':
                return 'success';
            case 'offline':
                return 'danger';
            default:
                return 'warning';
        }
    };

    const getPerformanceColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400';
        if (score >= 60) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <Card className="hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <button
                        className="flex-1 text-left"
                        onClick={() => onSelectPNode?.(pnode.id)}
                    >
                        <CardTitle className="text-base font-mono hover:underline cursor-pointer">
                            {truncatePublicKey(pnode.id, 6, 6)}
                        </CardTitle>
                    </button>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={handleToggleWatchlist}
                            title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        >
                            {isWatched ? (
                                <Bell className="h-4 w-4 fill-primary text-primary" />
                            ) : (
                                <BellOff className="h-4 w-4 text-muted-foreground" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                                e.preventDefault();
                                onToggleFavorite(pnode.id);
                            }}
                            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        >
                            <Star
                                className={`h-4 w-4 ${isFavorite ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`}
                            />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={getStatusVariant(pnode.status)}>{pnode.status}</Badge>
                    <span className="text-xs text-muted-foreground">{pnode.location || 'Unknown'}</span>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* pNode Score - Prominent Display */}
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50 cursor-help">
                                <div className="flex items-center gap-2">
                                    <Award className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-medium">pNode Score</span>
                                </div>
                                <ScoreCircle score={pnode.performanceScore} size={40} />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                            <div className="space-y-1 text-xs">
                                <p className="font-semibold">Score Breakdown:</p>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                                    <span className="text-muted-foreground">Uptime (30%)</span>
                                    <span>{pnode.performance.uptime.toFixed(1)}%</span>
                                    <span className="text-muted-foreground">Storage (20%)</span>
                                    <span>{formatBytes(pnode.storage.capacityBytes)}</span>
                                    <span className="text-muted-foreground">Latency (25%)</span>
                                    <span>{pnode.performance.averageLatency.toFixed(0)}ms</span>
                                    <span className="text-muted-foreground">Success Rate (15%)</span>
                                    <span>{pnode.performance.successRate.toFixed(1)}%</span>
                                    <span className="text-muted-foreground">Version (10%)</span>
                                    <span>{pnode.version}</span>
                                </div>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Storage</span>
                    </div>
                    <span className="font-medium">{formatBytes(pnode.storage.capacityBytes)}</span>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Uptime</span>
                    </div>
                    <span className={`font-medium ${getPerformanceColor(pnode.performance.uptime)}`}>
                        {pnode.performance.uptime.toFixed(1)}%
                    </span>
                </div>

                <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Utilization</span>
                        <span>{formatPercentage(pnode.storage.utilization)}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div
                            className="bg-primary rounded-full h-1.5 transition-all"
                            style={{ width: `${pnode.storage.utilization}%` }}
                        />
                    </div>
                </div>

                {/* Quant Stats Indicator */}
                {allPNodes.length >= 3 && (
                    <div className="pt-2 border-t">
                        <TooltipProvider>
                            <QuickStats pnode={pnode} allPNodes={allPNodes} />
                        </TooltipProvider>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
