import { NextRequest, NextResponse } from 'next/server';
import { getAnalyticsService } from '@/services/analytics.service';

/**
 * GET /api/analytics/pnode/[pubkey]
 * Get predictions for a specific pNode
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ pubkey: string }> }
) {
    try {
        const analyticsService = getAnalyticsService();
        const { pubkey } = await params;

        // Use getPredictions with the pNode pubkey
        const predictions = await analyticsService.getPredictions(pubkey);

        return NextResponse.json({
            success: true,
            data: predictions,
            meta: {
                pubkey,
                dataPoints: predictions.dataPoints,
            },
        });
    } catch (error) {
        console.error('[API] pNode analytics error:', error);

        const message = error instanceof Error ? error.message : 'Failed to fetch pNode analytics';
        const status = message.includes('not found') ? 404 : 500;

        return NextResponse.json(
            { success: false, error: message },
            { status }
        );
    }
}
