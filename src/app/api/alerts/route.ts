import { NextRequest, NextResponse } from 'next/server';
import { alertService } from '@/services/alert.service';

/**
 * GET /api/alerts
 * Get recent alerts
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '50');
        const unresolved = searchParams.get('unresolved') === 'true';
        const severity = searchParams.get('severity') as 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS' | undefined;

        const alerts = await alertService.getAlerts({
            limit,
            unresolved: unresolved || undefined,
            severity,
        });

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
        const body = await request.json();
        const { alertId, ruleId } = body;

        if (!alertId && !ruleId) {
            return NextResponse.json(
                { success: false, error: 'Must provide either alertId or ruleId' },
                { status: 400 }
            );
        }

        if (alertId) {
            await alertService.resolveAlert(alertId);
            return NextResponse.json({ success: true, message: 'Alert resolved' });
        }

        if (ruleId) {
            await alertService.resolveAllForRule(ruleId);
            return NextResponse.json({ success: true, message: 'All alerts for rule resolved' });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Alert resolve error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to resolve alert(s)' },
            { status: 500 }
        );
    }
}
