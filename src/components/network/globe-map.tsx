'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Gossip event types based on Solana/Xandeum protocol
export type GossipEventType =
    | 'gossip_push'      // Node broadcasting to fanout peers
    | 'gossip_pull'      // Node requesting data from peers
    | 'peer_discovery'   // New peer discovered
    | 'peer_prune'       // Connection pruned
    | 'heartbeat'        // Liveness signal
    | 'vote_broadcast'   // Validator vote
    | 'sync_complete'    // Node synced
    | 'ledger_update';   // Ledger height update

export interface GossipEvent {
    id: string;
    type: GossipEventType;
    sourceId: string;
    targetId?: string;
    timestamp: number;
}

interface NodeCoordinate {
    id: string;
    lng: number;
    lat: number;
    status: string;
    region: string;
    size: number;
    color: string;
}

interface ArcData {
    id: string;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    color: string;
}

interface GlobeMapProps {
    pnodes: PNode[];
    className?: string;
}

// Region to approximate coordinates mapping
const regionCoordinates: Record<string, [number, number]> = {
    'US-East': [40.7128, -74.0060],
    'US-West': [37.7749, -122.4194],
    'EU-Central': [50.1109, 8.6821],
    'EU-West': [51.5074, -0.1276],
    'Asia-Pacific': [35.6762, 139.6503],
    'Asia-South': [28.6139, 77.2090],
    'South America': [-23.5505, -46.6333],
    'Australia': [-33.8688, 151.2093],
    'Africa': [-33.9249, 18.4241],
    'Unknown': [20, 0],
};

// Event type configurations
const eventConfig: Record<GossipEventType, { color: string; label: string; icon: string }> = {
    gossip_push: { color: '#8b5cf6', label: 'Gossip Push', icon: '📡' },
    gossip_pull: { color: '#06b6d4', label: 'Gossip Pull', icon: '📥' },
    peer_discovery: { color: '#22c55e', label: 'Peer Discovered', icon: '🔍' },
    peer_prune: { color: '#f59e0b', label: 'Peer Pruned', icon: '✂️' },
    heartbeat: { color: '#ec4899', label: 'Heartbeat', icon: '💓' },
    vote_broadcast: { color: '#3b82f6', label: 'Vote Broadcast', icon: '🗳️' },
    sync_complete: { color: '#10b981', label: 'Sync Complete', icon: '✅' },
    ledger_update: { color: '#6366f1', label: 'Ledger Update', icon: '📊' },
};

