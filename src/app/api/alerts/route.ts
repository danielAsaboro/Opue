import { NextRequest, NextResponse } from 'next/server';
import { getAlertService } from '@/services/alert.service';

/**
 * GET /api/alerts
 * Get recent alerts
 */
export async function GET(request: NextRequest) {
    try {
        const alertService = getAlertService();
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50');
        const unresolved = searchParams.get('unresolved') === 'true';

        // Get alerts - filter by unresolved if requested
        let alerts = unresolved ? alertService.getActiveAlerts() : alertService.getAlerts();

        // Apply limit
        alerts = alerts.slice(0, limit);

        return NextResponse.json({
            success: true,
            data: alerts,
            meta: {
                count: alerts.length,
                unresolvedOnly: unresolved,
            },
        });
    } catch (error) {
        console.error('[API] Alerts fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch alerts' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/alerts
 * Resolve alerts
 */
export async function PATCH(request: NextRequest) {
    try {
        const alertService = getAlertService();
        const body = await request.json();
        const { alertId } = body;

        if (!alertId) {
            return NextResponse.json(
                { success: false, error: 'Must provide alertId' },
                { status: 400 }
            );
        }

        alertService.resolveAlert(alertId);
        return NextResponse.json({ success: true, message: 'Alert resolved' });
    } catch (error) {
        console.error('[API] Alert resolve error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to resolve alert(s)' },
            { status: 500 }
        );
    }
}
