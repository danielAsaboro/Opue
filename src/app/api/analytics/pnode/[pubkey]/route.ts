import { NextRequest, NextResponse } from 'next/server';
import { analyticsService } from '@/services/analytics.service';

/**
 * GET /api/analytics/pnode/[pubkey]
 * Get detailed history for a specific pNode
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ pubkey: string }> }
) {
    try {
        const { pubkey } = await params;
        const searchParams = request.nextUrl.searchParams;
        const days = parseInt(searchParams.get('days') || '7');

        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const history = await analyticsService.getPNodeHistory(pubkey, startDate);

        return NextResponse.json({
            success: true,
            data: history,
            meta: {
                days,
                snapshotCount: history.snapshots.length,
            },
        });
    } catch (error) {
        console.error('[API] pNode history error:', error);

        const message = error instanceof Error ? error.message : 'Failed to fetch pNode history';
        const status = message.includes('not found') ? 404 : 500;

        return NextResponse.json(
            { success: false, error: message },
            { status }
        );
    }
}
