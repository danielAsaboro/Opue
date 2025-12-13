import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

/**
 * GET /api/analytics/leaderboard
 * Get top performing pNodes
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10');
        const metric = (searchParams.get('metric') || 'performance') as 'performance' | 'uptime' | 'capacity';

        const leaderboard = await analyticsService.getTopPNodes(limit, metric);

        return NextResponse.json({
            success: true,
            data: leaderboard,
            meta: {
                limit,
                metric,
                generatedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('[API] Leaderboard error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch leaderboard',
            },
            { status: 500 }
        );
    }
}
