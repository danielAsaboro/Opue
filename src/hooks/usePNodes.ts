import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { pnodeService } from '@/services/pnode.service'
import { getWebSocketService } from '@/services/websocket.service'
import { getAlertService } from '@/services/alert.service'
import type { PNode, PNodeDetails, NetworkStats } from '@/types/pnode'

/**
 * Hook to fetch all pNodes with caching, auto-refetch, and real-time WebSocket updates
 */
export function usePNodes(): UseQueryResult<PNode[], Error> {
  const queryClient = useQueryClient()
  const wsService = getWebSocketService()
  const wsSubscriptionRef = useRef<number | null>(null)

  const query = useQuery({
    queryKey: ['pnodes'],
    queryFn: async () => {
      const pnodes = await pnodeService.fetchAllPNodes()
      // Check for alerts when data is fetched
      const alertService = getAlertService()
      alertService.checkAlerts(pnodes).catch((error) => {
        console.error('Error checking alerts:', error)
      })
      return pnodes
    },
    staleTime: 15000, // 15 seconds - more responsive
    refetchInterval: 30000, // Poll every 30 seconds for "live" updates
    refetchIntervalInBackground: true, // Keep updating even when tab is not active
  })

  useEffect(() => {
    let mounted = true

    const setupWebSocket = async () => {
      try {
        // Connect to WebSocket if not already connected
        if (!wsService.getConnectionStatus()) {
          await wsService.connect()
        }

        // Subscribe to pNode updates
        if (mounted) {
          wsSubscriptionRef.current = await wsService.subscribeToPNodeUpdates((data: unknown) => {
            if (mounted && Array.isArray(data)) {
              const updatedPNodes = data as PNode[]
              console.log('[WebSocket] Received pNode updates:', updatedPNodes.length, 'pNodes')
              // Update the cache with fresh data
              queryClient.setQueryData(['pnodes'], updatedPNodes)
            }
          })
        }
      } catch (error) {
        console.warn('[WebSocket] Failed to setup real-time updates, falling back to polling:', error)
        // Continue with polling if WebSocket fails
      }
    }

    setupWebSocket()

    return () => {
      mounted = false
      // Cleanup WebSocket subscription
      if (wsSubscriptionRef.current) {
        wsService.unsubscribe(wsSubscriptionRef.current)
        wsSubscriptionRef.current = null
      }
    }
  }, [queryClient, wsService])

  return query
}

/**
 * Hook to fetch detailed pNode information
 */
export function usePNodeDetails(pnodeId: string): UseQueryResult<PNodeDetails, Error> {
  return useQuery({
    queryKey: ['pnode', pnodeId],
    queryFn: () => pnodeService.fetchPNodeDetails(pnodeId),
    staleTime: 60000, // 1 minute
    enabled: !!pnodeId, // Only fetch if pnodeId is provided
  })
}

/**
 * Hook to fetch network statistics with real-time updates
 */
export function useNetworkStats(): UseQueryResult<NetworkStats, Error> {
  const queryClient = useQueryClient()
  const wsService = getWebSocketService()
  const wsSubscriptionRef = useRef<number | null>(null)

  const query = useQuery({
    queryKey: ['network-stats'],
    queryFn: () => pnodeService.fetchNetworkStats(),
    staleTime: 15000,
    refetchInterval: 30000, // Poll every 30 seconds
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    let mounted = true

    const setupWebSocket = async () => {
      try {
        if (!wsService.getConnectionStatus()) {
          await wsService.connect()
        }

        if (mounted) {
          wsSubscriptionRef.current = await wsService.subscribeToNetworkStats((stats: unknown) => {
            if (mounted) {
              console.log('[WebSocket] Received network stats update')
              queryClient.setQueryData(['network-stats'], stats)
            }
          })
        }
      } catch (error) {
        console.warn('[WebSocket] Failed to setup network stats real-time updates:', error)
      }
    }

    setupWebSocket()

    return () => {
      mounted = false
      if (wsSubscriptionRef.current) {
        wsService.unsubscribe(wsSubscriptionRef.current)
        wsSubscriptionRef.current = null
      }
    }
  }, [queryClient, wsService])

  return query
}
