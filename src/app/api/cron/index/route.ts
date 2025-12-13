import { NextResponse } from 'next/server';
import { indexerService } from '@/services/indexer.service';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: Request) {
    try {
        // Check for authorization if needed (e.g. CRON_SECRET)
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[Cron] Triggering indexing cycle...');
        await indexerService.runIndexingCycle();

        return NextResponse.json({ success: true, message: 'Indexing cycle completed' });
    } catch (error) {
        console.error('[Cron] Indexing failed:', error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
