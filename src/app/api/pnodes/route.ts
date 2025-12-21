import { NextResponse } from 'next/server';
import { pnodeService } from '@/services/pnode.service';

/**
 * GET /api/pnodes
 * Fetch all pNodes with real stats (runs server-side for pnRPC access)
 */
export async function GET() {
    try {
        const pnodes = await pnodeService.fetchAllPNodes();
        return NextResponse.json(pnodes);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch pNodes';
        console.error('[API] Failed to fetch pNodes:', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
