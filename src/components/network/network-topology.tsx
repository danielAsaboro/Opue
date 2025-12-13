'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PNode } from '@/types/pnode';
import { cn } from '@/lib/utils';

interface NetworkTopologyProps {
    pnodes: PNode[];
}

interface NodePoint {
    id: string;
    x: number;
    y: number;
    status: string;
    region: string;
    connections: string[]; // IDs of connected nodes
}

export function NetworkTopology({ pnodes }: NetworkTopologyProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<NodePoint[]>([]);
    const [hoveredNode, setHoveredNode] = useState<NodePoint | null>(null);

    useEffect(() => {
        if (!containerRef.current || pnodes.length === 0) return;

        const width = containerRef.current.clientWidth;
        const height = 600; // Fixed height
        const padding = 50;

        // Group nodes by region to cluster them
        const regions = Array.from(new Set(pnodes.map(p => p.location || 'Unknown')));
        const regionCenters: Record<string, { x: number; y: number }> = {};

        // Assign random centers for regions
        regions.forEach((region, i) => {
            const angle = (i / regions.length) * 2 * Math.PI;
            const radius = Math.min(width, height) * 0.35;
            regionCenters[region] = {
                x: width / 2 + Math.cos(angle) * radius,
                y: height / 2 + Math.sin(angle) * radius,
            };
        });

        // Generate node positions with clustering
        const newNodes: NodePoint[] = pnodes.map((pnode) => {
            const region = pnode.location || 'Unknown';
            const center = regionCenters[region];

            // Random offset from region center
            const offsetRadius = Math.random() * 80;
            const offsetAngle = Math.random() * 2 * Math.PI;

            return {
                id: pnode.id,
                x: Math.max(padding, Math.min(width - padding, center.x + Math.cos(offsetAngle) * offsetRadius)),
                y: Math.max(padding, Math.min(height - padding, center.y + Math.sin(offsetAngle) * offsetRadius)),
                status: pnode.status,
                region,
                connections: [], // Will populate next
            };
        });

        // Generate simulated connections (gossip protocol simulation)
        // Connect to 2-3 random nodes in same region, and 1-2 in other regions
        newNodes.forEach(node => {
            const sameRegion = newNodes.filter(n => n.region === node.region && n.id !== node.id);
            const otherRegion = newNodes.filter(n => n.region !== node.region);

            // Connect to local peers
            const localPeers = shuffle(sameRegion).slice(0, 2);
            localPeers.forEach(peer => {
                if (!node.connections.includes(peer.id)) {
                    node.connections.push(peer.id);
                }
            });

            // Connect to remote peers (bridge nodes)
            if (Math.random() > 0.7 && otherRegion.length > 0) {
                const remotePeer = otherRegion[Math.floor(Math.random() * otherRegion.length)];
                if (!node.connections.includes(remotePeer.id)) {
                    node.connections.push(remotePeer.id);
                }
            }
        });

        setNodes(newNodes);
    }, [pnodes]);

    // Helper to shuffle array
    function shuffle<T>(array: T[]): T[] {
        return array.sort(() => Math.random() - 0.5);
    }

    return (
        <div
            ref={containerRef}
            className="relative w-full h-[600px] bg-black/40 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm"
        >
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Connections */}
                {nodes.map(node =>
                    node.connections.map(targetId => {
                        const target = nodes.find(n => n.id === targetId);
                        if (!target) return null;

                        // Only draw line once (id comparison)
                        if (node.id > targetId) return null;

                        const isHovered = hoveredNode && (hoveredNode.id === node.id || hoveredNode.id === targetId);

                        return (
                            <motion.line
                                key={`${node.id}-${targetId}`}
                                x1={node.x}
                                y1={node.y}
                                x2={target.x}
                                y2={target.y}
                                stroke={isHovered ? "rgba(139, 92, 246, 0.6)" : "rgba(255, 255, 255, 0.05)"}
                                strokeWidth={isHovered ? 2 : 1}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        );
                    })
                )}
            </svg>

            {/* Nodes */}
            {nodes.map(node => (
                <motion.div
                    key={node.id}
                    className={cn(
                        "absolute w-3 h-3 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300",
                        node.status === 'online' ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" :
                            node.status === 'delinquent' ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" :
                                "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                        hoveredNode?.id === node.id ? "scale-150 z-20" : "scale-100 z-10"
                    )}
                    style={{ left: node.x, top: node.y }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                />
            ))}

            {/* Tooltip */}
            {hoveredNode && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-30 pointer-events-none bg-gray-900/90 border border-white/10 p-3 rounded-lg backdrop-blur-md shadow-xl"
                    style={{ left: hoveredNode.x + 15, top: hoveredNode.y - 15 }}
                >
                    <div className="text-sm font-bold text-white mb-1">pNode</div>
                    <div className="text-xs text-gray-400 font-mono mb-2">{hoveredNode.id.slice(0, 12)}...</div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            hoveredNode.status === 'online' ? "bg-emerald-500" :
                                hoveredNode.status === 'delinquent' ? "bg-amber-500" : "bg-red-500"
                        )} />
                        <span className="capitalize text-gray-300">{hoveredNode.status}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{hoveredNode.region}</div>
                </motion.div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm p-3 rounded-lg border border-white/10">
                <div className="text-xs font-medium text-gray-400 mb-2">Network Topology</div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                        <span className="text-xs text-gray-300">Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]" />
                        <span className="text-xs text-gray-300">Delinquent</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]" />
                        <span className="text-xs text-gray-300">Offline</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
