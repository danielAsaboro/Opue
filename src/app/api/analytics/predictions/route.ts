import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

/**
 * GET /api/analytics/predictions
 * Get performance predictions based on historical trends
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const pnodePubkey = searchParams.get('pnode') || undefined;

        const predictions = await analyticsService.getPredictions(pnodePubkey);

        if (!predictions) {
            return NextResponse.json(
                { success: false, error: 'pNode not found' },
                { status: 404 }
            );
        }

        if ('error' in predictions) {
            return NextResponse.json(
                { success: false, error: predictions.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: predictions,
        });
    } catch (error) {
        console.error('[API] Predictions error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate predictions',
            },
            { status: 500 }
        );
    }
}
