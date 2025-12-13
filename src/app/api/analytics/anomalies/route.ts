import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

/**
 * GET /api/analytics/anomalies
 * Get detected anomalies
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '20');
        const includeUnconfirmed = searchParams.get('includeUnconfirmed') !== 'false';

        const anomalies = await analyticsService.getAnomalies(limit, includeUnconfirmed);

        return NextResponse.json({
            success: true,
            data: anomalies,
            meta: {
                count: anomalies.length,
                includeUnconfirmed,
            },
        });
    } catch (error) {
        console.error('[API] Anomalies fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch anomalies' },
            { status: 500 }
        );
    }
}
