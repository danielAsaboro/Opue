import { NextRequest, NextResponse } from 'next/server';
import { alertService } from '@/services/alert.service';

/**
 * GET /api/alerts/rules
 * Get all alert rules
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const includeDisabled = searchParams.get('includeDisabled') === 'true';

        const rules = await alertService.getRules(includeDisabled);

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
 * POST /api/alerts/rules
 * Create a new alert rule
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        const { name, metric, operator, threshold } = body;
        if (!name || !metric || !operator || threshold === undefined) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: name, metric, operator, threshold' },
                { status: 400 }
            );
        }

        // Validate operator
        const validOperators = ['<', '>', '==', '<=', '>='];
        if (!validOperators.includes(operator)) {
            return NextResponse.json(
                { success: false, error: `Invalid operator. Must be one of: ${validOperators.join(', ')}` },
                { status: 400 }
            );
        }

        const rule = await alertService.createRule({
            name,
            description: body.description,
            metric,
            operator,
            threshold: parseFloat(threshold),
            scope: body.scope || 'NETWORK',
            pnodeFilter: body.pnodeFilter,
            notifyEmail: body.notifyEmail,
            notifyWebhook: body.notifyWebhook,
            cooldownMinutes: body.cooldownMinutes ? parseInt(body.cooldownMinutes) : 15,
        });

        return NextResponse.json({
            success: true,
            data: rule,
        });
    } catch (error) {
        console.error('[API] Alert rule creation error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create alert rule' },
            { status: 500 }
        );
    }
}
