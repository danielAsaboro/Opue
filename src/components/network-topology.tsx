'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Network,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Circle,
} from 'lucide-react'
import type { NetworkTopologyNode } from '@/types/pnode'

// Mock topology data
const generateMockTopology = (): NetworkTopologyNode[] => {
  const nodes: NetworkTopologyNode[] = [
    // Bootstrap nodes (center)
    { id: 'bootstrap-1', label: 'Bootstrap 1', type: 'bootstrap', status: 'online', peers: ['validator-1', 'validator-2', 'validator-3'], x: 400, y: 300 },
    // Validators
    { id: 'validator-1', label: 'Validator 1', type: 'validator', status: 'online', peers: ['bootstrap-1', 'pnode-1', 'pnode-2', 'rpc-1'], x: 200, y: 150 },
    { id: 'validator-2', label: 'Validator 2', type: 'validator', status: 'online', peers: ['bootstrap-1', 'pnode-3', 'pnode-4', 'rpc-2'], x: 600, y: 150 },
    { id: 'validator-3', label: 'Validator 3', type: 'validator', status: 'online', peers: ['bootstrap-1', 'pnode-5', 'pnode-6'], x: 400, y: 500 },
    // RPC nodes
    { id: 'rpc-1', label: 'RPC Node 1', type: 'rpc', status: 'online', peers: ['validator-1', 'pnode-1'], x: 100, y: 250 },
    { id: 'rpc-2', label: 'RPC Node 2', type: 'rpc', status: 'online', peers: ['validator-2', 'pnode-4'], x: 700, y: 250 },
    // pNodes
    { id: 'pnode-1', label: 'pNode US-E', type: 'pnode', status: 'online', peers: ['validator-1', 'rpc-1', 'pnode-2'], x: 150, y: 350 },
    { id: 'pnode-2', label: 'pNode US-W', type: 'pnode', status: 'online', peers: ['validator-1', 'pnode-1'], x: 250, y: 400 },
    { id: 'pnode-3', label: 'pNode EU-C', type: 'pnode', status: 'online', peers: ['validator-2', 'pnode-4'], x: 550, y: 350 },
    { id: 'pnode-4', label: 'pNode EU-W', type: 'pnode', status: 'offline', peers: ['validator-2', 'rpc-2', 'pnode-3'], x: 650, y: 400 },
    { id: 'pnode-5', label: 'pNode APAC', type: 'pnode', status: 'online', peers: ['validator-3', 'pnode-6'], x: 300, y: 550 },
    { id: 'pnode-6', label: 'pNode SA', type: 'pnode', status: 'online', peers: ['validator-3', 'pnode-5'], x: 500, y: 550 },
  ]
  return nodes
}

const nodeColors: Record<string, { fill: string; stroke: string }> = {
  bootstrap: { fill: '#8b5cf6', stroke: '#7c3aed' }, // Purple
  validator: { fill: '#3b82f6', stroke: '#2563eb' }, // Blue
  rpc: { fill: '#10b981', stroke: '#059669' }, // Green
  pnode: { fill: '#f59e0b', stroke: '#d97706' }, // Amber
}

const nodeRadius: Record<string, number> = {
  bootstrap: 24,
  validator: 20,
  rpc: 16,
  pnode: 14,
}

interface TooltipData {
  node: NetworkTopologyNode
  x: number
  y: number
}

