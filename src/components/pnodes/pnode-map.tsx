'use client';

import { useEffect, useState } from 'react';
import type { PNode } from '@/types/pnode';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);
const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);
const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);
const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

// Mock coordinates for locations (in real app, derive from actual pNode data)
const locationCoordinates: Record<string, [number, number]> = {
    'US-East': [40.7128, -74.0060],
    'US-West': [37.7749, -122.4194],
    'EU-Central': [50.1109, 8.6821],
    'Asia-Pacific': [35.6762, 139.6503],
    'South America': [-23.5505, -46.6333],
    'Unknown': [0, 0],
};

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
            <div className="w-full h-[600px] bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Loading map...</p>
            </div>
        );
    }

    // Group pNodes by location
    const pNodesByLocation = pnodes.reduce((acc, pnode) => {
        const location = pnode.location || 'Unknown';
        if (!acc[location]) {
            acc[location] = [];
        }
        acc[location].push(pnode);
        return acc;
    }, {} as Record<string, PNode[]>);

    return (
        <div className="w-full h-[600px] rounded-lg overflow-hidden border">
            <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {Object.entries(pNodesByLocation).map(([location, nodes]) => {
                    const coords = locationCoordinates[location] || locationCoordinates['Unknown'];
                    const online = nodes.filter((n) => n.status === 'online').length;
                    const total = nodes.length;
                    const avgPerformance = Math.round(
                        nodes.reduce((sum, n) => sum + n.performanceScore, 0) / nodes.length
                    );

                    return (
                        <Marker key={location} position={coords}>
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-semibold text-sm mb-2">{location}</h3>
                                    <div className="space-y-1 text-xs">
                                        <p>
                                            <strong>pNodes:</strong> {total}
                                        </p>
                                        <p>
                                            <strong>Online:</strong> {online} / {total}
                                        </p>
                                        <p>
                                            <strong>Avg Performance:</strong> {avgPerformance}/100
                                        </p>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
