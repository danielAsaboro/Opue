'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Lightbulb,
    TrendingUp,
    AlertTriangle,
    Target,
    Zap,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import type { PNode } from '@/types/pnode';

interface Insight {
    id: string;
    type: 'opportunity' | 'warning' | 'recommendation' | 'achievement';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    action?: {
        label: string;
        href: string;
    };
}

// AI-like insights generator
const generateInsights = (pnodes?: PNode[]): Insight[] => {
    if (!pnodes) return [];

    const insights: Insight[] = [];

    // Check for underperforming nodes
    const underperforming = pnodes.filter((p) => p.performanceScore < 60);
    if (underperforming.length > 0) {
        insights.push({
            id: 'underperforming',
            type: 'warning',
            title: `${underperforming.length} pNodes underperforming`,
            description: 'These nodes have performance scores below 60. Consider investigating their configuration or connectivity.',
            impact: 'high',
            action: {
                label: 'View Nodes',
                href: '/pnodes?filter=low-performance',
            },
        });
    }

    // Check for storage capacity opportunities
    const highCapacity = pnodes.filter((p) => p.storage.capacityBytes > 5e12 && p.storage.utilization < 50);
    if (highCapacity.length > 0) {
        insights.push({
            id: 'capacity-opportunity',
            type: 'opportunity',
            title: `${highCapacity.length} high-capacity nodes underutilized`,
            description: 'These nodes have significant available storage. Great opportunity for new file systems.',
            impact: 'medium',
            action: {
                label: 'Explore',
                href: '/pnodes?filter=high-capacity',
            },
        });
    }

    // Top performers
    const topPerformers = pnodes.filter((p) => p.performanceScore >= 90);
    if (topPerformers.length > 0) {
        insights.push({
            id: 'top-performers',
            type: 'achievement',
            title: `${topPerformers.length} pNodes achieving excellence`,
            description: 'These nodes consistently maintain performance scores above 90. Learn from their configuration.',
            impact: 'low',
            action: {
                label: 'View Top Performers',
                href: '/pnodes?filter=top-performers',
            },
        });
    }

    // Network health recommendation
    const onlineRate = pnodes.filter((p) => p.status === 'online').length / pnodes.length;
    if (onlineRate < 0.95) {
        insights.push({
            id: 'network-health',
            type: 'recommendation',
            title: 'Network availability could be improved',
            description: `Current online rate is ${(onlineRate * 100).toFixed(1)}%. Consider monitoring offline nodes more closely.`,
            impact: 'medium',
        });
    }

    // Geographic distribution
    const locations = new Set(pnodes.map((p) => p.location).filter(Boolean));
    if (locations.size < 5) {
        insights.push({
            id: 'geographic-diversity',
            type: 'recommendation',
            title: 'Limited geographic distribution',
            description: `Network spans ${locations.size} regions. Expanding to more locations could improve resilience.`,
            impact: 'medium',
            action: {
                label: 'View Map',
                href: '/pnodes?view=map',
            },
        });
    }

    return insights;
};

interface PerformanceInsightsProps {
    pnodes?: PNode[];
}

export function PerformanceInsights({ pnodes }: PerformanceInsightsProps) {
    const insights = generateInsights(pnodes);

    const getIcon = (type: string) => {
        switch (type) {
            case 'opportunity':
                return <Zap className="h-5 w-5" />;
            case 'warning':
                return <AlertTriangle className="h-5 w-5" />;
            case 'recommendation':
                return <Target className="h-5 w-5" />;
            case 'achievement':
                return <TrendingUp className="h-5 w-5" />;
            default:
                return <Lightbulb className="h-5 w-5" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'opportunity':
                return 'from-green-500 to-emerald-500';
            case 'warning':
                return 'from-amber-500 to-orange-500';
            case 'recommendation':
                return 'from-blue-500 to-cyan-500';
            case 'achievement':
                return 'from-purple-500 to-pink-500';
            default:
                return 'from-gray-500 to-slate-500';
        }
    };

    const getImpactBadge = (impact: string) => {
        const colors = {
            high: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
            medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            low: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
        return colors[impact as keyof typeof colors] || colors.low;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Performance Insights
                </CardTitle>
                <CardDescription>
                    AI-powered recommendations to optimize your network
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {insights.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>All systems optimal! No insights at this time.</p>
                        </div>
                    ) : (
                        insights.map((insight) => (
                            <div
                                key={insight.id}
                                className="group relative overflow-hidden rounded-lg border p-4 hover:shadow-lg transition-all"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${getColor(insight.type)} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <div className="relative space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`p-2 rounded-lg bg-gradient-to-br ${getColor(insight.type)} text-white`}>
                                                {getIcon(insight.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold mb-1">{insight.title}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {insight.description}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className={getImpactBadge(insight.impact)}>
                                            {insight.impact} impact
                                        </Badge>
                                    </div>
                                    {insight.action && (
                                        <Button variant="ghost" size="sm" asChild className="group/btn">
                                            <Link href={insight.action.href}>
                                                {insight.action.label}
                                                <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
