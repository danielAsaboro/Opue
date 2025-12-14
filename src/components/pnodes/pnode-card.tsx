'use client';

import { useEffect, useState } from 'react';
import type { PNode } from '@/types/pnode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBytes, formatPercentage, truncatePublicKey } from '@/lib/format';
import { Star, Database, Activity, Bell, BellOff } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist, isInWatchlist } from '@/lib/watchlist';
import Link from 'next/link';

interface PNodeCardProps {
    pnode: PNode;
    isFavorite: boolean;
    onToggleFavorite: (id: string) => void;
}

export function PNodeCard({ pnode, isFavorite, onToggleFavorite }: PNodeCardProps) {
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
                    <Link href={`/pnodes/${pnode.id}`} className="flex-1">
                        <CardTitle className="text-base font-mono hover:underline">
                            {truncatePublicKey(pnode.id, 6, 6)}
                        </CardTitle>
                    </Link>
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
                        <span className="text-muted-foreground">Performance</span>
                    </div>
                    <span className={`font-medium ${getPerformanceColor(pnode.performanceScore)}`}>
                        {pnode.performanceScore}/100
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
            </CardContent>
        </Card>
    );
}
