import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

/**
 * GET /api/analytics/events
 * Get recent network events
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50');
        const severity = searchParams.get('severity') || undefined;

        const events = await analyticsService.getRecentEvents(limit, severity);

        return NextResponse.json({
            success: true,
            data: events,
            meta: {
                count: events.length,
                limit,
                severity: severity || 'all',
            },
        });
    } catch (error) {
        console.error('[API] Events fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch events',
            },
            { status: 500 }
        );
    }
}
