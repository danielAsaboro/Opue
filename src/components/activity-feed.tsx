'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/format';

interface ActivityEvent {
    id: string;
    type: 'node_online' | 'node_offline' | 'performance_increase' | 'performance_decrease' | 'storage_updated' | 'alert';
    title: string;
    description: string;
    timestamp: number;
    severity?: 'info' | 'success' | 'warning' | 'error';
}

// Mock activity feed
const generateActivityFeed = (): ActivityEvent[] => {
    const now = Date.now();
    return [
        {
            id: '1',
            type: 'node_online',
            title: 'pNode came online',
            description: 'g3jQ3cD...ipjPb2 is now operational',
            timestamp: now - 2 * 60 * 1000,
            severity: 'success',
        },
        {
            id: '2',
            type: 'performance_increase',
            title: 'Performance improved',
            description: 'Network average performance increased by 3.2%',
            timestamp: now - 5 * 60 * 1000,
            severity: 'success',
        },
        {
            id: '3',
            type: 'storage_updated',
            title: 'Storage capacity expanded',
            description: 'Total network capacity increased to 2.4 PB',
            timestamp: now - 12 * 60 * 1000,
            severity: 'info',
        },
        {
            id: '4',
            type: 'alert',
            title: 'High utilization detected',
            description: '2 pNodes exceeding 90% storage capacity',
            timestamp: now - 18 * 60 * 1000,
            severity: 'warning',
        },
        {
            id: '5',
            type: 'node_offline',
            title: 'pNode went offline',
            description: 'xY9Km1...Zt8Qw3 is experiencing connectivity issues',
            timestamp: now - 25 * 60 * 1000,
            severity: 'error',
        },
        {
            id: '6',
            type: 'performance_decrease',
            title: 'Performance degradation',
            description: 'pNode Lp7Nx2...Hf5Rt9 performance dropped to 68/100',
            timestamp: now - 42 * 60 * 1000,
            severity: 'warning',
        },
        {
            id: '7',
            type: 'node_online',
            title: 'New pNode joined network',
            description: 'Bq4Tp8...Ks2Mn1 joined the network',
            timestamp: now - 65 * 60 * 1000,
            severity: 'success',
        },
        {
            id: '8',
            type: 'storage_updated',
            title: 'Storage rebalanced',
            description: 'Automatic storage rebalancing completed across 5 nodes',
            timestamp: now - 90 * 60 * 1000,
            severity: 'info',
        },
    ];
};

export function ActivityFeed() {
    const activities = generateActivityFeed();

    const getIcon = (type: string) => {
        switch (type) {
            case 'node_online':
                return <CheckCircle className="h-4 w-4" />;
            case 'node_offline':
                return <XCircle className="h-4 w-4" />;
            case 'performance_increase':
                return <TrendingUp className="h-4 w-4" />;
            case 'performance_decrease':
                return <TrendingDown className="h-4 w-4" />;
            case 'alert':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const getSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'success':
                return 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20';
            case 'warning':
                return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'error':
                return 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20';
            default:
                return 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Live Activity Feed
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {activities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className="flex gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-all animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className={`p-2 rounded-lg ${getSeverityColor(activity.severity)}`}>
                                {getIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className="text-sm font-medium">{activity.title}</p>
                                    <Badge variant="outline" className="shrink-0 text-xs">
                                        {formatRelativeTime(activity.timestamp)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{activity.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
