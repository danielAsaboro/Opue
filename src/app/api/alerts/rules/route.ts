import { NextRequest, NextResponse } from 'next/server';
import { getAlertService } from '@/services/alert.service';

/**
 * GET /api/alerts/rules
 * Get all alert rules
 */
export async function GET(request: NextRequest) {
    try {
        const alertService = getAlertService();
        const searchParams = request.nextUrl.searchParams;
        const includeDisabled = searchParams.get('includeDisabled') === 'true';

        let rules = alertService.getRules();

        // Filter out disabled rules if not requested
        if (!includeDisabled) {
            rules = rules.filter((rule) => rule.enabled);
        }

        return NextResponse.json({
            success: true,
            data: rules,
        });
    } catch (error) {
        console.error('[API] Alert rules fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch alert rules' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/alerts/rules
 * Update an alert rule (enable/disable)
 */
export async function PATCH(request: NextRequest) {
    try {
        const alertService = getAlertService();
        const body = await request.json();

        const { ruleId, enabled } = body;
        if (!ruleId) {
            return NextResponse.json(
                { success: false, error: 'Missing required field: ruleId' },
                { status: 400 }
            );
        }

        if (typeof enabled === 'boolean') {
            alertService.toggleRule(ruleId, enabled);
        }

        return NextResponse.json({
            success: true,
            message: `Rule ${ruleId} updated`,
        });
    } catch (error) {
        console.error('[API] Alert rule update error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update alert rule' },
            { status: 500 }
        );
    }
}
