'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Circle, Tooltip, useMap } from 'react-leaflet'
import { LatLngTuple } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { PNode } from '@/types/pnode'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Map, Zap, Database, TrendingUp, Globe } from 'lucide-react'
import { formatBytes } from '@/lib/format'
import Link from 'next/link'

// Fix for default markers in react-leaflet
import L from 'leaflet'
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: () => string })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface GeographicHeatmapProps {
  pnodes: PNode[]
  className?: string
}

type ViewMode = 'storage' | 'performance' | 'decentralization' | 'uptime'

// Component to control map from outside
function MapController() {
  const map = useMap()

  // Fit map to show all markers
  useEffect(() => {
    // Center on a reasonable default for global view
    map.setView([20, 0], 2)
  }, [map])

  return null
}

export function GeographicHeatmap({ pnodes, className = '' }: GeographicHeatmapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('storage')
  const [capacityFilter, setCapacityFilter] = useState<number[]>([0, 100])
  const [selectedPNode, setSelectedPNode] = useState<PNode | null>(null)

  // Calculate statistics
  const stats = {
    totalStorage: pnodes.reduce((sum, p) => sum + p.storage.capacityBytes, 0),
    avgPerformance: pnodes.reduce((sum, p) => sum + p.performanceScore, 0) / pnodes.length || 0,
    decentralization: calculateDecentralizationScore(pnodes),
    regions: new Set(pnodes.map((p) => p.location).filter(Boolean)).size,
  }

  // Filter pNodes based on capacity
  const filteredPNodes = pnodes.filter((pnode) => {
    const capacityPercent = (pnode.storage.capacityBytes / 1024 ** 4 / 10) * 100 // Assuming 10TB max for scaling
    return capacityPercent >= capacityFilter[0] && capacityPercent <= capacityFilter[1]
  })

  // Get color and size based on view mode
  const getMarkerStyle = (pnode: PNode) => {
    const baseOpacity = 0.8

    switch (viewMode) {
      case 'storage':
        const storageRatio = pnode.storage.capacityBytes / 1024 ** 4 // TB
        const storageIntensity = Math.min(storageRatio / 5, 1) // Scale 0-5TB
        return {
          color: `hsl(${240 - storageIntensity * 60}, 70%, 50%)`, // Blue to purple
          radius: Math.max(10, Math.min(50, storageRatio * 3)),
          opacity: baseOpacity,
        }

      case 'performance':
        const perfIntensity = pnode.performanceScore / 100
        return {
          color: perfIntensity > 80 ? '#10b981' : perfIntensity > 60 ? '#f59e0b' : '#ef4444',
          radius: 15 + perfIntensity * 20,
          opacity: baseOpacity,
        }

      case 'decentralization':
        // Show nodes that contribute to decentralization (unique locations)
        const locationCount = pnodes.filter((p) => p.location === pnode.location).length
        const decentralizationScore = 1 / locationCount // Higher score for unique locations
        return {
          color: `hsl(${120 + decentralizationScore * 60}, 70%, 50%)`, // Green to yellow
          radius: 10 + decentralizationScore * 25,
          opacity: baseOpacity,
        }

      case 'uptime':
        const uptimeIntensity = pnode.performance.uptime / 100
        return {
          color: uptimeIntensity > 95 ? '#10b981' : uptimeIntensity > 85 ? '#f59e0b' : '#ef4444',
          radius: 12 + uptimeIntensity * 15,
          opacity: baseOpacity,
        }

      default:
        return { color: '#3b82f6', radius: 15, opacity: baseOpacity }
    }
  }

  // Get coordinates for pNode (simplified - would use real geo data)
  const getCoordinates = (pnode: PNode): LatLngTuple => {
    // This would be replaced with real geolocation data
    // For demo purposes, we'll use approximate coordinates based on location
    const locationCoords: Record<string, LatLngTuple> = {
      'US-East': [40.7128, -74.006],
      'US-West': [37.7749, -122.4194],
      'EU-Central': [50.1109, 8.6821],
      'Asia-Pacific': [-33.8688, 151.2093],
      Unknown: [20, 0],
    }

    return locationCoords[pnode.location || 'Unknown'] || [20 + Math.random() * 40, -180 + Math.random() * 360]
  }

  const viewModeOptions = [
    { value: 'storage', label: 'Storage Capacity', icon: Database, color: 'text-blue-600' },
    { value: 'performance', label: 'Performance Score', icon: TrendingUp, color: 'text-green-600' },
    { value: 'decentralization', label: 'Decentralization', icon: Globe, color: 'text-purple-600' },
    { value: 'uptime', label: 'Uptime', icon: Zap, color: 'text-amber-600' },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Map className="h-5 w-5" />
            Geographic Storage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Mode Selector */}
          <div className="flex flex-wrap gap-2">
            {viewModeOptions.map((option) => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={viewMode === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode(option.value as ViewMode)}
                  className="flex items-center gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </Button>
              )
            })}
          </div>

          {/* Capacity Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Storage Capacity Filter (TB)</label>
            <Slider
              value={capacityFilter}
              onValueChange={setCapacityFilter}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0TB</span>
              <span>
                {capacityFilter[0]} - {capacityFilter[1]}TB
              </span>
              <span>100TB+</span>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredPNodes.length}</div>
              <div className="text-xs text-muted-foreground">pNodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatBytes(stats.totalStorage)}</div>
              <div className="text-xs text-muted-foreground">Total Storage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.regions}</div>
              <div className="text-xs text-muted-foreground">Regions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{Math.round(stats.decentralization * 100)}%</div>
              <div className="text-xs text-muted-foreground">Decentralized</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      <Card>
        <CardContent className="p-0">
          <div className="h-96 md:h-[600px] w-full">
            <MapContainer center={[20, 0]} zoom={2} className="h-full w-full rounded-lg" zoomControl={true}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              <MapController />

              {filteredPNodes.map((pnode) => {
                const coords = getCoordinates(pnode)
                const style = getMarkerStyle(pnode)

                return (
                  <Circle
                    key={pnode.id}
                    center={coords}
                    radius={style.radius * 10000} // Scale for visibility
                    pathOptions={{
                      color: style.color,
                      fillColor: style.color,
                      fillOpacity: style.opacity,
                      weight: 2,
                    }}
                    eventHandlers={{
                      click: () => setSelectedPNode(pnode),
                    }}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent={false}>
                      <div className="text-center">
                        <div className="font-semibold">{pnode.id.slice(0, 8)}...</div>
                        <div className="text-sm">
                          {viewMode === 'storage' && `${formatBytes(pnode.storage.capacityBytes)} storage`}
                          {viewMode === 'performance' && `Score: ${pnode.performanceScore}/100`}
                          {viewMode === 'decentralization' && `${pnode.location || 'Unknown'}`}
                          {viewMode === 'uptime' && `${Math.round(pnode.performance.uptime)}% uptime`}
                        </div>
                      </div>
                    </Tooltip>
                  </Circle>
                )
              })}
            </MapContainer>
          </div>
        </CardContent>
      </Card>

      {/* Selected pNode Details */}
      {selectedPNode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>pNode Details</span>
              <Button variant="ghost" size="sm" onClick={() => setSelectedPNode(null)}>
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Identity</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>ID:</strong> {selectedPNode.id.slice(0, 16)}...
                  </div>
                  <div>
                    <strong>Location:</strong> {selectedPNode.location || 'Unknown'}
                  </div>
                  <div>
                    <strong>Version:</strong> {selectedPNode.version}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Metrics</h4>
                <div className="space-y-1 text-sm">
                  <div>
                    <strong>Performance:</strong> {selectedPNode.performanceScore}/100
                  </div>
                  <div>
                    <strong>Storage:</strong> {formatBytes(selectedPNode.storage.capacityBytes)}
                  </div>
                  <div>
                    <strong>Used:</strong> {formatBytes(selectedPNode.storage.usedBytes)}
                  </div>
                  <div>
                    <strong>Uptime:</strong> {Math.round(selectedPNode.performance.uptime)}%
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button asChild size="sm">
                <Link href={`/pnodes/${encodeURIComponent(selectedPNode.id)}`}>View Full Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Calculate decentralization score based on geographic distribution
function calculateDecentralizationScore(pnodes: PNode[]): number {
  if (pnodes.length === 0) return 0

  const locations = pnodes.map((p) => p.location).filter(Boolean)
  // Used for Gini coefficient calculation below
  void new Set(locations)

  // Calculate Gini coefficient for storage distribution across locations
  const locationStorage: Record<string, number> = {}
  pnodes.forEach((pnode) => {
    const location = pnode.location || 'Unknown'
    locationStorage[location] = (locationStorage[location] || 0) + pnode.storage.capacityBytes
  })

  const storageValues = Object.values(locationStorage).sort((a, b) => a - b)
  const n = storageValues.length
  let sum = 0

  storageValues.forEach((value, i) => {
    sum += (i + 1) * value
  })

  const mean = storageValues.reduce((a, b) => a + b, 0) / n
  const gini = (2 * sum) / (n * n * mean) - (n + 1) / n

  // Return decentralization score (1 - gini coefficient, higher is more decentralized)
  return Math.max(0, Math.min(1, 1 - gini))
}











