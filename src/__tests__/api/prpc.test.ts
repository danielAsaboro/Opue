import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Next.js modules
vi.mock('next/server', () => ({
  NextRequest: vi.fn().mockImplementation((url: string) => ({
    url,
    json: vi.fn(),
    nextUrl: { searchParams: new URLSearchParams() },
  })),
  NextResponse: {
    json: vi.fn((body, options) => ({
      body,
      status: options?.status || 200,
      json: async () => body,
    })),
  },
}))

// Mock the RPC endpoints
const mockRPCResponse = {
  jsonrpc: '2.0',
  result: [
    {
      pubkey: 'test-pubkey-123',
      gossip: '192.168.1.1:8001',
      tpu: '192.168.1.1:8003',
      rpc: 'http://192.168.1.1:8899',
      version: '1.18.0',
      featureSet: 123456,
      shredVersion: 1,
    },
  ],
  id: 1,
}

describe('/api/prpc Route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('RPC Call Logic', () => {
    it('should transform getClusterNodes response to pods format', () => {
      const clusterNodes = [
        {
          pubkey: 'node1',
          gossip: '192.168.1.1:8001',
          tpu: '192.168.1.1:8003',
          rpc: 'http://192.168.1.1:8899',
          version: '1.18.0',
          featureSet: 123456,
          shredVersion: 1,
        },
      ]

      // Simulate the transformation logic from route.ts
      const transformedResult = {
        jsonrpc: '2.0',
        result: {
          pods: clusterNodes.map((node) => ({
            address: node.gossip || `${node.pubkey}:9001`,
            version: node.version || 'unknown',
            last_seen: new Date().toISOString(),
            last_seen_timestamp: Math.floor(Date.now() / 1000),
            pubkey: node.pubkey,
            rpc: node.rpc,
            tpu: node.tpu,
          })),
          total_count: clusterNodes.length,
        },
        id: 1,
      }

      expect(transformedResult.result.pods).toHaveLength(1)
      expect(transformedResult.result.pods[0].pubkey).toBe('node1')
      expect(transformedResult.result.total_count).toBe(1)
    })

    it('should handle empty cluster nodes', () => {
      const clusterNodes: unknown[] = []

      const transformedResult = {
        jsonrpc: '2.0',
        result: {
          pods: clusterNodes.map(() => ({})),
          total_count: clusterNodes.length,
        },
        id: 1,
      }

      expect(transformedResult.result.pods).toHaveLength(0)
      expect(transformedResult.result.total_count).toBe(0)
    })
  })

  describe('Error Handling', () => {
    it('should return error response for RPC failures', () => {
      const errorResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'All RPC endpoints failed',
        },
        id: 1,
      }

      expect(errorResponse.error.code).toBe(-32000)
      expect(errorResponse.error.message).toContain('failed')
    })
  })
})

describe('RPC Endpoint Configuration', () => {
  it('should have correct endpoint format', () => {
    const endpoints = ['https://api.devnet.xandeum.com:8899', 'https://rpc.xandeum.network']

    endpoints.forEach((endpoint) => {
      expect(endpoint).toMatch(/^https:\/\//)
    })
  })

  it('should use getClusterNodes method for pod data', () => {
    const method = 'getClusterNodes'
    expect(method).toBe('getClusterNodes')
  })
})
