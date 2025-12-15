import { NextRequest, NextResponse } from 'next/server';
import { pnodeService } from '@/services/pnode.service';

/**
 * GET /api/pnodes/[id]
 * Fetch detailed pNode information (runs server-side for GeoIP)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const pnode = await pnodeService.fetchPNodeDetails(id);
        return NextResponse.json(pnode);
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch pNode';
        const status = message.includes('not found') ? 404 : 500;
        return NextResponse.json({ error: message }, { status });
    }
}
