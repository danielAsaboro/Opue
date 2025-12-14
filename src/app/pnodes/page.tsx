'use client'

import { useState, useEffect } from 'react'
import { usePNodes } from '@/hooks/usePNodes'
import { PNodeTable } from '@/components/pnodes/pnode-table'
import { PNodeCard } from '@/components/pnodes/pnode-card'
import { PNodeMap } from '@/components/pnodes/pnode-map'
import { PNodeFilters } from '@/components/pnodes/pnode-filters'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { FullPageError } from '@/components/ui/error-display'
import { LayoutGrid, Table, Star, TrendingUp, Map } from 'lucide-react'
import { getFavorites, toggleFavorite } from '@/lib/favorites'
import { formatBytes, formatPercentage } from '@/lib/format'
import { ExportDialog } from '@/components/export-dialog'
import type { PNode } from '@/types/pnode'
import Link from 'next/link'

export default function PNodesPage() {
  const { data: allPNodes, isLoading, error, refetch } = usePNodes()
  const [filteredPNodes, setFilteredPNodes] = useState<PNode[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'map'>('table')
  const [favorites, setFavorites] = useState<string[]>([])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  useEffect(() => {
    setFavorites(getFavorites())
  }, [])

  useEffect(() => {
    if (allPNodes) {
      setFilteredPNodes(allPNodes)
    }
  }, [allPNodes])

  const handleToggleFavorite = (id: string) => {
    toggleFavorite(id)
    setFavorites(getFavorites())
  }

  const displayPNodes = showFavoritesOnly ? filteredPNodes.filter((p) => favorites.includes(p.id)) : filteredPNodes

  // Get top performers
  const topPerformers = allPNodes
    ? [...allPNodes].sort((a, b) => b.performanceScore - a.performanceScore).slice(0, 5)
    : []

  // Show error state
  if (error && !isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">pNode Explorer</h1>
          <p className="text-muted-foreground mt-2">Browse and analyze all storage providers</p>
        </div>
        <FullPageError error={error} onRetry={() => refetch()} />
      </div>
    )
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-48 mt-2" />
        </div>
        <Skeleton className="h-32" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">pNode Explorer</h1>
          <p className="text-muted-foreground mt-2">
            {displayPNodes.length} of {allPNodes?.length || 0} pNodes
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ExportDialog pnodes={displayPNodes} />
        </div>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {topPerformers.map((pnode, index) => (
                <Link key={pnode.id} href={`/pnodes/${encodeURIComponent(pnode.id)}`}>
                  <div className="border rounded-lg p-3 hover:bg-accent transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {pnode.performanceScore}
                      </span>
                    </div>
                    <p className="text-xs font-mono truncate">{pnode.id}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatBytes(pnode.storage.capacityBytes)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      {allPNodes && <PNodeFilters pnodes={allPNodes} onFilterChange={setFilteredPNodes} />}

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>
            <Table className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button variant={viewMode === 'map' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('map')}>
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>

        <Button
          variant={showFavoritesOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          disabled={favorites.length === 0}
        >
          <Star className={`h-4 w-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          Favorites ({favorites.length})
        </Button>
      </div>

      {/* Content */}
      {viewMode === 'table' && <PNodeTable pnodes={displayPNodes} isLoading={false} />}

      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayPNodes.map((pnode) => (
            <PNodeCard
              key={pnode.id}
              pnode={pnode}
              isFavorite={favorites.includes(pnode.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {viewMode === 'map' && <PNodeMap pnodes={displayPNodes} />}
    </div>
  )
}
