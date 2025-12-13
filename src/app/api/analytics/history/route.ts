import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

/**
 * GET /api/analytics/history
 * Get network history data for charts
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '7');
        const resolution = (searchParams.get('resolution') || 'hourly') as 'hourly' | 'daily';
        const type = searchParams.get('type') || 'network';

        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        let data;

        switch (type) {
            case 'network':
                data = await analyticsService.getNetworkHistory(startDate, new Date(), resolution);
                break;
            case 'growth':
                data = await analyticsService.getNetworkGrowth(days);
                break;
            case 'versions':
                data = await analyticsService.getVersionTrends(days);
                break;
            case 'geo':
                data = await analyticsService.getGeographicAnalysis();
                break;
            default:
                return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            data,
            meta: {
                days,
                resolution,
                type,
                generatedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error('[API] Analytics history error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch analytics',
            },
            { status: 500 }
        );
    }
}
