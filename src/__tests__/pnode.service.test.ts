import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { pnodeService } from '@/services/pnode.service'

// Mock response data matching Xandeum RPC format
const mockClusterNodes = {
  jsonrpc: '2.0',
  result: {
    pods: [
      {
        pubkey: 'node1pubkey123456789',
        address: '192.168.1.1:9001',
        version: '1.18.0',
        last_seen: new Date().toISOString(),
        last_seen_timestamp: Math.floor(Date.now() / 1000),
        rpc: 'http://192.168.1.1:8899',
        tpu: '192.168.1.1:9000',
      },
      {
        pubkey: 'node2pubkey987654321',
        address: '192.168.1.2:9001',
        version: '1.18.0',
        last_seen: new Date().toISOString(),
        last_seen_timestamp: Math.floor(Date.now() / 1000),
        rpc: null,
        tpu: '192.168.1.2:9000',
      },
    ],
    total_count: 2,
  },
  id: 1,
}

describe('pnodeService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('fetchAllPNodes', () => {
    it('should fetch and transform pNode data correctly', async () => {
      // Mock the fetch call
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClusterNodes,
      } as Response)

      const pnodes = await pnodeService.fetchAllPNodes()

      expect(pnodes).toHaveLength(2)
      expect(pnodes[0]).toMatchObject({
        id: 'node1pubkey123456789',
        status: expect.stringMatching(/online|offline|delinquent/),
        version: '1.18.0',
      })
    })

    it('should throw error when no pNodes are found', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          result: { pods: [], total_count: 0 },
          id: 1,
        }),
      } as Response)

      await expect(pnodeService.fetchAllPNodes()).rejects.toThrow('No pNodes found')
    })

    it('should handle network errors gracefully', async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(pnodeService.fetchAllPNodes()).rejects.toThrow()
    })

    it('should handle API errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          jsonrpc: '2.0',
          error: { code: -32000, message: 'Server error' },
          id: 1,
        }),
      } as Response)

      await expect(pnodeService.fetchAllPNodes()).rejects.toThrow()
    })
  })

  describe('fetchNetworkStats', () => {
    it('should calculate network stats from pNode data', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClusterNodes,
      } as Response)

      const stats = await pnodeService.fetchNetworkStats()

      expect(stats).toMatchObject({
        totalPNodes: expect.any(Number),
        onlinePNodes: expect.any(Number),
        offlinePNodes: expect.any(Number),
        totalCapacity: expect.any(Number),
        totalUsed: expect.any(Number),
        healthScore: expect.any(Number),
        averagePerformance: expect.any(Number),
      })
    })
  })

  describe('fetchPNodeDetails', () => {
    it('should return details for a specific pNode', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClusterNodes,
      } as Response)

      const details = await pnodeService.fetchPNodeDetails('node1pubkey123456789')

      expect(details).toBeDefined()
      expect(details.id).toBe('node1pubkey123456789')
    })

    it('should throw error for non-existent pNode', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClusterNodes,
      } as Response)

      await expect(pnodeService.fetchPNodeDetails('nonexistent')).rejects.toThrow('pNode not found')
    })
  })
})

describe('pNode Data Transformation', () => {
  it('should assign correct status based on last_seen timestamp', async () => {
    const recentTimestamp = Math.floor(Date.now() / 1000) - 60 // 1 minute ago (online)
    const delinquentTimestamp = Math.floor(Date.now() / 1000) - 600 // 10 minutes ago (delinquent: 5-30 mins)
    const offlineTimestamp = Math.floor(Date.now() / 1000) - 2400 // 40 minutes ago (offline: > 30 mins)

    const mockData = {
      jsonrpc: '2.0',
      result: {
        pods: [
          {
            pubkey: 'recentNode',
            address: '192.168.1.1:9001',
            version: '1.18.0',
            last_seen: new Date(recentTimestamp * 1000).toISOString(),
            last_seen_timestamp: recentTimestamp,
            rpc: null,
            tpu: null,
          },
          {
            pubkey: 'delinquentNode',
            address: '192.168.1.2:9001',
            version: '1.18.0',
            last_seen: new Date(delinquentTimestamp * 1000).toISOString(),
            last_seen_timestamp: delinquentTimestamp,
            rpc: null,
            tpu: null,
          },
          {
            pubkey: 'offlineNode',
            address: '192.168.1.3:9001',
            version: '1.18.0',
            last_seen: new Date(offlineTimestamp * 1000).toISOString(),
            last_seen_timestamp: offlineTimestamp,
            rpc: null,
            tpu: null,
          },
        ],
        total_count: 3,
      },
      id: 1,
    }

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response)

    const pnodes = await pnodeService.fetchAllPNodes()

    const recentNode = pnodes.find((p) => p.id === 'recentNode')
    const delinquentNode = pnodes.find((p) => p.id === 'delinquentNode')
    const offlineNode = pnodes.find((p) => p.id === 'offlineNode')

    expect(recentNode?.status).toBe('online')
    expect(delinquentNode?.status).toBe('delinquent')
    expect(offlineNode?.status).toBe('offline')
  })

  it('should calculate performance score between 0 and 100', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockClusterNodes,
    } as Response)

    const pnodes = await pnodeService.fetchAllPNodes()

    pnodes.forEach((pnode) => {
      expect(pnode.performanceScore).toBeGreaterThanOrEqual(0)
      expect(pnode.performanceScore).toBeLessThanOrEqual(100)
    })
  })
})
