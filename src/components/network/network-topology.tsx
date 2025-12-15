'use client';

import dynamic from 'next/dynamic';
import type { PNode } from '@/types/pnode';

// Dynamically import GlobeMap to avoid SSR issues with Mapbox GL
const GlobeMap = dynamic(
    () => import('@/components/network/globe-map').then((mod) => mod.GlobeMap),
    {
        ssr: false,
        loading: () => (
            <div className="relative w-full h-[600px] bg-black/40 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Loading network topology...</p>
                </div>
            </div>
        ),
    }
);

interface NetworkTopologyProps {
    pnodes: PNode[];
}

export function NetworkTopology({ pnodes }: NetworkTopologyProps) {
    return <GlobeMap pnodes={pnodes} className="h-[600px]" />;
}
