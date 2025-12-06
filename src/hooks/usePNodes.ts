import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { pnodeService } from '@/services/pnode.service';
import type { PNode, PNodeDetails, NetworkStats } from '@/types/pnode';

/**
 * Hook to fetch all pNodes with caching and auto-refetch
 */
export function usePNodes(): UseQueryResult<PNode[], Error> {
    return useQuery({
        queryKey: ['pnodes'],
        queryFn: () => pnodeService.fetchAllPNodes(),
        staleTime: 30000, // 30 seconds
        refetchInterval: 30000, // Auto-refetch every 30 seconds
    });
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
    });
}

/**
 * Hook to fetch network statistics
 */
export function useNetworkStats(): UseQueryResult<NetworkStats, Error> {
    return useQuery({
        queryKey: ['network-stats'],
        queryFn: () => pnodeService.fetchNetworkStats(),
        staleTime: 30000,
        refetchInterval: 30000,
    });
}
