#!/usr/bin/env node

/**
 * Indexer Trigger Script
 * 
 * This script periodically triggers the indexer cron endpoint to fetch
 * pNode data from the Xandeum network and store it in the database.
 * 
 * Usage:
 *   node scripts/trigger-indexer.js [interval_seconds] [port]
 * 
 * Examples:
 *   node scripts/trigger-indexer.js          # 5 second interval, port 3000
 *   node scripts/trigger-indexer.js 10       # 10 second interval, port 3000
 *   node scripts/trigger-indexer.js 5 3001   # 5 second interval, port 3001
 */

const INTERVAL_SECONDS = parseInt(process.argv[2]) || 5;
const PORT = process.argv[3] || process.env.PORT || 3001;
const CRON_SECRET = process.env.CRON_SECRET || '';
const BASE_URL = `http://localhost:${PORT}`;

console.log(`
╔════════════════════════════════════════════════════════════╗
║              Opue Indexer Trigger Script                   ║
╠════════════════════════════════════════════════════════════╣
║  Target:    ${BASE_URL.padEnd(43)}║
║  Interval:  ${(INTERVAL_SECONDS + ' seconds').padEnd(43)}║
║  Press Ctrl+C to stop                                      ║
╚════════════════════════════════════════════════════════════╝
`);

let cycleCount = 0;
let successCount = 0;
let failCount = 0;

async function triggerIndexer() {
    cycleCount++;
    const timestamp = new Date().toISOString();
    
    try {
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (CRON_SECRET) {
            headers['Authorization'] = `Bearer ${CRON_SECRET}`;
        }

        const response = await fetch(`${BASE_URL}/api/cron/index`, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(30000), // 30 second timeout
        });

        const data = await response.json();

        if (response.ok && data.success) {
            successCount++;
            console.log(`[${timestamp}] ✅ Cycle #${cycleCount} - ${data.message}`);
        } else {
            failCount++;
            console.log(`[${timestamp}] ❌ Cycle #${cycleCount} - Error: ${data.error || response.statusText}`);
        }
    } catch (error) {
        failCount++;
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`[${timestamp}] ❌ Cycle #${cycleCount} - Failed: ${errorMessage}`);
    }

    // Print stats every 10 cycles
    if (cycleCount % 10 === 0) {
        console.log(`\n📊 Stats: ${successCount} success, ${failCount} failed out of ${cycleCount} cycles\n`);
    }
}

// Initial trigger
triggerIndexer();

// Schedule periodic triggers
const intervalMs = INTERVAL_SECONDS * 1000;
const intervalId = setInterval(triggerIndexer, intervalMs);

// Handle graceful shutdown
process.on('SIGINT', () => {
    clearInterval(intervalId);
    console.log(`\n\n╔════════════════════════════════════════════════════════════╗`);
    console.log(`║                    Shutdown Summary                        ║`);
    console.log(`╠════════════════════════════════════════════════════════════╣`);
    console.log(`║  Total Cycles:  ${cycleCount.toString().padEnd(41)}║`);
    console.log(`║  Successful:    ${successCount.toString().padEnd(41)}║`);
    console.log(`║  Failed:        ${failCount.toString().padEnd(41)}║`);
    console.log(`║  Success Rate:  ${((successCount / cycleCount) * 100).toFixed(1)}%${' '.repeat(37)}║`);
    console.log(`╚════════════════════════════════════════════════════════════╝\n`);
    process.exit(0);
});

console.log(`Starting indexer trigger loop (every ${INTERVAL_SECONDS}s)...\n`);