export function GlobeMap({ pnodes, className }: GlobeMapProps) {
    const globeRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [Globe, setGlobe] = useState<any>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [events, setEvents] = useState<GossipEvent[]>([]);
    const [arcs, setArcs] = useState<ArcData[]>([]);
    const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
    const [showGossipFeed, setShowGossipFeed] = useState(true);
    const [showTopology, setShowTopology] = useState(true);

    // Dynamically import Globe on client side
    useEffect(() => {
        import('react-globe.gl').then((mod) => {
            setGlobe(() => mod.default);
            setIsLoaded(true);
        });
    }, []);

    // Handle resize
    useEffect(() => {
        if (!containerRef.current) return;

        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.clientWidth,
                    height: 800,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    // Convert pnodes to coordinates
    const nodeCoords = useMemo<NodeCoordinate[]>(() => {
        return pnodes.map((pnode) => {
            const region = pnode.location || 'Unknown';
            const baseCoords = regionCoordinates[region] || regionCoordinates['Unknown'];

            // Add jitter so nodes don't stack
            const jitterLat = (Math.random() - 0.5) * 8;
            const jitterLng = (Math.random() - 0.5) * 10;

            const statusColor = pnode.status === 'online'
                ? '#10b981'
                : pnode.status === 'delinquent'
                    ? '#f59e0b'
                    : '#ef4444';

            return {
                id: pnode.id,
                lat: baseCoords[0] + jitterLat,
                lng: baseCoords[1] + jitterLng,
                status: pnode.status,
                region,
                size: pnode.status === 'online' ? 0.4 : 0.25,
                color: statusColor,
            };
        });
    }, [pnodes]);

    // Simulate live gossip events
    useEffect(() => {
        if (nodeCoords.length < 2) return;

        const eventTypes: GossipEventType[] = [
            'gossip_push', 'gossip_pull', 'peer_discovery',
            'heartbeat', 'vote_broadcast', 'sync_complete', 'ledger_update'
        ];

        const generateEvent = (): GossipEvent => {
            const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const sourceIdx = Math.floor(Math.random() * nodeCoords.length);
            let targetIdx = Math.floor(Math.random() * nodeCoords.length);
            // Ensure different target
            while (targetIdx === sourceIdx && nodeCoords.length > 1) {
                targetIdx = Math.floor(Math.random() * nodeCoords.length);
            }

            return {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                type,
                sourceId: nodeCoords[sourceIdx].id,
                targetId: type !== 'heartbeat' && type !== 'sync_complete'
                    ? nodeCoords[targetIdx].id
                    : undefined,
                timestamp: Date.now(),
            };
        };

        // Generate events at varying intervals (100ms to 500ms like real gossip)
        let timeoutId: NodeJS.Timeout;
        const scheduleNextEvent = () => {
            const delay = 150 + Math.random() * 350; // 150-500ms intervals
            timeoutId = setTimeout(() => {
                const newEvent = generateEvent();
                setEvents(prev => [newEvent, ...prev].slice(0, 50));

                // Create arc for events with targets
                if (newEvent.targetId) {
                    const source = nodeCoords.find(n => n.id === newEvent.sourceId);
                    const target = nodeCoords.find(n => n.id === newEvent.targetId);

                    if (source && target) {
                        const arcId = newEvent.id;
                        const config = eventConfig[newEvent.type];

                        setArcs(prev => [...prev, {
                            id: arcId,
                            startLat: source.lat,
                            startLng: source.lng,
                            endLat: target.lat,
                            endLng: target.lng,
                            color: config.color,
                        }]);

                        // Remove arc after animation
                        setTimeout(() => {
                            setArcs(prev => prev.filter(a => a.id !== arcId));
                        }, 2000);
                    }
                }

                scheduleNextEvent();
            }, delay);
        };

        scheduleNextEvent();
        return () => clearTimeout(timeoutId);
    }, [nodeCoords]);

    // Auto-rotate globe
    useEffect(() => {
        if (!globeRef.current) return;

        // Set initial point of view
        globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

        // Auto-rotate
        const controls = globeRef.current.controls();
        if (controls) {
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
        }
    }, [Globe, isLoaded]);

    if (!isLoaded || !Globe) {
        return (
            <div className={cn("relative w-full h-[800px] bg-black rounded-xl border border-white/10 overflow-hidden flex items-center justify-center", className)}>
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">Loading globe...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("relative w-full", className)}>
            {/* Globe Container - shifted right to avoid overlay obstruction */}
            <div
                ref={containerRef}
                className="w-full h-[800px] rounded-xl overflow-hidden bg-[#050510] flex justify-center"
            >
                <div className="ml-20">
                    <Globe
                        ref={globeRef}
                        width={dimensions.width}
                        height={dimensions.height}
                        backgroundColor="rgba(0,0,0,0)"
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                        atmosphereColor="#6366f1"
                        atmosphereAltitude={0.25}
                        // Points (nodes)
                        pointsData={nodeCoords}
                        pointLat="lat"
                        pointLng="lng"
                        pointColor="color"
                        pointAltitude={0.01}
                        pointRadius="size"
                        pointsMerge={false}
                        // Arcs (gossip events)
                        arcsData={arcs}
                        arcStartLat="startLat"
                        arcStartLng="startLng"
                        arcEndLat="endLat"
                        arcEndLng="endLng"
                        arcColor="color"
                        arcAltitude={0.15}
                        arcStroke={0.5}
                        arcDashLength={0.4}
                        arcDashGap={0.2}
                        arcDashAnimateTime={1500}
                        // Labels
                        labelsData={nodeCoords.slice(0, 20)} // Show labels for first 20 nodes
                        labelLat="lat"
                        labelLng="lng"
                        labelText={(d: NodeCoordinate) => d.id.slice(0, 6)}
                        labelSize={0.5}
                        labelDotRadius={0.3}
                        labelColor={() => 'rgba(255, 255, 255, 0.5)'}
                        labelResolution={2}
                    />
                </div>
            </div>

            {/* Live Event Feed Overlay - Collapsible */}
            <div className="absolute top-4 left-4 w-72 pointer-events-auto">
                <div className="bg-black/80 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden">
                    <button
                        onClick={() => setShowGossipFeed(!showGossipFeed)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-xs font-semibold text-white uppercase tracking-wider">Live Gossip Feed</span>
                        </div>
                        {showGossipFeed ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                    </button>
                    {showGossipFeed && (
                        <div className="px-3 pb-3">
                            <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                                {events.slice(0, 12).map((event, idx) => {
                                    const config = eventConfig[event.type];
                                    return (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "flex items-center gap-2 text-xs p-1.5 rounded transition-all duration-300",
                                                idx === 0 ? "bg-white/10" : "bg-transparent opacity-70"
                                            )}
                                        >
                                            <span className="text-sm flex-shrink-0">{config.icon}</span>
                                            <div className="flex-1 min-w-0 truncate">
                                                <span
                                                    className="font-medium"
                                                    style={{ color: config.color }}
                                                >
                                                    {config.label}
                                                </span>
                                                <span className="text-gray-500 ml-1 font-mono text-[10px]">
                                                    {event.sourceId.slice(0, 6)}
                                                    {event.targetId && ` → ${event.targetId.slice(0, 6)}`}
                                                </span>
                                            </div>
                                            <span className="text-gray-600 text-[10px] flex-shrink-0">
                                                {Math.round((Date.now() - event.timestamp) / 1000)}s
                                            </span>
                                        </div>
                                    );
                                })}
                                {events.length === 0 && (
                                    <div className="text-gray-500 text-xs text-center py-4">
                                        Waiting for gossip events...
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Overlay - Collapsible */}
            <div className="absolute bottom-4 right-4 pointer-events-auto">
                <div className="bg-black/80 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden">
                    <button
                        onClick={() => setShowTopology(!showTopology)}
                        className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors"
                    >
                        <span className="text-xs font-medium text-gray-400">Network Topology</span>
                        {showTopology ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        )}
                    </button>
                    {showTopology && (
                        <div className="px-3 pb-3">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                    <span className="text-xs text-gray-300">Online</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                                    <span className="text-xs text-gray-300">Delinquent</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                                    <span className="text-xs text-gray-300">Offline</span>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-white/10">
                                <div className="text-[10px] text-gray-500">
                                    {nodeCoords.length} nodes • ~{Math.round(events.length / 5 * 60)} events/min
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom scrollbar styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}</style>
        </div>
    );
}
