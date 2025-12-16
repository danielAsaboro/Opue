'use client';

import { useEffect, useState } from 'react';
import type { PNode } from '@/types/pnode';
import dynamic from 'next/dynamic';

// Dynamically import GlobeMap to avoid SSR issues with Mapbox GL
const GlobeMap = dynamic(
    () => import('@/components/network/globe-map').then((mod) => mod.GlobeMap),
    {
        ssr: false,
        loading: () => (
            <div className="w-full h-[800px] bg-black/40 rounded-xl flex items-center justify-center border border-white/10">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Loading globe...</p>
                </div>
            </div>
        ),
    }
);

interface PNodeMapProps {
    pnodes: PNode[];
}

export function PNodeMap({ pnodes }: PNodeMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-[800px] bg-black/40 rounded-xl flex items-center justify-center border border-white/10">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Loading globe...</p>
                </div>
            </div>
        );
    }

    return <GlobeMap pnodes={pnodes} />;
}
