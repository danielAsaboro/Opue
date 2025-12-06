'use client';

import { usePNodes } from '@/hooks/usePNodes';
import { PerformanceInsights } from '@/components/performance-insights';
import { ActivityFeed } from '@/components/activity-feed';

export default function InsightsPage() {
    const { data: pnodes } = usePNodes();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Network Insights</h1>
                <p className="text-muted-foreground mt-2">
                    AI-powered recommendations and real-time activity
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <PerformanceInsights pnodes={pnodes} />
                <ActivityFeed />
            </div>
        </div>
    );
}
