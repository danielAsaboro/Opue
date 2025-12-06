import { NextRequest, NextResponse } from 'next/server';

/**
 * Xandeum cluster node response from getClusterNodes RPC
 */
interface ClusterNode {
    pubkey: string;
    gossip: string;
    tpu: string;
    rpc: string | null;
    version: string | null;
    featureSet: number | null;
    shredVersion: number | null;
}

interface RPCResponse {
    jsonrpc: string;
    result: ClusterNode[];
    id: number;
}

/**
 * List of Xandeum RPC endpoints to query
 * Using the correct endpoint format: https://api.devnet.xandeum.com:8899
 */
const RPC_ENDPOINTS = [
    'https://api.devnet.xandeum.com:8899',
    'https://rpc.xandeum.network',
];

/**
 * Make an RPC call to a specific endpoint
 */
async function callRPC(endpoint: string, method: string, params: unknown[] = []): Promise<unknown> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
        console.log(`[API] Making RPC call to ${endpoint} with method ${method}`);
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method,
                params,
                id: 1,
            }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`RPC call failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Try fetching from multiple endpoints until one succeeds
 */
async function fetchFromEndpoints(method: string, params: unknown[] = []): Promise<unknown> {
    const errors: string[] = [];

    for (const endpoint of RPC_ENDPOINTS) {
        try {
            console.log(`[API] Trying RPC endpoint: ${endpoint}`);
            const result = await callRPC(endpoint, method, params);
            console.log(`[API] Success from ${endpoint}`);
            return result;
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.warn(`[API] Failed from ${endpoint}: ${errorMsg}`);
            errors.push(`${endpoint}: ${errorMsg}`);
            continue;
        }
    }

    throw new Error(`All RPC endpoints failed: ${errors.join('; ')}`);
}

/**
 * Transform getClusterNodes response to match expected pod format
 */
function transformClusterNodesToPods(nodes: ClusterNode[]) {
    return {
        jsonrpc: '2.0',
        result: {
            pods: nodes.map(node => ({
                address: node.gossip || `${node.pubkey}:9001`,
                version: node.version || 'unknown',
                last_seen: new Date().toISOString(),
                last_seen_timestamp: Math.floor(Date.now() / 1000),
                pubkey: node.pubkey,
                rpc: node.rpc,
                tpu: node.tpu,
            })),
            total_count: nodes.length,
        },
        id: 1,
    };
}

/**
 * POST /api/prpc
 * Proxy RPC requests to Xandeum endpoints
 * Uses getClusterNodes to get pNode/validator information
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { method = 'get-pods', params = [] } = body;

        console.log(`[API] pRPC request: method=${method}, params=${JSON.stringify(params)}`);

        // Map get-pods to getClusterNodes for Xandeum RPC
        if (method === 'get-pods') {
            const result = await fetchFromEndpoints('getClusterNodes', []) as RPCResponse;

            if (result.result && Array.isArray(result.result)) {
                // Transform to expected pod format
                const transformedResult = transformClusterNodesToPods(result.result);
                console.log(`[API] Transformed ${result.result.length} cluster nodes to pods`);
                return NextResponse.json(transformedResult);
            }

            return NextResponse.json(result);
        }

        // For other methods, pass through directly
        const result = await fetchFromEndpoints(method, params);
        return NextResponse.json(result);
    } catch (error) {
        console.error('[API] RPC proxy error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: errorMessage,
                },
                id: 1,
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/prpc
 * Quick health check and get cluster nodes
 */
export async function GET() {
    try {
        const result = await fetchFromEndpoints('getClusterNodes', []) as RPCResponse;

        if (result.result && Array.isArray(result.result)) {
            const transformedResult = transformClusterNodesToPods(result.result);
            return NextResponse.json(transformedResult);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('[API] RPC GET error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            {
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: errorMessage,
                },
                id: 1,
            },
            { status: 500 }
        );
    }
}