export function NetworkTopology() {
  const [nodes, setNodes] = useState<NetworkTopologyNode[]>([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setNodes(generateMockTopology())
      setLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      setNodes(generateMockTopology())
      setLoading(false)
    }, 500)
  }

  const getConnections = () => {
    const connections: { from: NetworkTopologyNode; to: NetworkTopologyNode }[] = []
    const processed = new Set<string>()

    nodes.forEach((node) => {
      node.peers.forEach((peerId) => {
        const connectionKey = [node.id, peerId].sort().join('-')
        if (!processed.has(connectionKey)) {
          const peer = nodes.find((n) => n.id === peerId)
          if (peer) {
            connections.push({ from: node, to: peer })
            processed.add(connectionKey)
          }
        }
      })
    })

    return connections
  }

  const isConnectedToSelected = (nodeId: string) => {
    if (!selectedNode) return false
    const selected = nodes.find((n) => n.id === selectedNode)
    return selected?.peers.includes(nodeId) || nodeId === selectedNode
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Topology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[500px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const connections = getConnections()
  const onlineCount = nodes.filter((n) => n.status === 'online').length
  const pnodeCount = nodes.filter((n) => n.type === 'pnode').length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Topology
            </CardTitle>
            <CardDescription>
              Visual representation of network connections
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" onClick={() => setZoom((z) => Math.min(2, z + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setZoom(1)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4 text-sm">
          {Object.entries(nodeColors).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-2">
              <Circle className="h-4 w-4" style={{ color: colors.fill, fill: colors.fill }} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <Badge variant="outline">{onlineCount}/{nodes.length} Online</Badge>
            <Badge variant="secondary">{pnodeCount} pNodes</Badge>
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="relative border rounded-lg bg-muted/20 overflow-hidden">
          <svg
            ref={svgRef}
            viewBox="0 0 800 650"
            className="w-full h-[500px]"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            {/* Connection lines */}
            {connections.map(({ from, to }, index) => {
              const isHighlighted = selectedNode && (isConnectedToSelected(from.id) && isConnectedToSelected(to.id))
              return (
                <line
                  key={index}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={isHighlighted ? '#3b82f6' : '#6b7280'}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={selectedNode ? (isHighlighted ? 0.8 : 0.2) : 0.4}
                  strokeDasharray={from.status === 'offline' || to.status === 'offline' ? '4,4' : 'none'}
                />
              )
            })}

            {/* Nodes */}
            {nodes.map((node) => {
              const colors = nodeColors[node.type]
              const radius = nodeRadius[node.type]
              const isSelected = node.id === selectedNode
              const isConnected = isConnectedToSelected(node.id)
              const opacity = selectedNode ? (isConnected ? 1 : 0.3) : 1

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer', opacity }}
                  onClick={() => setSelectedNode(isSelected ? null : node.id)}
                  onMouseEnter={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect()
                    if (rect) {
                      setTooltip({
                        node,
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top,
                      })
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Glow effect for selected */}
                  {isSelected && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke={colors.fill}
                      strokeWidth={2}
                      strokeOpacity={0.5}
                    />
                  )}
                  {/* Main circle */}
                  <circle
                    r={radius}
                    fill={node.status === 'online' ? colors.fill : '#6b7280'}
                    stroke={isSelected ? '#ffffff' : colors.stroke}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  {/* Status indicator */}
                  <circle
                    cx={radius - 4}
                    cy={-radius + 4}
                    r={5}
                    fill={node.status === 'online' ? '#22c55e' : '#ef4444'}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                  />
                  {/* Label */}
                  <text
                    y={radius + 16}
                    textAnchor="middle"
                    className="text-xs fill-current"
                    style={{ fontSize: '10px', fontWeight: 500 }}
                  >
                    {node.label}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="absolute bg-popover border rounded-lg shadow-lg p-3 z-10 pointer-events-none"
              style={{ left: tooltip.x + 10, top: tooltip.y + 10 }}
            >
              <p className="font-semibold">{tooltip.node.label}</p>
              <p className="text-xs text-muted-foreground capitalize">Type: {tooltip.node.type}</p>
              <p className="text-xs">
                Status:{' '}
                <span className={tooltip.node.status === 'online' ? 'text-green-500' : 'text-red-500'}>
                  {tooltip.node.status}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">Peers: {tooltip.node.peers.length}</p>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2 text-center">
          Click on a node to highlight its connections
        </p>
      </CardContent>
    </Card>
  )
}
